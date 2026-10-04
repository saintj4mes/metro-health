// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createReference } from '@medplum/core';
import type {
  Patient,
  Encounter,
  Observation,
  Condition,
  MedicationRequest,
  Invoice,
  Reference,
} from '@medplum/fhirtypes';
import { getMedplumClient } from './medplum';
import { BranchLocation } from './ph-constants';

export interface AdmissionInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  dob?: string;
  gender: 'male' | 'female' | 'other';
  contact: string;
  barangay: string;
  city: string;
  province: string;
  philhealth?: string;
  seniorOrPwd?: string;
  branch: BranchLocation;
}

export interface VitalsInput {
  patientId: string;
  encounterId?: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  temp: number;
  spo2: number;
  heightCm: number;
  weightKg: number;
  bmi: number;
}

export interface SoapInput {
  patientId: string;
  encounterId?: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  physicianName: string;
  prcLicense: string;
}

export interface BillingInput {
  patientId: string;
  encounterId?: string;
  grossAmount: number;
  netPayable: number;
  discountType: string;
  discountAmount: number;
  receiptNumber: string;
}

/**
 * High-Level FHIR Service bridging Next.js Clinical UI with Medplum CDR
 */
export class FhirService {
  /**
   * 1. Register a Patient and create an Ambulatory Encounter tagged to a specific Clinic Branch
   */
  static async admitPatient(input: AdmissionInput): Promise<{ patient: Patient; encounter: Encounter }> {
    const medplum = getMedplumClient();

    const patientPayload: Patient = {
      resourceType: 'Patient',
      name: [
        {
          use: 'official',
          family: input.lastName,
          given: [input.firstName, ...(input.middleName ? [input.middleName] : [])],
        },
      ],
      gender: input.gender,
      birthDate: input.dob || '1990-01-01',
      telecom: [
        {
          system: 'phone',
          value: input.contact,
          use: 'mobile',
        },
      ],
      address: [
        {
          use: 'home',
          line: [input.barangay],
          city: input.city,
          state: input.province,
          country: 'Philippines',
        },
      ],
      identifier: [
        ...(input.philhealth
          ? [
              {
                system: 'https://philhealth.gov.ph/pin',
                value: input.philhealth,
                assigner: { display: 'PhilHealth' },
              },
            ]
          : []),
        ...(input.seniorOrPwd
          ? [
              {
                system: 'https://philippines.gov.ph/statutory-id',
                value: input.seniorOrPwd,
                assigner: { display: 'Office of Senior Citizens Affairs / PWD Office' },
              },
            ]
          : []),
      ],
    };

    let createdPatient: Patient;
    try {
      createdPatient = await medplum.createResource(patientPayload);
    } catch {
      // Fallback for offline / demo mode
      createdPatient = {
        ...patientPayload,
        id: `pat-${Date.now()}`,
      };
    }

    const encounterPayload: Encounter = {
      resourceType: 'Encounter',
      status: 'in-progress',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
        display: 'Ambulatory Outpatient Clinic',
      },
      subject: createReference(createdPatient),
      location: [
        {
          location: {
            reference: `Location/${input.branch.id}`,
            display: input.branch.name,
          },
          status: 'active',
        },
      ],
      period: {
        start: new Date().toISOString(),
      },
    };

    let createdEncounter: Encounter;
    try {
      createdEncounter = await medplum.createResource(encounterPayload);
    } catch {
      createdEncounter = {
        ...encounterPayload,
        id: `enc-${Date.now()}`,
      };
    }

    return { patient: createdPatient, encounter: createdEncounter };
  }

  /**
   * 2. Record Patient Vital Signs as LOINC-coded FHIR Observations
   */
  static async recordVitals(input: VitalsInput): Promise<Observation[]> {
    const medplum = getMedplumClient();
    const effectiveDateTime = new Date().toISOString();
    const patientRef: Reference<Patient> = { reference: `Patient/${input.patientId}` };

    const observations: Observation[] = [
      // Blood Pressure Panel (LOINC 85354-9)
      {
        resourceType: 'Observation',
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' }],
          text: 'Blood pressure',
        },
        subject: patientRef,
        effectiveDateTime,
        component: [
          {
            code: {
              coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }],
            },
            valueQuantity: { value: input.systolic, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
          },
          {
            code: {
              coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }],
            },
            valueQuantity: { value: input.diastolic, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
          },
        ],
      },
      // Heart Rate (LOINC 8867-4)
      {
        resourceType: 'Observation',
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] },
        subject: patientRef,
        effectiveDateTime,
        valueQuantity: { value: input.pulse, unit: '/min', system: 'http://unitsofmeasure.org', code: '/min' },
      },
      // Body Temperature (LOINC 8310-5)
      {
        resourceType: 'Observation',
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '8310-5', display: 'Body temperature' }] },
        subject: patientRef,
        effectiveDateTime,
        valueQuantity: { value: input.temp, unit: 'Cel', system: 'http://unitsofmeasure.org', code: 'Cel' },
      },
      // Oxygen Saturation SpO2 (LOINC 2708-6)
      {
        resourceType: 'Observation',
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '2708-6', display: 'Oxygen saturation' }] },
        subject: patientRef,
        effectiveDateTime,
        valueQuantity: { value: input.spo2, unit: '%', system: 'http://unitsofmeasure.org', code: '%' },
      },
      // Body Mass Index (LOINC 39156-5)
      {
        resourceType: 'Observation',
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
        code: { coding: [{ system: 'http://loinc.org', code: '39156-5', display: 'Body mass index' }] },
        subject: patientRef,
        effectiveDateTime,
        valueQuantity: { value: input.bmi, unit: 'kg/m2', system: 'http://unitsofmeasure.org', code: 'kg/m2' },
      },
    ];

    const results: Observation[] = [];
    for (const obs of observations) {
      try {
        const created = await medplum.createResource(obs);
        results.push(created);
      } catch {
        results.push({ ...obs, id: `obs-${Date.now()}-${Math.random().toString(36).substring(7)}` });
      }
    }

    return results;
  }

  /**
   * 3. Finalize Doctor Consultation: create Condition (ICD-10) and MedicationRequest (Rx)
   */
  static async signConsultation(input: SoapInput): Promise<{ condition: Condition; prescription: MedicationRequest }> {
    const medplum = getMedplumClient();
    const patientRef: Reference<Patient> = { reference: `Patient/${input.patientId}` };

    const conditionPayload: Condition = {
      resourceType: 'Condition',
      clinicalStatus: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
      },
      verificationStatus: {
        coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }],
      },
      code: {
        text: input.assessment,
      },
      subject: patientRef,
      recordedDate: new Date().toISOString(),
      note: [
        { text: `(Subjective): ${input.subjective}` },
        { text: `(Objective): ${input.objective}` },
      ],
    };

    let createdCondition: Condition;
    try {
      createdCondition = await medplum.createResource(conditionPayload);
    } catch {
      createdCondition = { ...conditionPayload, id: `cond-${Date.now()}` };
    }

    const prescriptionPayload: MedicationRequest = {
      resourceType: 'MedicationRequest',
      status: 'active',
      intent: 'order',
      subject: patientRef,
      authoredOn: new Date().toISOString(),
      requester: {
        display: `${input.physicianName} (PRC #${input.prcLicense})`,
      },
      note: [{ text: input.plan }],
    };

    let createdRx: MedicationRequest;
    try {
      createdRx = await medplum.createResource(prescriptionPayload);
    } catch {
      createdRx = { ...prescriptionPayload, id: `rx-${Date.now()}` };
    }

    return { condition: createdCondition, prescription: createdRx };
  }

  /**
   * 4. Record Cashier Payment as a FHIR Invoice
   */
  static async recordPayment(input: BillingInput): Promise<Invoice> {
    const medplum = getMedplumClient();

    const invoicePayload: Invoice = {
      resourceType: 'Invoice',
      status: 'balanced',
      subject: { reference: `Patient/${input.patientId}` },
      date: new Date().toISOString(),
      identifier: [
        {
          system: 'https://metrohealth.ph/or-number',
          value: input.receiptNumber,
          assigner: { display: 'Metro Health Cashier' },
        },
      ],
      totalGross: {
        value: input.grossAmount,
        currency: 'PHP',
      },
      totalNet: {
        value: input.netPayable,
        currency: 'PHP',
      },
      note: [
        {
          text: `Statutory discount privilege applied: ${input.discountType}. Discount amount: PHP ${input.discountAmount.toFixed(2)}`,
        },
      ],
    };

    try {
      return await medplum.createResource(invoicePayload);
    } catch {
      return { ...invoicePayload, id: `inv-${Date.now()}` };
    }
  }
}
