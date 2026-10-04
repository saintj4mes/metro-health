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
      'Vital signs noted. Chest auscultation reveals crackles over the left lower lung field. No wheezes or stridor. Heart sounds regular S1/S2, no murmurs. Abdomen soft, non-tender.',
    assessment: 'J18.9 - Community-Acquired Pneumonia, Low Risk (CAP-LR); I10 - Essential Hypertension',
    plan: '1. Amoxicillin + Clavulanic Acid 1g PO BID x 7 days\n2. Acetylcysteine 600mg effervescent tablet PO OD x 5 days\n3. Continue Losartan 50mg tab PO OD every morning\n4. Chest X-Ray PA View in 1 week\n5. Return for clinic follow-up after completing antibiotic course.',
  });

  // Vitals Flowsheet Data
  const vitalsHistory = [
    { date: 'Today, 01:15 PM', branch: 'Dr. Florence Espinosa Ob-Gyn Clinic', bp: '118/76', hr: 74, temp: '36.6', spo2: '99%', bmi: '23.8' },
    { date: 'Aug 14, 2026', branch: 'ACE Medical Center - Baypointe', bp: '120/78', hr: 76, temp: '36.5', spo2: '99%', bmi: '23.9' },
    { date: 'May 02, 2026', branch: 'Dr. Florence Espinosa Ob-Gyn Clinic', bp: '116/74', hr: 72, temp: '36.6', spo2: '98%', bmi: '23.6' },
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
      instructions: 'Take 1 tablet every morning with or without food for blood pressure maintenance.',
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
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 transition dark:text-slate-400 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Queue</span>
          </button>
        )}
        <div className="text-xs text-slate-500">
          Encounter Facility: <span className="font-semibold text-slate-800 dark:text-slate-200">{branch.name}</span>
        </div>
      </div>

      {/* 1. Persistent Patient Safety & Context Banner */}
      <div className="rounded border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Patient Identity */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-slate-100 text-slate-800 font-bold text-xs dark:bg-slate-800 dark:text-slate-200">
              {patient.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white">{patient.name}</h1>
                <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {patient.gender}, {patient.age}y
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Blood: {patient.bloodType}
                </span>
                <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                  SC: {patient.seniorId}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span>PIN: <strong className="font-mono text-slate-700 dark:text-slate-300">{patient.philhealth}</strong></span>
                <span>&bull;</span>
                <span>{patient.address}</span>
              </div>
            </div>
          </div>

          {/* Critical Safety Alert: Allergies */}
          <div className="flex items-center gap-1.5 rounded border border-rose-200 bg-rose-50/90 px-2.5 py-1 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-rose-600" />
            <div className="flex items-center gap-1.5">
              <span className="font-bold uppercase tracking-wider text-[10px] text-rose-700 dark:text-rose-400">
                Allergies:
              </span>
              <span className="font-semibold text-xs">{patient.allergies.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Vitals Quick-Bar */}
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">BP:</span>
              <strong className="font-mono text-slate-900 dark:text-slate-100 text-xs">130/85 mmHg</strong>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">HR:</span>
              <strong className="font-mono text-slate-900 dark:text-slate-100 text-xs">78 bpm</strong>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Temp:</span>
              <strong className="font-mono text-slate-900 dark:text-slate-100 text-xs">36.6 °C</strong>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">SpO2:</span>
              <strong className="font-mono text-slate-900 dark:text-slate-100 text-xs">98%</strong>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-[10px] uppercase font-semibold">BMI:</span>
              <strong className="font-mono text-slate-900 dark:text-slate-100 text-xs">25.0 kg/m²</strong>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={loading}
              onClick={handleSignEncounter}
              className="flex items-center gap-1 rounded bg-cyan-800 px-2.5 py-1 text-xs font-semibold text-white hover:bg-cyan-900 transition disabled:opacity-50 shadow-2xs"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3" />}
              <span>Sign Encounter</span>
            </button>
            <button
              type="button"
              onClick={() => setShowRxModal(true)}
              className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition shadow-2xs"
            >
              <Printer className="h-3 w-3 text-slate-500" />
              <span>Print Rx</span>
            </button>
            <button
              type="button"
              onClick={() => setShowBillingModal(true)}
              className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition shadow-2xs"
            >
              <Receipt className="h-3 w-3 text-slate-500" />
              <span>Print SOA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Bar */}
      {signed && (
        <div className="rounded border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Encounter signed and recorded to clinical record.</span>
          </div>
          {createdRecords && (
            <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-300">
              Ref: {createdRecords.conditionId} &middot; {createdRecords.rxId}
            </span>
          )}
        </div>
      )}

      {/* 2. Clinical Workspace Tab Navigation */}
      <div className="border-b border-slate-200 dark:border-slate-800">
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
                className={`flex items-center gap-1.5 py-1.5 text-xs font-semibold border-b-2 transition ${
                  isActive
                    ? 'border-cyan-800 text-cyan-900 dark:border-cyan-400 dark:text-cyan-300'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Tab Contents */}
      {/* TAB 1: SOAP Clinical Note */}
      {activeTab === 'soap' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* Subjective */}
            <div className="rounded border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                (S) Subjective & History
              </label>
              <textarea
                rows={3}
                value={soap.subjective}
                onChange={(e) => setSoap({ ...soap, subjective: e.target.value })}
                className="w-full rounded border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Objective */}
            <div className="rounded border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                (O) Objective & Physical Exam
              </label>
              <textarea
                rows={3}
                value={soap.objective}
                onChange={(e) => setSoap({ ...soap, objective: e.target.value })}
                className="w-full rounded border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Assessment & ICD-10 */}
          <div className="rounded border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              (A) Assessment & ICD-10 Diagnosis
            </label>
            <input
              type="text"
              value={soap.assessment}
              onChange={(e) => setSoap({ ...soap, assessment: e.target.value })}
              className="h-8 w-full rounded border border-slate-200 bg-slate-50/50 px-2.5 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
              <span className="font-semibold text-slate-400">Quick ICD-10:</span>
              <button
                type="button"
                onClick={() => setSoap({ ...soap, assessment: `${soap.assessment}; J06.9 Acute URI` })}
                className="rounded border border-slate-200 px-1.5 py-0.5 hover:bg-slate-100 dark:border-slate-700 text-[10px]"
              >
                + J06.9 (Acute URI)
              </button>
              <button
                type="button"
                onClick={() => setSoap({ ...soap, assessment: `${soap.assessment}; E11.9 Type 2 Diabetes` })}
                className="rounded border border-slate-200 px-1.5 py-0.5 hover:bg-slate-100 dark:border-slate-700 text-[10px]"
              >
                + E11.9 (Type 2 DM)
              </button>
            </div>
          </div>

          {/* Plan */}
          <div className="rounded border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
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
              rows={3}
              value={soap.plan}
              onChange={(e) => setSoap({ ...soap, plan: e.target.value })}
              className="w-full font-mono rounded border border-slate-200 bg-slate-50/50 p-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      )}

      {/* TAB 2: Vitals Flowsheet */}
      {activeTab === 'vitals' && (
        <div className="rounded border border-slate-200 bg-white shadow-2xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:border-slate-700">
              <tr>
                <th className="px-3 py-1.5">Date / Time</th>
                <th className="px-3 py-1.5">Clinic Branch</th>
                <th className="px-3 py-1.5">BP (mmHg)</th>
                <th className="px-3 py-1.5">HR (bpm)</th>
                <th className="px-3 py-1.5">Temp (°C)</th>
                <th className="px-3 py-1.5">SpO2</th>
                <th className="px-3 py-1.5">BMI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-slate-800 dark:text-slate-200">
              {vitalsHistory.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="px-3 py-1.5 font-sans font-medium text-slate-900 dark:text-white">{row.date}</td>
                  <td className="px-3 py-1.5 font-sans text-slate-600 dark:text-slate-400">{row.branch}</td>
                  <td className="px-3 py-1.5 font-bold">{row.bp}</td>
                  <td className="px-3 py-1.5">{row.hr}</td>
                  <td className="px-3 py-1.5">{row.temp}</td>
                  <td className="px-3 py-1.5">{row.spo2}</td>
                  <td className="px-3 py-1.5">{row.bmi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: e-Prescriptions */}
      {activeTab === 'rx' && (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
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

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {prescriptionItems.map((rx, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">
                      {rx.genericName} <span className="font-normal text-slate-500 font-mono">({rx.dosage})</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      Sig: {rx.instructions} &middot; Duration: {rx.duration}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-slate-900 dark:text-white"># {rx.dispenseQty}</span>
                    <span className="block text-[10px] text-slate-400 font-sans">Dispense Qty</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statutory Physician Credentials Notice */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400 flex flex-wrap items-center justify-between gap-3">
            <div><strong>Physician:</strong> {physicianInfo.name}</div>
            <div><strong>PRC Lic:</strong> {physicianInfo.prcNo}</div>
            <div><strong>PTR No:</strong> {physicianInfo.ptrNo}</div>
            <div><strong>S2 Lic:</strong> {physicianInfo.s2No}</div>
          </div>
        </div>
      )}

      {/* TAB 4: Billing & Discounts */}
      {activeTab === 'billing' && (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
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
                    <td className="py-2 font-sans font-medium text-slate-900 dark:text-slate-100">{item.description}</td>
                    <td className="py-2 font-sans text-slate-500">{item.category}</td>
                    <td className="py-2 text-center">{item.qty}</td>
                    <td className="py-2 text-right">{formatPhp(item.unitPrice)}</td>
                    <td className="py-2 text-right font-bold text-slate-900 dark:text-slate-100">{formatPhp(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations Callout */}
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
                <div className="border-t border-slate-300 pt-1.5 flex justify-between items-baseline font-sans font-bold text-slate-900 dark:text-white">
                  <span>Net Amount Payable:</span>
                  <span className="text-sm font-mono">{formatPhp(2221.43)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Longitudinal History */}
      {activeTab === 'history' && (
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
            Longitudinal Visit History Across Branches
          </h3>
          <div className="space-y-1.5 text-xs">
            {[
              { date: 'Today, Oct 04, 2026', branch: 'Dr. Florence Espinosa Ob-Gyn Clinic', doctor: 'Dr. Florence Espinosa', diagnosis: 'Prenatal Care Routine Checkup, 28 wks AOG', status: 'In Progress' },
              { date: 'Aug 14, 2026', branch: 'ACE Medical Center - Baypointe', doctor: 'Dr. Florence Espinosa', diagnosis: 'Transvaginal Pelvic Ultrasound', status: 'Completed' },
              { date: 'May 02, 2026', branch: 'Dr. Florence Espinosa Ob-Gyn Clinic', doctor: 'Dr. Florence Espinosa', diagnosis: 'Cervical Pap Smear Screening', status: 'Completed' },
            ].map((enc, i) => (
              <div key={i} className="p-2.5 rounded border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900 dark:text-white">{enc.date} &middot; {enc.branch}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">Attending: {enc.doctor} &middot; Dx: <span className="font-medium text-slate-700 dark:text-slate-300">{enc.diagnosis}</span></div>
                </div>
                <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {enc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: Patient-Specific Audit & Access Log (RA 10173 Compliance) */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-cyan-800 dark:text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Patient Health Record Audit & Access Register
                </h3>
                <span className="rounded bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-cyan-800 border border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800">
                  RA 10173 DPA Compliant
                </span>
              </div>
              <div className="text-[11px] text-slate-500">
                Patient Subject: <strong className="text-slate-800 dark:text-slate-200">{patient.name}</strong> ({patient.philhealth})
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Pursuant to the Philippine Data Privacy Act of 2012, this immutable record tracks all clinical consultations, vitals intake, e-prescriptions, and financial transactions recorded for this patient.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:border-slate-700">
                  <tr>
                    <th className="px-3.5 py-2.5">Date & Time</th>
                    <th className="px-3.5 py-2.5">Action Taken</th>
                    <th className="px-3.5 py-2.5">Clinician / Staff Actor</th>
                    <th className="px-3.5 py-2.5">Facility Branch</th>
                    <th className="px-3.5 py-2.5">FHIR Resource</th>
                    <th className="px-3.5 py-2.5 text-right">Details & JSON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                  {patientAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <div className="font-mono font-medium text-slate-800 dark:text-slate-200">
                          {log.formattedTime}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {log.id}
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {log.actionLabel}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {log.details}
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {log.actor.name}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {log.actor.role}
                          {log.actor.prcLicense && (
                            <span className="ml-1 text-[10px] font-mono text-cyan-800 dark:text-cyan-400">
                              (PRC: {log.actor.prcLicense})
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {log.actor.terminal}
                        </div>
                      </td>

                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {log.branchName}
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                          {log.fhirResourceId}
                        </span>
                      </td>

                      <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedAuditJson(log)}
                          className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
                        >
                          <FileCode className="h-3 w-3 text-cyan-800 dark:text-cyan-400" />
                          <span>FHIR JSON</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Raw FHIR AuditEvent JSON Inspector Modal */}
      {selectedAuditJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-cyan-800 dark:text-cyan-400" />
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                  FHIR AuditEvent Record [{selectedAuditJson.id}]
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditJson(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-3 max-h-[55vh] overflow-y-auto">
              <pre className="rounded bg-slate-950 p-2.5 text-[10px] font-mono text-cyan-300 overflow-x-auto leading-relaxed border border-slate-800">
                {JSON.stringify(
                  {
                    resourceType: 'AuditEvent',
                    id: selectedAuditJson.id,
                    type: {
                      system: 'http://dicom.nema.org/resources/ontology/DCM',
                      code: selectedAuditJson.actionType,
                      display: selectedAuditJson.actionLabel,
                    },
                    recorded: selectedAuditJson.timestamp,
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

            <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setSelectedAuditJson(null)}
                className="rounded bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-900 transition"
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
