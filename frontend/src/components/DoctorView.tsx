'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { BranchLocation } from '@/lib/ph-constants';
import { FhirService } from '@/lib/fhir-service';
import {
  Stethoscope,
  FileText,
  CheckCircle2,
  Printer,
  AlertCircle,
  Loader2,
  ArrowRight,
  Activity,
  History,
  AlertTriangle,
  Receipt,
  TestTube,
} from 'lucide-react';
import { PrintablePrescriptionModal, PrescriptionItem } from './PrintablePrescriptionModal';

interface DoctorViewProps {
  branch: BranchLocation;
  onNavigateToBilling?: () => void;
}

export function DoctorView({ branch, onNavigateToBilling }: DoctorViewProps) {
  const [selectedPatient, setSelectedPatient] = useState({
    id: 'pat-101',
    name: 'Juan Dela Cruz',
    age: 67,
    gender: 'Male',
    bloodType: 'O+',
    allergies: 'Penicillin, Mefenamic Acid (NSAIDs)',
    vitals: { bp: '130/85 mmHg', hr: '78 bpm', temp: '36.6 °C', spo2: '98%', weight: '68 kg', bmi: '25.0' },
    chiefComplaint: '2-week history of productive cough, mild shortness of breath, and fatigue.',
    philhealth: '12-345678901-2',
    seniorId: 'OSCA-MKT-2021-9982',
    address: 'East Tapinac, Olongapo City, Zambales',
  });

  const [soap, setSoap] = useState({
    subjective: 'Patient reports persistent cough with yellowish sputum for 14 days. Denies chest pain or hemoptysis. Smoker (10 pack-years, quit 2 years ago).',
    objective: 'Chest examination reveals bilateral coarse crackles in lower lobes. S1 and S2 regular. No wheezing. Abdomen soft, non-tender.',
    assessment: 'J18.9 - Community-Acquired Pneumonia, Low Risk (CAP-LR); I10 - Essential Hypertension',
    plan: '1. Amoxicillin/Clavulanate 1g tab PO BID x 7 days\n2. Acetylcysteine 600mg effervescent tab OD x 5 days\n3. Continue Losartan 50mg tab PO OD every morning\n4. Chest X-Ray PA View in 1 week\n5. Repeat consultation after 7 days',
  });

  const [selectedLabs, setSelectedLabs] = useState<string[]>([
    'Chest X-Ray PA View',
    'Complete Blood Count (CBC)',
  ]);

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
      instructions: 'Take 1 tablet every 12 hours after meals.',
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

  const toggleLab = (lab: string) => {
    setSelectedLabs((prev) =>
      prev.includes(lab) ? prev.filter((l) => l !== lab) : [...prev, lab]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
      {/* Left Column: Waiting Queue, Vitals, & Patient Longitudinal Info */}
      <div className="lg:col-span-4 space-y-2.5">
        {/* 1. Consultation Queue */}
        <div className="rounded border border-slate-200 bg-white p-2.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-cyan-700" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Consultation Queue
              </h3>
            </div>
            <span className="rounded bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 border border-slate-200">
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
                    ? 'border-cyan-700 bg-cyan-50/50 text-slate-900 font-medium shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-900">{p.name} ({p.age}y)</span>
                  <span className="text-[10px] text-slate-500 font-mono">{p.time}</span>
                </div>
                <div className="flex justify-between items-center mt-1 text-[10px] text-slate-500">
                  <span className={selectedPatient.id === p.id ? 'font-semibold text-cyan-800' : ''}>{p.status}</span>
                  {p.senior && (
                    <span className="rounded bg-amber-50 px-1 py-0.2 text-[9px] font-bold text-amber-800 border border-amber-200">
                      SC RA 9994
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Patient Safety & Allergy Card */}
        <div className="rounded border border-slate-200 bg-white p-2.5 shadow-2xs">
          <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            <span>Patient Safety & Clinical Flags</span>
          </div>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="rounded border border-rose-200 bg-rose-50/60 p-2 text-rose-900">
              <span className="font-bold text-[10px] uppercase tracking-wider block text-rose-700">Allergies:</span>
              <span className="font-semibold text-xs">{selectedPatient.allergies}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">Blood Group</span>
                <span className="font-bold text-slate-900">{selectedPatient.bloodType}</span>
              </div>
              <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">PhilHealth Status</span>
                <span className="font-bold text-emerald-800">Konsulta Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Triage Vitals Bar for Selected Patient */}
        <div className="rounded border border-slate-200 bg-white p-2.5 shadow-2xs text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
            <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-700 flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-teal-600" />
              <span>Triage Vitals (LOINC Coded)</span>
            </h4>
            <span className="text-[9px] text-slate-400 font-mono">09:18 AM</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
            <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-[9px] text-slate-500 block uppercase font-medium">Blood Pressure</span>
              <strong className="text-slate-900 font-mono text-xs">{selectedPatient.vitals.bp}</strong>
              <span className="text-[8px] text-amber-700 font-semibold block">Stage 1 HTN</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-[9px] text-slate-500 block uppercase font-medium">Pulse Rate</span>
              <strong className="text-slate-900 font-mono text-xs">{selectedPatient.vitals.hr}</strong>
              <span className="text-[8px] text-emerald-700 font-semibold block">Normal Rhythm</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-[9px] text-slate-500 block uppercase font-medium">Body Temp</span>
              <strong className="text-slate-900 font-mono text-xs">{selectedPatient.vitals.temp}</strong>
              <span className="text-[8px] text-slate-500 block">Afebrile</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-[9px] text-slate-500 block uppercase font-medium">Oxygen Sat (SpO2)</span>
              <strong className="text-slate-900 font-mono text-xs">{selectedPatient.vitals.spo2}</strong>
              <span className="text-[8px] text-emerald-700 font-semibold block">Adequate</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-[9px] text-slate-500 block uppercase font-medium">Weight</span>
              <strong className="text-slate-900 font-mono text-xs">{selectedPatient.vitals.weight}</strong>
              <span className="text-[8px] text-slate-500 block">kg</span>
            </div>
            <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
              <span className="text-[9px] text-slate-500 block uppercase font-medium">Body Mass Index</span>
              <strong className="text-slate-900 font-mono text-xs">{selectedPatient.vitals.bmi}</strong>
              <span className="text-[8px] text-amber-700 font-semibold block">Overweight</span>
            </div>
          </div>
        </div>

        {/* 4. Longitudinal Clinical Timeline / Past Visits */}
        <div className="rounded border border-slate-200 bg-white p-2.5 shadow-2xs text-xs">
          <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-700">
            <History className="h-3.5 w-3.5 text-cyan-700" />
            <span>Previous Encounters</span>
          </div>
          <div className="mt-2 space-y-1.5">
            <div className="p-1.5 rounded border border-slate-100 bg-slate-50 text-[11px]">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Aug 12, 2026</span>
                <span className="text-slate-500 font-mono text-[10px]">enc-8812</span>
              </div>
              <p className="text-slate-600 mt-0.5">Dx: Essential Hypertension; Losartan 50mg renewed.</p>
            </div>
            <div className="p-1.5 rounded border border-slate-100 bg-slate-50 text-[11px]">
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Apr 05, 2026</span>
                <span className="text-slate-500 font-mono text-[10px]">enc-7210</span>
              </div>
              <p className="text-slate-600 mt-0.5">Dx: Acute Bronchitis; Co-Amoxiclav 625mg completed.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: SOAP Encounter Documentation, Orders, & Licensing */}
      <div className="lg:col-span-8 space-y-2.5">
        <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-900">{selectedPatient.name}</h3>
                <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 border border-amber-200">
                  SC: {selectedPatient.seniorId}
                </span>
                <span className="rounded bg-blue-50 px-1.5 py-0.2 text-[10px] font-bold text-blue-800 border border-blue-200">
                  {selectedPatient.gender}, {selectedPatient.age}y
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                PhilHealth PIN: <span className="font-mono text-slate-700">{selectedPatient.philhealth}</span> &bull; {selectedPatient.address}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={loading}
                onClick={handleSignConsultation}
                className="flex items-center gap-1 rounded bg-cyan-700 px-3 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-cyan-800 transition disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
                <span>Sign Encounter</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRxModal(true)}
                className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                <Printer className="h-3.5 w-3.5 text-slate-500" />
                <span>Print Rx</span>
              </button>
              {onNavigateToBilling && (
                <button
                  type="button"
                  onClick={onNavigateToBilling}
                  className="flex items-center gap-1 rounded border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-800 hover:bg-purple-100 transition shadow-2xs"
                >
                  <Receipt className="h-3.5 w-3.5 text-purple-600" />
                  <span>To Billing</span>
                </button>
              )}
            </div>
          </div>

          {rxSaved && (
            <div className="my-2 rounded border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Encounter signed and synchronized to Medplum FHIR R4 CDR.</span>
              </div>
              {createdRecords && (
                <span className="font-mono text-[10px] text-emerald-800">
                  Ref: {createdRecords.conditionId} &bull; {createdRecords.rxId}
                </span>
              )}
            </div>
          )}

          {/* SOAP Clinical Documentation */}
          <div className="mt-2.5 space-y-2.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  (S) Subjective & Chief Complaint
                </label>
                <textarea
                  rows={3}
                  value={soap.subjective}
                  onChange={(e) => setSoap({ ...soap, subjective: e.target.value })}
                  className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700 leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  (O) Objective & Physical Exam
                </label>
                <textarea
                  rows={3}
                  value={soap.objective}
                  onChange={(e) => setSoap({ ...soap, objective: e.target.value })}
                  className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700 leading-relaxed"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  (A) Assessment & ICD-10 Diagnoses
                </label>
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-slate-400">Quick ICD:</span>
                  <button
                    type="button"
                    onClick={() => setSoap({ ...soap, assessment: soap.assessment + '; J06.9 (Acute URI)' })}
                    className="rounded bg-slate-100 hover:bg-slate-200 px-1 py-0.2 text-[9px] font-medium text-slate-700"
                  >
                    + J06.9
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoap({ ...soap, assessment: soap.assessment + '; E11.9 (Type 2 DM)' })}
                    className="rounded bg-slate-100 hover:bg-slate-200 px-1 py-0.2 text-[9px] font-medium text-slate-700"
                  >
                    + E11.9
                  </button>
                  <button
                    type="button"
                    onClick={() => setSoap({ ...soap, assessment: soap.assessment + '; O26.9 (Pregnancy Related)' })}
                    className="rounded bg-slate-100 hover:bg-slate-200 px-1 py-0.2 text-[9px] font-medium text-slate-700"
                  >
                    + O26.9
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={soap.assessment}
                onChange={(e) => setSoap({ ...soap, assessment: e.target.value })}
                className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-1 focus:ring-cyan-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                (P) Treatment Plan & Philippine e-Prescription (Generic Act RA 6675)
              </label>
              <textarea
                rows={4}
                value={soap.plan}
                onChange={(e) => setSoap({ ...soap, plan: e.target.value })}
                className="w-full font-mono rounded border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700 leading-relaxed"
              />
            </div>
          </div>

          {/* Diagnostic & Laboratory Order Requisition */}
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2">
              <TestTube className="h-3.5 w-3.5 text-cyan-700" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                Diagnostic & Laboratory Requisitions
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              {[
                'Chest X-Ray PA View',
                'Complete Blood Count (CBC)',
                'Routine Urinalysis',
                'Fasting Blood Sugar (FBS)',
                'Pelvic Ultrasound',
                'Pap Smear Screening',
                'Lipid Profile',
                'Serum Creatinine',
              ].map((lab) => {
                const isChecked = selectedLabs.includes(lab);
                return (
                  <label
                    key={lab}
                    className={`flex items-center gap-1.5 p-1.5 rounded border text-[11px] font-medium cursor-pointer transition ${
                      isChecked
                        ? 'border-cyan-700 bg-cyan-50/60 text-cyan-900 font-semibold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleLab(lab)}
                      className="rounded text-cyan-700 focus:ring-cyan-600"
                    />
                    <span className="truncate">{lab}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Philippine Statutory Prescription Footer Info */}
          <div className="mt-3 rounded border border-slate-200 p-2 bg-slate-50 text-[10px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
            <div><span className="font-semibold text-slate-800">Physician:</span> {physicianInfo.name}</div>
            <div><span className="font-semibold text-slate-800">PRC Lic:</span> {physicianInfo.prcNo}</div>
            <div><span className="font-semibold text-slate-800">PTR:</span> {physicianInfo.ptrNo}</div>
            <div><span className="font-semibold text-slate-800">S2 License:</span> {physicianInfo.s2No}</div>
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
