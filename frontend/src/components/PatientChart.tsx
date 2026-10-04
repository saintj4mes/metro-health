'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState, useEffect } from 'react';
import { BranchLocation, formatPhp } from '@/lib/ph-constants';
import { FhirService } from '@/lib/fhir-service';
import {
  FileText,
  Activity,
  Pill,
  History,
  AlertTriangle,
  Printer,
  CheckCircle2,
  Loader2,
  Calendar,
  Building2,
  User,
  Plus,
  ArrowLeft,
  Receipt,
  ShieldAlert,
  FileCode,
  Lock,
  X,
  ShieldCheck,
  Stethoscope,
  Heart,
  Syringe,
} from 'lucide-react';
import { PrintablePrescriptionModal, PrescriptionItem } from './PrintablePrescriptionModal';
import { PrintableBillingModal, BillingLineItem } from './PrintableBillingModal';
import { INITIAL_AUDIT_LOGS, AuditLogEntry } from '@/lib/audit-trail-store';

interface PatientChartProps {
  branch: BranchLocation;
  patientId?: string;
  initialTab?: 'soap' | 'vitals' | 'rx' | 'history' | 'billing' | 'audit';
  onBackToQueue?: () => void;
}

export function PatientChart({
  branch,
  patientId,
  initialTab = 'soap',
  onBackToQueue,
}: PatientChartProps) {
  const [activeTab, setActiveTab] = useState<'soap' | 'vitals' | 'rx' | 'history' | 'billing' | 'audit'>(initialTab);
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdRecords, setCreatedRecords] = useState<{ conditionId: string; rxId: string } | null>(null);
  const [selectedAuditJson, setSelectedAuditJson] = useState<AuditLogEntry | null>(null);

  // Modal print visibility
  const [showRxModal, setShowRxModal] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);

  // Active Patient Demographics
  const patient = {
    id: patientId || 'pat-101',
    name: 'Juan Dela Cruz',
    dob: '1959-04-12',
    age: 67,
    gender: 'Male',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Mefenamic Acid (NSAIDs)'],
    philhealth: '12-345678901-2',
    seniorId: 'OSCA-MKT-2021-9982',
    address: 'East Tapinac, Olongapo City, Zambales',
    contact: '+63 917 123 4567',
  };

  // SOAP Documentation State
  const [soap, setSoap] = useState({
    subjective:
      'Patient presents with a 2-week history of productive cough with yellowish sputum, low-grade fever, and progressive dyspnea on exertion. Denies chest pain, hemoptysis, or leg edema. Former smoker (10 pack-years, stopped 2024).',
    objective:
      'Vital signs noted: BP 130/85 mmHg, HR 78 bpm, Temp 36.6 °C, SpO2 98%. Chest auscultation reveals crackles over the left lower lung field. No wheezes or stridor. Heart sounds regular S1/S2, no murmurs. Abdomen soft, non-tender.',
    assessment: 'J18.9 - Community-Acquired Pneumonia, Low Risk (CAP-LR); I10 - Essential Hypertension',
    plan: '1. Amoxicillin + Clavulanic Acid 1g PO BID x 7 days\n2. Acetylcysteine 600mg effervescent tablet PO OD x 5 days\n3. Continue Losartan 50mg tab PO OD every morning\n4. Chest X-Ray PA View in 1 week\n5. Return for clinic follow-up after completing antibiotic course.',
  });

  // Vitals Flowsheet Data
  const vitalsHistory = [
    { date: 'Today, 01:15 PM', branch: 'Dr. Florence Espinosa Ob-Gyn Clinic', bp: '130/85', hr: 78, temp: '36.6', spo2: '98%', bmi: '25.0' },
    { date: 'Aug 14, 2026', branch: 'ACE Medical Center - Baypointe', bp: '128/82', hr: 76, temp: '36.5', spo2: '99%', bmi: '24.9' },
    { date: 'May 02, 2026', branch: 'Dr. Florence Espinosa Ob-Gyn Clinic', bp: '125/80', hr: 72, temp: '36.6', spo2: '98%', bmi: '24.8' },
  ];

  // Prescription List
  const prescriptionItems: PrescriptionItem[] = [
    {
      genericName: 'Amoxicillin + Potassium Clavulanate',
      brandName: 'Augmentin',
      dosage: '1000 mg (875/125)',
      route: 'Oral tablet',
      frequency: 'Every 12 hours (BID)',
      duration: '7 days',
      dispenseQty: '14 tablets',
      instructions: 'Take 1 tablet every 12 hours with meals until finished.',
    },
    {
      genericName: 'Acetylcysteine',
      brandName: 'Fluimucil',
      dosage: '600 mg',
      route: 'Oral effervescent',
      frequency: 'Once daily (OD)',
      duration: '5 days',
      dispenseQty: '5 effervescent tablets',
      instructions: 'Dissolve 1 tablet in half a glass of drinking water, drink after dinner.',
    },
    {
      genericName: 'Losartan Potassium',
      brandName: 'Cozaar',
      dosage: '50 mg',
      route: 'Oral tablet',
      frequency: 'Once daily (Morning)',
      duration: '30 days',
      dispenseQty: '30 tablets',
      instructions: 'Take 1 tablet every morning for blood pressure maintenance.',
    },
  ];

  // Billing Line Items
  const billingItems: BillingLineItem[] = [
    { id: 'item-1', description: 'Internal Medicine Specialist Consultation', category: 'Consultation', qty: 1, unitPrice: 1000, amount: 1000 },
    { id: 'item-2', description: 'Chest X-Ray PA View (Digital Diagnostic)', category: 'Diagnostic / Lab', qty: 1, unitPrice: 850, amount: 850 },
    { id: 'item-3', description: 'Complete Blood Count (CBC) with Platelet Count', category: 'Diagnostic / Lab', qty: 1, unitPrice: 350, amount: 350 },
    { id: 'item-4', description: 'Amoxicillin/Clavulanate 1g (14 tablets)', category: 'Pharmacy', qty: 14, unitPrice: 65, amount: 910 },
  ];

  const physicianInfo = {
    name: 'Dr. Florence Espinosa, MD, FPOGS',
    title: 'Consultant in Obstetrics & Gynecology',
    prcNo: '0089241',
    ptrNo: '5521901 (Olongapo City)',
    s2No: 'S2-2025-4190',
  };

  // Patient-specific Audit Logs (RA 10173 Compliance)
  const patientAuditLogs = INITIAL_AUDIT_LOGS.filter(
    (log) => log.patient?.id === patient.id || log.patient?.name === patient.name
  );

  useEffect(() => {
    // Real-time Electronic Audit Log Event per Republic Act No. 10173
    console.log(`[RA 10173 AuditEvent] Medical chart opened for patient: ${patient.name} (${patient.id}) at ${branch.name}.`);
  }, [patient.id, patient.name, branch.name]);

  const handleSignEncounter = async () => {
    setLoading(true);
    try {
      const res = await FhirService.signConsultation({
        patientId: patient.id,
        subjective: soap.subjective,
        objective: soap.objective,
        assessment: soap.assessment,
        plan: soap.plan,
        physicianName: 'Dr. Florence Espinosa, MD, FPOGS',
        prcLicense: '0089241',
      });
      setCreatedRecords({ conditionId: res.condition.id || '', rxId: res.prescription.id || '' });
      setSigned(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2.5">
      {/* Back to Queue Breadcrumb & Top Utility */}
      <div className="flex items-center justify-between">
        {onBackToQueue && (
          <button
            type="button"
            onClick={onBackToQueue}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Queue</span>
          </button>
        )}
        <div className="text-xs text-slate-500">
          Encounter Facility: <span className="font-semibold text-slate-800">{branch.name}</span>
        </div>
      </div>

      {/* 1. Persistent Patient Safety & Context Banner */}
      <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Patient Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-cyan-50 border border-cyan-200 text-cyan-800 font-bold text-sm">
              {patient.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-bold text-slate-900">{patient.name}</h1>
                <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700">
                  {patient.gender}, {patient.age}y &bull; DOB: {patient.dob}
                </span>
                <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700">
                  Blood: {patient.bloodType}
                </span>
                <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 border border-amber-200">
                  SC: {patient.seniorId}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span>PhilHealth PIN: <strong className="font-mono text-slate-700">{patient.philhealth}</strong></span>
                <span>&bull;</span>
                <span>{patient.address}</span>
              </div>
            </div>
          </div>

          {/* Critical Safety Alert: Allergies */}
          <div className="flex items-center gap-2 rounded border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs text-rose-900">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
            <div>
              <span className="font-bold uppercase tracking-wider text-[9px] text-rose-700 block">
                Known Drug Allergies:
              </span>
              <span className="font-bold text-xs">{patient.allergies.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Vitals Quick-Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">BP:</span>
              <strong className="font-mono text-slate-900 text-xs">130/85 mmHg</strong>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">HR:</span>
              <strong className="font-mono text-slate-900 text-xs">78 bpm</strong>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Temp:</span>
              <strong className="font-mono text-slate-900 text-xs">36.6 °C</strong>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">SpO2:</span>
              <strong className="font-mono text-slate-900 text-xs">98%</strong>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">BMI:</span>
              <strong className="font-mono text-slate-900 text-xs">25.0 kg/m²</strong>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={loading}
              onClick={handleSignEncounter}
              className="flex items-center gap-1 rounded bg-cyan-700 px-3 py-1 text-xs font-semibold text-white hover:bg-cyan-800 transition disabled:opacity-50 shadow-2xs"
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
            <button
              type="button"
              onClick={() => setShowBillingModal(true)}
              className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              <Receipt className="h-3.5 w-3.5 text-slate-500" />
              <span>Print SOA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Bar */}
      {signed && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Encounter signed and synchronized to Medplum FHIR R4 clinical record.</span>
          </div>
          {createdRecords && (
            <span className="font-mono text-[10px] text-emerald-800">
              Ref: {createdRecords.conditionId} &bull; {createdRecords.rxId}
            </span>
          )}
        </div>
      )}

      {/* 2. Clinical Workspace Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-4">
          {[
            { id: 'soap', label: 'SOAP Consultation', icon: FileText },
            { id: 'vitals', label: 'Vitals Flowsheet', icon: Activity },
            { id: 'rx', label: 'Prescriptions (Rx)', icon: Pill },
            { id: 'billing', label: 'Billing & Exemption', icon: Receipt },
            { id: 'history', label: 'Longitudinal History', icon: History },
            { id: 'audit', label: 'Access Audit Log', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-2 text-xs font-semibold border-b-2 transition ${
                  isActive
                    ? 'border-cyan-700 text-cyan-900'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Balanced 2-Column Clinical Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left Column: Longitudinal Summary & Problem List (Available across tabs) */}
        <div className="lg:col-span-4 space-y-2.5">
          {/* Active Problem List */}
          <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs text-xs">
            <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-700">
              <Stethoscope className="h-3.5 w-3.5 text-cyan-700" />
              <span>Active Problem List</span>
            </div>
            <div className="mt-2 space-y-1.5">
              <div className="p-2 rounded border border-slate-100 bg-slate-50">
                <div className="font-semibold text-slate-900">Essential Hypertension (I10)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Diagnosed 2021 &bull; Controlled on Losartan 50mg</div>
              </div>
              <div className="p-2 rounded border border-slate-100 bg-slate-50">
                <div className="font-semibold text-slate-900">Community-Acquired Pneumonia (J18.9)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Current Encounter &bull; Low Risk (CAP-LR)</div>
              </div>
            </div>
          </div>

          {/* Active Outpatient Medications */}
          <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs text-xs">
            <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-700">
              <Pill className="h-3.5 w-3.5 text-purple-700" />
              <span>Current Chronic Medications</span>
            </div>
            <div className="mt-2 space-y-1.5">
              <div className="p-2 rounded border border-slate-100 bg-slate-50">
                <div className="font-semibold text-slate-900">Losartan Potassium 50mg</div>
                <div className="text-[10px] text-slate-500">1 tab PO OD (Morning) &bull; Refills: 3 remaining</div>
              </div>
            </div>
          </div>

          {/* Immunization & Preventive Care Status */}
          <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs text-xs">
            <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-700">
              <Syringe className="h-3.5 w-3.5 text-emerald-700" />
              <span>Preventive Health & Vaccines</span>
            </div>
            <div className="mt-2 space-y-1 text-[11px] text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Pneumococcal (PCV20):</span>
                <span className="font-semibold text-emerald-800">Administered Jan 2024</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>Influenza Quadrivalent:</span>
                <span className="font-semibold text-emerald-800">Administered Nov 2025</span>
              </div>
              <div className="flex justify-between py-1">
                <span>PhilHealth Konsulta Check:</span>
                <span className="font-semibold text-cyan-800">Year 2026 Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Tab Workspaces */}
        <div className="lg:col-span-8 space-y-2.5">
          {/* TAB 1: SOAP Clinical Note */}
          {activeTab === 'soap' && (
            <div className="rounded border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Clinical SOAP Documentation (Medplum FHIR Encounter)
                </h3>
                <span className="text-[10px] text-slate-500">Encounter: enc-2026-9923</span>
              </div>

              <div className="space-y-2.5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {/* Subjective */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      (S) Subjective & Clinical History
                    </label>
                    <textarea
                      rows={4}
                      value={soap.subjective}
                      onChange={(e) => setSoap({ ...soap, subjective: e.target.value })}
                      className="w-full rounded border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700 leading-relaxed"
                    />
                  </div>

                  {/* Objective */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                      (O) Objective & Physical Examination
                    </label>
                    <textarea
                      rows={4}
                      value={soap.objective}
                      onChange={(e) => setSoap({ ...soap, objective: e.target.value })}
                      className="w-full rounded border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Assessment & ICD-10 */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      (A) Assessment & ICD-10 Diagnoses
                    </label>
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-slate-400">Add Code:</span>
                      <button
                        type="button"
                        onClick={() => setSoap({ ...soap, assessment: `${soap.assessment}; J06.9 Acute URI` })}
                        className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.2 hover:bg-slate-100 text-[10px]"
                      >
                        + J06.9 (Acute URI)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSoap({ ...soap, assessment: `${soap.assessment}; E11.9 Type 2 Diabetes` })}
                        className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.2 hover:bg-slate-100 text-[10px]"
                      >
                        + E11.9 (Type 2 DM)
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={soap.assessment}
                    onChange={(e) => setSoap({ ...soap, assessment: e.target.value })}
                    className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700"
                  />
                </div>

                {/* Plan */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      (P) Treatment Plan & Orders
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowRxModal(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-800 hover:underline"
                    >
                      <Printer className="h-3 w-3" />
                      <span>Open Rx Pad</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={soap.plan}
                    onChange={(e) => setSoap({ ...soap, plan: e.target.value })}
                    className="w-full font-mono rounded border border-slate-200 bg-white p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Vitals Flowsheet */}
          {activeTab === 'vitals' && (
            <div className="rounded border border-slate-200 bg-white shadow-2xs overflow-hidden">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  LOINC-Standard Longitudinal Vitals Flowsheet
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">3 Historical Observations</span>
              </div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Date / Time</th>
                    <th className="px-3 py-2">Clinic Branch</th>
                    <th className="px-3 py-2">BP (mmHg)</th>
                    <th className="px-3 py-2">HR (bpm)</th>
                    <th className="px-3 py-2">Temp (°C)</th>
                    <th className="px-3 py-2">SpO2</th>
                    <th className="px-3 py-2">BMI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                  {vitalsHistory.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-sans font-medium text-slate-900">{row.date}</td>
                      <td className="px-3 py-2 font-sans text-slate-600">{row.branch}</td>
                      <td className="px-3 py-2 font-bold">{row.bp}</td>
                      <td className="px-3 py-2">{row.hr}</td>
                      <td className="px-3 py-2">{row.temp}</td>
                      <td className="px-3 py-2">{row.spo2}</td>
                      <td className="px-3 py-2">{row.bmi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: e-Prescriptions */}
          {activeTab === 'rx' && (
            <div className="rounded border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Philippine Medical Prescriptions (Generics Act RA 6675)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowRxModal(true)}
                  className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                >
                  <Printer className="h-3 w-3 text-slate-500" />
                  <span>Print Official Rx Pad</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {prescriptionItems.map((rx, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">
                        {rx.genericName} <span className="font-normal text-slate-500 font-mono">({rx.dosage})</span>
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Sig: {rx.instructions} &bull; Duration: {rx.duration}
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-slate-900"># {rx.dispenseQty}</span>
                      <span className="block text-[10px] text-slate-400 font-sans">Dispense Qty</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded border border-slate-200 bg-slate-50 p-2.5 text-[10px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
                <div><strong>Physician:</strong> {physicianInfo.name}</div>
                <div><strong>PRC:</strong> {physicianInfo.prcNo}</div>
                <div><strong>PTR:</strong> {physicianInfo.ptrNo}</div>
                <div><strong>S2:</strong> {physicianInfo.s2No}</div>
              </div>
            </div>
          )}

          {/* TAB 4: Billing & Discounts */}
          {activeTab === 'billing' && (
            <div className="rounded border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Itemized Encounter Billing & Statutory Privileges
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Republic Act 9994 (Senior Citizen) & RA 10754 (PWD) discount computation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBillingModal(true)}
                  className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                >
                  <Printer className="h-3 w-3 text-slate-500" />
                  <span>Print Official Billing Slip</span>
                </button>
              </div>

              <table className="w-full text-left text-xs mb-3">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-2">Item Description</th>
                    <th className="py-2">Department</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {billingItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2 font-sans font-medium text-slate-900">{item.description}</td>
                      <td className="py-2 font-sans text-slate-500">{item.category}</td>
                      <td className="py-2 text-center">{item.qty}</td>
                      <td className="py-2 text-right">{formatPhp(item.unitPrice)}</td>
                      <td className="py-2 text-right font-bold text-slate-900">{formatPhp(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-slate-200 pt-2.5 flex justify-end">
                <div className="w-72 space-y-1 font-mono text-xs">
                  <div className="flex justify-between font-sans text-slate-600">
                    <span>Gross Subtotal:</span>
                    <span className="font-mono">{formatPhp(3110)}</span>
                  </div>
                  <div className="flex justify-between font-sans text-slate-600">
                    <span>Less 12% VAT Exemption:</span>
                    <span className="font-mono text-emerald-700">- {formatPhp(333.21)}</span>
                  </div>
                  <div className="flex justify-between font-sans text-emerald-800 font-semibold">
                    <span>Less 20% Senior Discount:</span>
                    <span className="font-mono">- {formatPhp(555.36)}</span>
                  </div>
                  <div className="border-t border-slate-300 pt-1.5 flex justify-between items-baseline font-sans font-bold text-slate-900">
                    <span>Net Amount Payable:</span>
                    <span className="text-sm font-mono text-cyan-900">{formatPhp(2221.43)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Longitudinal History */}
          {activeTab === 'history' && (
            <div className="rounded border border-slate-200 bg-white p-3.5 shadow-2xs space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100">
                Longitudinal Visit History Across Branches
              </h3>
              <div className="space-y-1.5 text-xs">
                {[
                  { date: 'Today, Oct 04, 2026', branch: 'Dr. Florence Espinosa Ob-Gyn Clinic', doctor: 'Dr. Florence Espinosa', diagnosis: 'Community-Acquired Pneumonia (CAP-LR)', status: 'In Progress' },
                  { date: 'Aug 14, 2026', branch: 'ACE Medical Center - Baypointe', doctor: 'Dr. Florence Espinosa', diagnosis: 'Essential Hypertension Check', status: 'Completed' },
                  { date: 'May 02, 2026', branch: 'Dr. Florence Espinosa Ob-Gyn Clinic', doctor: 'Dr. Florence Espinosa', diagnosis: 'Routine Consultation', status: 'Completed' },
                ].map((enc, i) => (
                  <div key={i} className="p-2.5 rounded border border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900">{enc.date} &bull; {enc.branch}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">Attending: {enc.doctor} &bull; Dx: <span className="font-medium text-slate-800">{enc.diagnosis}</span></div>
                    </div>
                    <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {enc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Patient-Specific Audit & Access Log (RA 10173 Compliance) */}
          {activeTab === 'audit' && (
            <div className="rounded border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-cyan-800" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Patient Health Record Audit & Access Register (RA 10173 DPA)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {patientAuditLogs.length} Events Logged
                </span>
              </div>

              <div className="divide-y divide-slate-100 font-sans text-xs">
                {patientAuditLogs.map((log) => (
                  <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900">{log.actionLabel}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-mono text-slate-600">
                          {log.fhirResourceId}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Actor: <strong className="text-slate-700">{log.actor.name}</strong> ({log.actor.role}) &bull; IP: <span className="font-mono">{log.actor.ipAddress}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedAuditJson(log)}
                        className="block mt-0.5 text-[10px] text-cyan-700 hover:underline"
                      >
                        Inspect FHIR AuditEvent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Raw FHIR AuditEvent Modal (RA 10173 Compliance) */}
      {selectedAuditJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border border-slate-300 bg-white text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3.5 py-2">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-cyan-800" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  FHIR R4 AuditEvent Electronic Verification
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditJson(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-3.5">
              <pre className="rounded bg-slate-900 p-3 font-mono text-xs text-slate-100 overflow-x-auto">
                {JSON.stringify(
                  {
                    resourceType: 'AuditEvent',
                    id: selectedAuditJson.id,
                    type: { code: selectedAuditJson.actionType, display: selectedAuditJson.actionLabel },
                    recorded: selectedAuditJson.timestamp,
                    outcome: '0',
                    agent: [
                      {
                        who: {
                          identifier: { system: 'https://prc.gov.ph', value: selectedAuditJson.actor.prcLicense || 'N/A' },
                          display: selectedAuditJson.actor.name,
                        },
                        network: { address: selectedAuditJson.actor.ipAddress },
                      },
                    ],
                    entity: [
                      {
                        what: { reference: `Patient/${selectedAuditJson.patient?.id}`, display: selectedAuditJson.patient?.name },
                        detail: [{ type: 'TargetResource', valueString: selectedAuditJson.fhirResourceId }],
                      },
                    ],
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-3.5 py-2">
              <button
                type="button"
                onClick={() => setSelectedAuditJson(null)}
                className="rounded bg-slate-800 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-900 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <PrintablePrescriptionModal
        isOpen={showRxModal}
        onClose={() => setShowRxModal(false)}
        branch={branch}
        patient={{
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          address: patient.address,
          philhealth: patient.philhealth,
          seniorId: patient.seniorId,
        }}
        prescriptions={prescriptionItems}
        physician={physicianInfo}
      />

      <PrintableBillingModal
        isOpen={showBillingModal}
        onClose={() => setShowBillingModal(false)}
        branch={branch}
        statementNo="SOA-2026-9923"
        patient={{
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          address: patient.address,
          philhealth: patient.philhealth,
          discountType: 'SENIOR',
          discountId: patient.seniorId,
        }}
        items={billingItems}
      />
    </div>
  );
}
