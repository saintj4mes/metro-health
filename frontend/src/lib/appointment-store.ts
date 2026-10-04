// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

export type ServiceType = string;

export type AppointmentStatus =
  | 'BOOKED'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface ClinicAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'M' | 'F';
  patientDob: string;
  patientPhone: string;
  philhealth?: string;
  seniorId?: string;
  pwdId?: string;
  branchId: string;
  doctorName: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // "01:00 PM"
  hour: number; // 24-hr integer for matrix row placement (e.g. 13 for 1 PM)
  durationMinutes: number;
  serviceType: string;
  status: AppointmentStatus;
  chiefComplaint: string;
}

export const INITIAL_APPOINTMENTS: ClinicAppointment[] = [
  // --- CURRENT WEEK (Oct 05 - Oct 11, 2026) : DR. FLORENCE ESPINOSA OB-GYN CLINIC ---
  {
    id: 'apt-esp-101',
    patientId: 'pat-102',
    patientName: 'Maria Angelica Santos',
    patientAge: 34,
    patientGender: 'F',
    patientDob: '1992-08-25',
    patientPhone: '+63 918 992 3847',
    philhealth: '18-992384712-0',
    branchId: 'branch-espinosa',
    doctorName: 'Dr. Florence Espinosa, MD',
    doctorId: 'user-001',
    date: '2026-10-05', // Monday
    timeSlot: '01:00 PM',
    hour: 13,
    durationMinutes: 30,
    serviceType: 'Antenatal Routine Checkup (Walk-in)',
    status: 'CHECKED_IN',
    chiefComplaint: 'Second trimester ultrasound and blood glucose screening review',
  },
  {
    id: 'apt-esp-102',
    patientId: 'pat-104',
    patientName: 'Kristine Joy Bernardo',
    patientAge: 28,
    patientGender: 'F',
    patientDob: '1998-03-14',
    patientPhone: '+63 922 445 6677',
    branchId: 'branch-espinosa',
    doctorName: 'Dr. Florence Espinosa, MD',
    doctorId: 'user-001',
    date: '2026-10-05', // Monday
    timeSlot: '02:30 PM',
    hour: 14,
    durationMinutes: 30,
    serviceType: '1st Trimester Prenatal Check',
    status: 'CONFIRMED',
    chiefComplaint: 'Hyperemesis gravidarum hydration check & prenatal vitamins prescription',
  },
  {
    id: 'apt-esp-103',
    patientId: 'pat-105',
    patientName: 'Andrea Dizon',
    patientAge: 42,
    patientGender: 'F',
    patientDob: '1984-06-30',
    patientPhone: '+63 920 112 3344',
    branchId: 'branch-espinosa',
    doctorName: 'Dr. Florence Espinosa, MD',
    doctorId: 'user-001',
    date: '2026-10-06', // Tuesday
    timeSlot: '01:30 PM',
    hour: 13,
    durationMinutes: 45,
    serviceType: 'Pelvic & Transvaginal Ultrasound',
    status: 'CONFIRMED',
    chiefComplaint: 'Dysfunctional uterine bleeding & endometrial thickness assessment',
  },
  {
    id: 'apt-esp-104',
    patientId: 'pat-106',
    patientName: 'Carmela Ramos',
    patientAge: 61,
    patientGender: 'F',
    patientDob: '1965-02-18',
    patientPhone: '+63 915 443 8912',
    philhealth: '15-998877665-1',
    seniorId: 'OSCA-OLG-2023-8821',
    branchId: 'branch-espinosa',
    doctorName: 'Dr. Florence Espinosa, MD',
    doctorId: 'user-001',
    date: '2026-10-07', // Wednesday
    timeSlot: '03:00 PM',
    hour: 15,
    durationMinutes: 30,
    serviceType: 'Gynecological Wellness & Pap Smear',
    status: 'CONFIRMED',
    chiefComplaint: 'Post-menopausal routine Pap smear & hormone clearance',
  },
  {
    id: 'apt-esp-105',
    patientId: 'pat-107',
    patientName: 'Beatrice Mendoza',
    patientAge: 25,
    patientGender: 'F',
    patientDob: '2001-11-10',
    patientPhone: '+63 917 223 9988',
    branchId: 'branch-espinosa',
    doctorName: 'Dr. Florence Espinosa, MD',
    doctorId: 'user-001',
    date: '2026-10-08', // Thursday
    timeSlot: '04:30 PM',
    hour: 16,
    durationMinutes: 30,
    serviceType: 'Cervical Cancer HPV Immunization',
    status: 'CONFIRMED',
    chiefComplaint: 'HPV vaccine dose #2 & pre-marital health counseling',
  },
  {
    id: 'apt-esp-106',
    patientId: 'pat-108',
    patientName: 'Clarisse Villamor',
    patientAge: 30,
    patientGender: 'F',
    patientDob: '1996-01-15',
    patientPhone: '+63 919 445 7711',
    branchId: 'branch-espinosa',
    doctorName: 'Dr. Florence Espinosa, MD',
    doctorId: 'user-001',
    date: '2026-10-09', // Friday
    timeSlot: '02:00 PM',
    hour: 14,
    durationMinutes: 30,
    serviceType: '36-Week Pre-Delivery Assessment',
    status: 'CONFIRMED',
    chiefComplaint: 'Birth plan review, NST monitoring, and hospital admission paperwork',
  },
  {
    id: 'apt-esp-107',
    patientId: 'pat-109',
    patientName: 'Evelyn Pineda',
    patientAge: 37,
    patientGender: 'F',
    patientDob: '1989-07-04',
    patientPhone: '+63 928 661 2233',
    branchId: 'branch-espinosa',
    doctorName: 'Dr. Florence Espinosa, MD',
    doctorId: 'user-001',
    date: '2026-10-10', // Saturday
    timeSlot: '01:30 PM',
    hour: 13,
    durationMinutes: 30,
    serviceType: 'Routine Antenatal Follow-up',
    status: 'CONFIRMED',
    chiefComplaint: '20 weeks AOG Congenital Anomaly Scan (CAS) results review',
  },

  // --- ULTICARE MEDICAL CENTER (By Appointment) ---
  {
    id: 'apt-ult-101',
    patientId: 'pat-201',
    patientName: 'Rowena Bautista',
    patientAge: 31,
    patientGender: 'F',
    patientDob: '1995-04-18',
    patientPhone: '+63 917 881 2233',
    philhealth: '14-112233445-6',
    branchId: 'branch-ulticare',
    doctorName: 'Dr. Florence Espinosa, MD',
    doctorId: 'user-001',
    date: '2026-10-06', // Tuesday
    timeSlot: '09:30 AM',
    hour: 9,
    durationMinutes: 45,
    serviceType: 'Biophysical Profile (BPS) Ultrasound',
    status: 'CHECKED_IN',
    chiefComplaint: 'High-risk gestational diabetes fetal well-being assessment',
  },
  {
    id: 'apt-ult-102',
    patientId: 'pat-202',
    patientName: 'Jennifer De Leon',
    patientAge: 38,
    patientGender: 'F',
    patientDob: '1988-09-02',
    patientPhone: '+63 916 223 9901',
    branchId: 'branch-ulticare',
    doctorName: 'Dr. Roberto Gomez, MD',
    doctorId: 'user-002',
    date: '2026-10-08', // Thursday
    timeSlot: '10:00 AM',
    hour: 10,
    durationMinutes: 30,
    serviceType: 'Pelvic Ultrasound (TVS)',
    status: 'CONFIRMED',
    chiefComplaint: 'Ovarian cyst size tracking and CA-125 review',
  },

  // --- ALLIED CARE EXPERTS (ACE) MEDICAL CENTER - BAYPOINTE ---
  {
    id: 'apt-ace-101',
    patientId: 'pat-301',
    patientName: 'Patricia Lim',
    patientAge: 29,
    patientGender: 'F',
    patientDob: '1997-01-22',
    patientPhone: '+63 922 884 1122',
    branchId: 'branch-ace',
    doctorName: 'Dr. Florence Espinosa, MD',
    doctorId: 'user-001',
    date: '2026-10-05', // Monday (10:00 AM - 12:00 PM)
    timeSlot: '10:15 AM',
    hour: 10,
    durationMinutes: 30,
    serviceType: 'Elective Repeat Cesarean Pre-Op',
    status: 'CHECKED_IN',
    chiefComplaint: '38-week scheduled C-section pre-op evaluation and hospital bed reservation',
  },
  {
    id: 'apt-ace-102',
    patientId: 'pat-302',
    patientName: 'Camille Villafuerte',
    patientAge: 33,
    patientGender: 'F',
    patientDob: '1993-05-11',
    patientPhone: '+63 933 112 8899',
    branchId: 'branch-ace',
    doctorName: 'Dr. Florence Espinosa, MD',
    doctorId: 'user-001',
    date: '2026-10-05', // Monday
    timeSlot: '11:00 AM',
    hour: 11,
    durationMinutes: 30,
    serviceType: 'Post-Cesarean Wound Check',
    status: 'CONFIRMED',
    chiefComplaint: 'Incision healing check, suture line dressing, lactation counseling',
  },
];

// Helper to calculate the Monday start of a week given an arbitrary date
export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Generate the 7 days of the week (Monday through Sunday)
export function getWeekDates(mondayDate: Date): { dayName: string; shortDate: string; isoDate: string }[] {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dates = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    const isoDate = d.toISOString().split('T')[0];
    const shortDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dates.push({
      dayName: dayNames[i],
      shortDate,
      isoDate,
    });
  }

  return dates;
}

// Daily consultation hours (09:00 AM to 06:00 PM) covering Olongapo clinic schedules
export const OPERATING_HOURS = [
  { hour: 9, label: '09:00 AM' },
  { hour: 10, label: '10:00 AM' },
  { hour: 11, label: '11:00 AM' },
  { hour: 12, label: '12:00 PM' },
  { hour: 13, label: '01:00 PM' },
  { hour: 14, label: '02:00 PM' },
  { hour: 15, label: '03:00 PM' },
  { hour: 16, label: '04:00 PM' },
  { hour: 17, label: '05:00 PM' },
  { hour: 18, label: '06:00 PM' },
];
