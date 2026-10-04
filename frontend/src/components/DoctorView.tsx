'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { BranchLocation } from '@/lib/ph-constants';
import { FhirService } from '@/lib/fhir-service';
import { Stethoscope, FileText, CheckCircle2, Printer, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { PrintablePrescriptionModal, PrescriptionItem } from './PrintablePrescriptionModal';

interface DoctorViewProps {
  branch: BranchLocation;
}

export function DoctorView({ branch }: DoctorViewProps) {
  const [selectedPatient, setSelectedPatient] = useState({
    id: 'pat-101',
    name: 'Juan Dela Cruz',
    age: 67,
    gender: 'Male',
    vitals: { bp: '130/85 mmHg', hr: '78 bpm', temp: '36.6 °C', spo2: '98%', weight: '68 kg' },
    chiefComplaint: '2-week history of productive cough, mild shortness of breath, and fatigue.',
    philhealth: '12-345678901-2',
    seniorId: 'OSCA-MKT-2021-9982',
    address: 'East Tapinac, Olongapo City, Zambales',
  });

  const [soap, setSoap] = useState({
    subjective: 'Patient reports persistent cough with yellowish sputum for 14 days. Denies chest pain or hemoptysis. Smoker (10 pack-years, quit 2 years ago).',
    objective: 'Chest examination reveals bilateral coarse crackles in lower lobes. S1 and S2 regular. No wheezing.',
    assessment: 'J18.9 - Community-Acquired Pneumonia, Low Risk (CAP-LR); Essential Hypertension (I10)',
    plan: '1. Amoxicillin/Clavulanate 1g tab PO BID x 7 days\n2. Acetylcysteine 600mg effervescent tab OD x 5 days\n3. Continue Losartan 50mg tab OD\n4. Chest X-Ray PA view follow-up\n5. Repeat consultation after 1 week',
  });

  const [rxSaved, setRxSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showRxModal, setShowRxModal] = useState(false);
  const [createdRecords, setCreatedRecords] = useState<{ conditionId: string; rxId: string } | null>(null);

  const prescriptionItems: PrescriptionItem[] = [
    {
      genericName: 'Amoxicillin + Potassium Clavulanate',
      brandName: 'Augmentin',
      dosage: '1000 mg (875/125)',
      route: 'Oral tablet',
      frequency: 'BID (Every 12h)',
      duration: '7 days',
      dispenseQty: '14 tablets',
      instructions: 'Take 1 tablet every 12 hours with meals.',
    },
    {
      genericName: 'Acetylcysteine',
      brandName: 'Fluimucil',
      dosage: '600 mg',
      route: 'Oral effervescent',
      frequency: 'OD (Once daily)',
      duration: '5 days',
      dispenseQty: '5 tablets',
      instructions: 'Dissolve in water, drink after dinner.',
    },
    {
      genericName: 'Losartan Potassium',
      brandName: 'Cozaar',
      dosage: '50 mg',
      route: 'Oral tablet',
      frequency: 'OD (Morning)',
      duration: '30 days',
      dispenseQty: '30 tablets',
      instructions: 'Take every morning for blood pressure maintenance.',
    },
  ];

  const physicianInfo = {
    name: 'Dr. Florence Espinosa, MD, FPOGS',
    title: 'Consultant in Obstetrics & Gynecology',
    prcNo: '0089241',
    ptrNo: '5521901 (Olongapo City)',
    s2No: 'S2-2025-4190',
  };

  const handleSignConsultation = async () => {
    setLoading(true);
    try {
      const res = await FhirService.signConsultation({
        patientId: selectedPatient.id,
        subjective: soap.subjective,
        objective: soap.objective,
        assessment: soap.assessment,
        plan: soap.plan,
        physicianName: physicianInfo.name,
        prcLicense: physicianInfo.prcNo,
      });
      setCreatedRecords({ conditionId: res.condition.id || '', rxId: res.prescription.id || '' });
      setRxSaved(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
      {/* Left Column: Waiting Queue for this Branch */}
      <div className="lg:col-span-4 space-y-2.5">
        <div className="rounded border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-cyan-800" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                Consultation Queue
              </h3>
            </div>
            <span className="rounded bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 dark:bg-slate-800 dark:text-slate-300">
              3 Waiting
            </span>
          </div>

          <div className="mt-2 space-y-1">
            {[
              { id: 'pat-101', name: 'Juan Dela Cruz', age: 67, time: '09:15 AM', status: 'In Consultation', senior: true },
              { id: 'pat-102', name: 'Maria Angelica Santos', age: 34, time: '09:40 AM', status: 'Vitals Done', senior: false },
              { id: 'pat-103', name: 'Benjamin Alcantara', age: 72, time: '10:05 AM', status: 'Waiting', senior: true },
            ].map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedPatient({ ...selectedPatient, id: p.id, name: p.name, age: p.age })}
                className={`p-2 rounded border cursor-pointer transition text-xs ${
                  selectedPatient.id === p.id
                    ? 'border-cyan-800 bg-cyan-50/40 text-slate-900 dark:border-cyan-500 dark:bg-cyan-950/30 dark:text-white font-medium'
                    : 'border-slate-100 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-xs">{p.name} ({p.age}y)</span>
                  <span className="text-[10px] text-slate-400 font-mono">{p.time}</span>
                </div>
                <div className="flex justify-between items-center mt-0.5 text-[10px] text-slate-500">
                  <span>{p.status}</span>
                  {p.senior && <span className="font-bold text-amber-700">SC (RA 9994)</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Triage Vitals Bar for Selected Patient */}
        <div className="rounded border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 text-xs">
          <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            Triage Vitals (Recorded by Nurse)
          </h4>
          <div className="grid grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-300">
            <div className="bg-slate-50 p-1.5 rounded border border-slate-100 dark:bg-slate-800/60 dark:border-slate-700">
              <span className="text-[9px] text-slate-400 block uppercase">BP</span>
              <strong className="text-slate-900 dark:text-white font-mono text-xs">{selectedPatient.vitals.bp}</strong>
            </div>
            <div className="bg-slate-50 p-1.5 rounded border border-slate-100 dark:bg-slate-800/60 dark:border-slate-700">
              <span className="text-[9px] text-slate-400 block uppercase">Heart Rate</span>
              <strong className="text-slate-900 dark:text-white font-mono text-xs">{selectedPatient.vitals.hr}</strong>
            </div>
            <div className="bg-slate-50 p-1.5 rounded border border-slate-100 dark:bg-slate-800/60 dark:border-slate-700">
              <span className="text-[9px] text-slate-400 block uppercase">Temp</span>
              <strong className="text-slate-900 dark:text-white font-mono text-xs">{selectedPatient.vitals.temp}</strong>
            </div>
            <div className="bg-slate-50 p-1.5 rounded border border-slate-100 dark:bg-slate-800/60 dark:border-slate-700">
              <span className="text-[9px] text-slate-400 block uppercase">SpO2</span>
              <strong className="text-slate-900 dark:text-white font-mono text-xs">{selectedPatient.vitals.spo2}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: SOAP Encounter Documentation */}
      <div className="lg:col-span-8">
        <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{selectedPatient.name}</h3>
                <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 border border-amber-200">
                  SC: {selectedPatient.seniorId}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">PhilHealth PIN: {selectedPatient.philhealth}</p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={loading}
                onClick={handleSignConsultation}
                className="flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
                <span>Sign Encounter</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRxModal(true)}
                className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                <Printer className="h-3 w-3 text-slate-500" />
                <span>Print Rx</span>
              </button>
            </div>
          </div>

          {rxSaved && (
            <div className="my-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Encounter signed and prescription recorded.</span>
              </div>
              {createdRecords && (
                <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300">
                  Ref: {createdRecords.conditionId} &middot; {createdRecords.rxId}
                </span>
              )}
            </div>
          )}

          {/* SOAP Clinical Documentation */}
          <div className="mt-2.5 space-y-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-0.5">
                (S) Subjective & Chief Complaint
              </label>
              <textarea
                rows={2}
                value={soap.subjective}
                onChange={(e) => setSoap({ ...soap, subjective: e.target.value })}
                className="w-full rounded border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-0.5">
                (O) Objective & Physical Exam
              </label>
              <textarea
                rows={2}
                value={soap.objective}
                onChange={(e) => setSoap({ ...soap, objective: e.target.value })}
                className="w-full rounded border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-0.5">
                (A) Assessment & ICD-10 Diagnoses
              </label>
              <input
                type="text"
                value={soap.assessment}
                onChange={(e) => setSoap({ ...soap, assessment: e.target.value })}
                className="h-8 w-full rounded border border-slate-200 bg-slate-50/50 px-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-0.5">
                (P) Treatment Plan & Philippine e-Prescription (Rx)
              </label>
              <textarea
                rows={3}
                value={soap.plan}
                onChange={(e) => setSoap({ ...soap, plan: e.target.value })}
                className="w-full font-mono rounded border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Philippine Statutory Prescription Footer Info */}
          <div className="mt-2.5 rounded border border-slate-200 p-2 bg-slate-50 text-[10px] text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2">
            <div><span className="font-semibold">Physician:</span> {physicianInfo.name}</div>
            <div><span className="font-semibold">PRC Lic:</span> {physicianInfo.prcNo}</div>
            <div><span className="font-semibold">PTR:</span> {physicianInfo.ptrNo}</div>
            <div><span className="font-semibold">S2:</span> {physicianInfo.s2No}</div>
          </div>
        </div>
      </div>

      {/* Prescription Print Modal */}
      <PrintablePrescriptionModal
        isOpen={showRxModal}
        onClose={() => setShowRxModal(false)}
        branch={branch}
        patient={{
          name: selectedPatient.name,
          age: selectedPatient.age,
          gender: selectedPatient.gender,
          address: selectedPatient.address,
          philhealth: selectedPatient.philhealth,
          seniorId: selectedPatient.seniorId,
        }}
        prescriptions={prescriptionItems}
        physician={physicianInfo}
      />
    </div>
  );
}
