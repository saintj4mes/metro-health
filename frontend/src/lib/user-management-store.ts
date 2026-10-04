// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

export type UserRole = 'MAIN_DOCTOR' | 'DOCTOR' | 'NURSE' | 'RECEPTION' | 'BILLING';

export type UserBranchAccess = 'ALL' | string[];

export type EmploymentType = 'FULL_TIME' | 'PART_TIME';

export interface StaffUser {
  id: string;
  name: string;
  role: UserRole;
  roleTitle: string;
  specialty?: string;
  email: string;
  phone: string;
  address?: string;
  prcLicense?: string;
  ptrNo?: string;
  branchAccess: UserBranchAccess;
  employmentType: EmploymentType;
  workingDays: number[]; // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  workingHours: string;
  assignedServices: string[];
  daysOff: string[];
  status: 'ACTIVE' | 'SUSPENDED';
  joinedDate: string;
}

export const CLINIC_SERVICES_CATALOG = {
  consultation: [
    'General OB-GYN Consultation',
    'Antenatal & Prenatal Checkup',
    'High-Risk Pregnancy Workup',
    'Pap Smear & Cervical Screening',
    'Post-Partum & Neonatal Follow-up',
    'Infertility & Reproductive Health',
  ],
  procedures: [
    'Pelvic & Transvaginal Ultrasound (TVS)',
    'Obstetric Ultrasound (Biometry & BPS)',
    '12-Lead Digital ECG & Maternal Vitals',
    'NST (Non-Stress Test) Fetal Monitoring',
    'Routine Blood & Urinalysis Profiling',
    'Cervical Cancer HPV Immunization',
  ],
  administrative: [
    'Digital Prescription Signing (RA 6675)',
    'PhilHealth Konsulta & Maternity eClaims (MCP)',
    'Medical Clearance / Fit-to-Travel Certificate',
    'Cashier Invoice & Senior/PWD Exemption',
    'Patient Demographic Admission',
  ],
};

export const INITIAL_STAFF_USERS: StaffUser[] = [
  {
    id: 'user-001',
    name: 'Dr. Florence Espinosa, MD, FPOGS',
    role: 'MAIN_DOCTOR',
    roleTitle: 'Medical Director / Consultant Obstetrician & Gynecologist',
    specialty: 'Obstetrics & Gynecology (OB-GYN)',
    email: 'dr.espinosa@obgynclinic.ph',
    phone: '+63 998 210 8521',
    address: 'Rm 102 ASM Bldg 108 Fendler Street East Tapinac, Olongapo City',
    prcLicense: '0089241',
    ptrNo: '5521901 (Olongapo City)',
    branchAccess: 'ALL',
    employmentType: 'FULL_TIME',
    workingDays: [1, 2, 3, 4, 5, 6], // Mon - Sat
    workingHours: '01:00 PM - 06:00 PM (Walk-in)',
    assignedServices: [
      'General OB-GYN Consultation',
      'Antenatal & Prenatal Checkup',
      'Pelvic & Transvaginal Ultrasound (TVS)',
      'Digital Prescription Signing (RA 6675)',
    ],
    daysOff: ['Sunday'],
    status: 'ACTIVE',
    joinedDate: '2020-01-10',
  },
  {
    id: 'user-002',
    name: 'Dr. Roberto Gomez, MD',
    role: 'DOCTOR',
    roleTitle: 'Associate Physician in Family & Primary Care',
    specialty: 'Primary Care & Maternal Medicine',
    email: 'r.gomez@obgynclinic.ph',
    phone: '+63 918 555 0102',
    address: 'East Tapinac, Olongapo City, Zambales',
    prcLicense: '0139981',
    ptrNo: '5523910 (Olongapo City)',
    branchAccess: ['branch-espinosa', 'branch-ulticare'],
    employmentType: 'PART_TIME',
    workingDays: [2, 4, 6], // Tue, Thu, Sat
    workingHours: '09:00 AM - 01:00 PM',
    assignedServices: ['General OB-GYN Consultation', 'Medical Clearance / Fit-to-Travel Certificate'],
    daysOff: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
    status: 'ACTIVE',
    joinedDate: '2022-06-01',
  },
  {
    id: 'user-003',
    name: 'Clara Reyes, RN',
    role: 'NURSE',
    roleTitle: 'Senior OB Triage & Ward Nurse',
    specialty: 'Maternal Triage & Fetal Monitoring',
    email: 'c.reyes@obgynclinic.ph',
    phone: '+63 920 555 0103',
    address: 'Barretto, Olongapo City, Zambales',
    prcLicense: '0782341',
    branchAccess: ['branch-espinosa'],
    employmentType: 'FULL_TIME',
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHours: '12:00 PM - 07:00 PM',
    assignedServices: ['12-Lead Digital ECG & Maternal Vitals', 'NST (Non-Stress Test) Fetal Monitoring'],
    daysOff: ['Sunday'],
    status: 'ACTIVE',
    joinedDate: '2023-02-10',
  },
  {
    id: 'user-004',
    name: 'Aileen Torres, RN',
    role: 'NURSE',
    roleTitle: 'Clinical Sonography Nurse',
    specialty: 'Ultrasound Diagnostics & Triage',
    email: 'a.torres@obgynclinic.ph',
    phone: '+63 922 555 0104',
    address: 'Subic Bay Freeport Zone, Zambales',
    prcLicense: '0799120',
    branchAccess: ['branch-ulticare', 'branch-ace'],
    employmentType: 'FULL_TIME',
    workingDays: [1, 2, 3, 4, 5],
    workingHours: '08:00 AM - 05:00 PM',
    assignedServices: ['Pelvic & Transvaginal Ultrasound (TVS)', 'Routine Blood & Urinalysis Profiling'],
    daysOff: ['Saturday', 'Sunday'],
    status: 'ACTIVE',
    joinedDate: '2023-03-20',
  },
  {
    id: 'user-005',
    name: 'Mark Dizon',
    role: 'BILLING',
    roleTitle: 'Cashier & PhilHealth Maternity MCP Specialist',
    specialty: 'PhilHealth eClaims MCP & BIR Compliance',
    email: 'm.dizon@obgynclinic.ph',
    phone: '+63 927 555 0105',
    address: 'East Tapinac, Olongapo City',
    branchAccess: ['branch-espinosa'],
    employmentType: 'FULL_TIME',
    workingDays: [1, 2, 3, 4, 5, 6],
    workingHours: '12:30 PM - 06:30 PM',
    assignedServices: ['Cashier Invoice & Senior/PWD Exemption', 'PhilHealth Konsulta & Maternity eClaims (MCP)'],
    daysOff: ['Sunday'],
    status: 'ACTIVE',
    joinedDate: '2023-11-05',
  },
  {
    id: 'user-006',
    name: 'Joy Alcantara',
    role: 'RECEPTION',
    roleTitle: 'Front Desk Admission & Hospital Liaison',
    specialty: 'Patient Reception & Delivery Admissions',
    email: 'j.alcantara@obgynclinic.ph',
    phone: '+63 932 555 0106',
    address: 'Subic Bay Freeport Zone, Zambales',
    branchAccess: ['branch-ace'],
    employmentType: 'FULL_TIME',
    workingDays: [1, 2, 3, 4, 5],
    workingHours: '09:00 AM - 05:00 PM',
    assignedServices: ['Patient Demographic Admission'],
    daysOff: ['Saturday', 'Sunday'],
    status: 'ACTIVE',
    joinedDate: '2024-05-12',
  },
];

export function canUserAccessBranch(user: StaffUser, branchId: string): boolean {
  if (user.branchAccess === 'ALL') {
    return true;
  }
  return Array.isArray(user.branchAccess) && user.branchAccess.includes(branchId);
}

export function formatBranchAccessLabel(access: UserBranchAccess): string {
  if (access === 'ALL') {
    return 'All 3 Clinic Locations (Full Access)';
  }
  const branchMap: Record<string, string> = {
    'branch-espinosa': 'Dr. Florence Espinosa Clinic',
    'branch-ulticare': 'Ulticare Medical Center',
    'branch-ace': 'ACE Medical Center - Baypointe',
  };
  return access.map((id) => branchMap[id] || id).join(', ');
}
