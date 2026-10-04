// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

export type AuditActionType =
  | 'CHART_VIEW'
  | 'PATIENT_ADMISSION'
  | 'VITALS_RECORDED'
  | 'ENCOUNTER_SIGNED'
  | 'PRESCRIPTION_ISSUED'
  | 'BILLING_PROCESSED'
  | 'USER_PERMISSIONS_CHANGED'
  | 'APPOINTMENT_BOOKED'
  | 'APPOINTMENT_CHECKIN';

export interface AuditActor {
  id: string;
  name: string;
  role: string;
  prcLicense?: string;
  ipAddress: string;
  terminal: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO
  formattedTime: string;
  actionType: AuditActionType;
  actionLabel: string;
  actor: AuditActor;
  patient?: {
    id: string;
    name: string;
    philhealth?: string;
    seniorOrPwd?: string;
  };
  branchId: string;
  branchName: string;
  fhirResourceId: string;
  outcome: 'SUCCESS' | 'WARNING' | 'ALERT';
  securityCategory: 'PRIVACY_READ' | 'CLINICAL_MODIFICATION' | 'FINANCIAL_TRANSACTION' | 'RBAC_SECURITY';
  details: string;
}

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-2026-9001',
    timestamp: '2026-10-04T09:42:15Z',
    formattedTime: 'Today, 01:42:15 PM',
    actionType: 'BILLING_PROCESSED',
    actionLabel: 'Processed Cashier Invoice & Statutory RA 9994 Discount',
    actor: {
      id: 'user-005',
      name: 'Mark Dizon',
      role: 'Cashier & Maternity Billing Specialist',
      ipAddress: '192.168.3.105',
      terminal: 'Terminal-EOC-CASHIER-01',
    },
    patient: {
      id: 'pat-106',
      name: 'Carmela Ramos',
      philhealth: '15-998877665-1',
      seniorOrPwd: 'Senior Citizen (OSCA-OLG-2023-8821)',
    },
    branchId: 'branch-espinosa',
    branchName: 'Dr. Florence Espinosa Ob-Gyn Clinic',
    fhirResourceId: 'Invoice/inv-2026-4482',
    outcome: 'SUCCESS',
    securityCategory: 'FINANCIAL_TRANSACTION',
    details: 'Applied 12% VAT exemption and 20% Senior Citizen discount for Pap smear and gynecological consultation.',
  },
  {
    id: 'aud-2026-9002',
    timestamp: '2026-10-04T09:35:40Z',
    formattedTime: 'Today, 01:35:40 PM',
    actionType: 'PRESCRIPTION_ISSUED',
    actionLabel: 'Signed Digital Prescription Pad (RA 6675 Generics Act)',
    actor: {
      id: 'user-001',
      name: 'Dr. Florence Espinosa, MD',
      role: 'Medical Director / Attending OB-GYN',
      prcLicense: '0089241',
      ipAddress: '192.168.3.101',
      terminal: 'Terminal-EOC-CONSULT-01',
    },
    patient: {
      id: 'pat-102',
      name: 'Maria Angelica Santos',
      philhealth: '18-992384712-0',
    },
    branchId: 'branch-espinosa',
    branchName: 'Dr. Florence Espinosa Ob-Gyn Clinic',
    fhirResourceId: 'MedicationRequest/rx-2026-9923',
    outcome: 'SUCCESS',
    securityCategory: 'CLINICAL_MODIFICATION',
    details: 'Prescribed Ferrous Sulfate + Folic Acid 60mg/400mcg PO OD and Calcium Carbonate 500mg PO BID.',
  },
  {
    id: 'aud-2026-9003',
    timestamp: '2026-10-04T09:32:10Z',
    formattedTime: 'Today, 01:32:10 PM',
    actionType: 'ENCOUNTER_SIGNED',
    actionLabel: 'Finalized & Signed SOAP Consultation Encounter',
    actor: {
      id: 'user-001',
      name: 'Dr. Florence Espinosa, MD',
      role: 'Medical Director / Attending OB-GYN',
      prcLicense: '0089241',
      ipAddress: '192.168.3.101',
      terminal: 'Terminal-EOC-CONSULT-01',
    },
    patient: {
      id: 'pat-102',
      name: 'Maria Angelica Santos',
      philhealth: '18-992384712-0',
    },
    branchId: 'branch-espinosa',
    branchName: 'Dr. Florence Espinosa Ob-Gyn Clinic',
    fhirResourceId: 'Encounter/enc-2026-9923',
    outcome: 'SUCCESS',
    securityCategory: 'CLINICAL_MODIFICATION',
    details: 'Signed clinical diagnosis: Z34.8 Normal Pregnancy, 28 weeks AOG; Cephalic Presentation.',
  },
  {
    id: 'aud-2026-9004',
    timestamp: '2026-10-04T09:20:05Z',
    formattedTime: 'Today, 01:20:05 PM',
    actionType: 'CHART_VIEW',
    actionLabel: 'Medical Chart Accessed by Attending OB-GYN',
    actor: {
      id: 'user-001',
      name: 'Dr. Florence Espinosa, MD',
      role: 'Medical Director / Attending OB-GYN',
      prcLicense: '0089241',
      ipAddress: '192.168.3.101',
      terminal: 'Terminal-EOC-CONSULT-01',
    },
    patient: {
      id: 'pat-102',
      name: 'Maria Angelica Santos',
      philhealth: '18-992384712-0',
    },
    branchId: 'branch-espinosa',
    branchName: 'Dr. Florence Espinosa Ob-Gyn Clinic',
    fhirResourceId: 'Patient/pat-102',
    outcome: 'SUCCESS',
    securityCategory: 'PRIVACY_READ',
    details: 'Full maternal clinical record opened for active prenatal consultation session.',
  },
  {
    id: 'aud-2026-9005',
    timestamp: '2026-10-04T09:12:44Z',
    formattedTime: 'Today, 01:12:44 PM',
    actionType: 'VITALS_RECORDED',
    actionLabel: 'Recorded Clinical Triage Vitals (LOINC-coded Observations)',
    actor: {
      id: 'user-003',
      name: 'Clara Reyes, RN',
      role: 'Senior OB Triage Nurse',
      prcLicense: '0782341',
      ipAddress: '192.168.3.103',
      terminal: 'Terminal-EOC-TRIAGE-01',
    },
    patient: {
      id: 'pat-102',
      name: 'Maria Angelica Santos',
      philhealth: '18-992384712-0',
    },
    branchId: 'branch-espinosa',
    branchName: 'Dr. Florence Espinosa Ob-Gyn Clinic',
    fhirResourceId: 'Observation/obs-group-102',
    outcome: 'SUCCESS',
    securityCategory: 'CLINICAL_MODIFICATION',
    details: 'Recorded BP 115/75 mmHg, HR 80 bpm, Temp 36.6 °C, Fundic Height 28 cm, FHR 144 bpm.',
  },
  {
    id: 'aud-2026-9006',
    timestamp: '2026-10-04T09:02:18Z',
    formattedTime: 'Today, 01:02:18 PM',
    actionType: 'PATIENT_ADMISSION',
    actionLabel: 'Admitted Patient & Checked In to Clinic Queue',
    actor: {
      id: 'user-001',
      name: 'Dr. Florence Espinosa, MD',
      role: 'Medical Director',
      ipAddress: '192.168.3.101',
      terminal: 'Terminal-EOC-FRONT-01',
    },
    patient: {
      id: 'pat-102',
      name: 'Maria Angelica Santos',
      philhealth: '18-992384712-0',
    },
    branchId: 'branch-espinosa',
    branchName: 'Dr. Florence Espinosa Ob-Gyn Clinic',
    fhirResourceId: 'Patient/pat-102',
    outcome: 'SUCCESS',
    securityCategory: 'CLINICAL_MODIFICATION',
    details: 'Registered patient demographics: East Tapinac, Olongapo City. Routed to Triage Queue.',
  },
  {
    id: 'aud-2026-9007',
    timestamp: '2026-10-04T08:50:30Z',
    formattedTime: 'Today, 10:50:30 AM',
    actionType: 'USER_PERMISSIONS_CHANGED',
    actionLabel: 'Modified Clinic Staff Branch Access Scope',
    actor: {
      id: 'user-001',
      name: 'Dr. Florence Espinosa, MD',
      role: 'Medical Director (Root Admin)',
      ipAddress: '192.168.3.101',
      terminal: 'Terminal-EOC-ADMIN-01',
    },
    branchId: 'branch-espinosa',
    branchName: 'Dr. Florence Espinosa Ob-Gyn Clinic',
    fhirResourceId: 'PractitionerRole/pr-006',
    outcome: 'SUCCESS',
    securityCategory: 'RBAC_SECURITY',
    details: 'Assigned user Joy Alcantara to ACE Medical Center - Baypointe facility in accordance with RA 10173 minimum necessary access.',
  },
  {
    id: 'aud-2026-9008',
    timestamp: '2026-10-04T08:35:10Z',
    formattedTime: 'Today, 10:35:10 AM',
    actionType: 'ENCOUNTER_SIGNED',
    actionLabel: 'Signed Consultation & Fetal Well-being Clearance',
    actor: {
      id: 'user-001',
      name: 'Dr. Florence Espinosa, MD',
      role: 'Attending OB-GYN',
      prcLicense: '0089241',
      ipAddress: '192.168.4.102',
      terminal: 'Terminal-ACE-CONSULT-01',
    },
    patient: {
      id: 'pat-301',
      name: 'Patricia Lim',
      philhealth: '14-112233445-6',
    },
    branchId: 'branch-ace',
    branchName: 'ACE Medical Center - Baypointe',
    fhirResourceId: 'Encounter/enc-ace-4402',
    outcome: 'SUCCESS',
    securityCategory: 'CLINICAL_MODIFICATION',
    details: 'Signed 38-week scheduled Elective Repeat Cesarean Section pre-op consult and pre-anesthesia laboratory orders.',
  },
];

// Helper to convert audit logs to CSV for Philippine Data Privacy Act regulatory audit
export function generateAuditCsv(logs: AuditLogEntry[]): string {
  const headers = [
    'Log ID',
    'Timestamp (UTC)',
    'Event Action',
    'Category',
    'Actor Name',
    'Actor Role',
    'PRC License',
    'Terminal IP',
    'Patient Name',
    'PhilHealth PIN',
    'Facility Branch',
    'FHIR Resource ID',
    'Outcome',
    'Details',
  ];

  const rows = logs.map((log) => [
    log.id,
    log.timestamp,
    `"${log.actionLabel}"`,
    log.securityCategory,
    `"${log.actor.name}"`,
    `"${log.actor.role}"`,
    log.actor.prcLicense || 'N/A',
    `${log.actor.terminal} (${log.actor.ipAddress})`,
    log.patient ? `"${log.patient.name}"` : 'N/A',
    log.patient?.philhealth || 'N/A',
    `"${log.branchName}"`,
    log.fhirResourceId,
    log.outcome,
    `"${log.details.replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadAuditCsv(logs: AuditLogEntry[], branchName: string): void {
  const csvContent = generateAuditCsv(logs);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Espinosa_OBGYN_Audit_Log_${branchName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
