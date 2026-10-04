// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

export interface PatientAllergy {
  id: string;
  substance: string;
  category: 'MEDICATION' | 'FOOD' | 'ENVIRONMENTAL';
  status: 'ACTIVE' | 'INACTIVE';
  reaction?: string;
}

export interface PatientProblem {
  id: string;
  condition: string;
  icd10: string;
  status: 'ACTIVE' | 'RESOLVED';
  onsetDate: string;
}

export interface PatientInsurance {
  provider: string;
  policyId: string;
  groupNumber?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  validUntil: string;
  konsultaAccredited: boolean;
  statutoryType?: 'SENIOR' | 'PWD' | 'REGULAR';
  statutoryId?: string;
}

export interface ClinicalTaskNote {
  id: string;
  authorInitials: string;
  authorName: string;
  authorRole: string;
  timestamp: string;
  content: string;
}

export interface ClinicalTask {
  id: string;
  title: string;
  dueDate: string;
  assignedTo: string;
  status: 'In Progress' | 'Ready' | 'Requested' | 'Completed';
  category: 'LAB_REVIEW' | 'MED_RECON' | 'AUTH' | 'REFERRAL' | 'MESSAGE' | 'TRIAGE';
  description: string;
  notes: ClinicalTaskNote[];
}

export interface PatientMedication {
  id: string;
  genericName: string;
  brandName?: string;
  dosage: string;
  instructions: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DISCONTINUED';
  prescribedBy: string;
  datePrescribed: string;
}

export interface PatientLabOrder {
  id: string;
  testName: string;
  loincCode: string;
  orderedDate: string;
  status: 'ORDERED' | 'IN_PROGRESS' | 'REPORT_READY';
  resultsSummary?: string;
  diagnosticImagingUrl?: string;
}

export interface PatientEncounter {
  id: string;
  date: string;
  type: string;
  clinician: string;
  chiefComplaint: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  status: 'COMPLETED' | 'IN_PROGRESS';
}

export interface PatientProfileData {
  id: string;
  name: string;
  dob: string;
  age: string;
  gender: 'Female' | 'Male' | 'Other';
  race: string;
  address: string;
  city: string;
  province: string;
  language: string;
  primaryClinician: string;
  avatarUrl?: string;
  insurance: PatientInsurance;
  allergies: PatientAllergy[];
  problems: PatientProblem[];
  tasks: ClinicalTask[];
  medications: PatientMedication[];
  labs: PatientLabOrder[];
  encounters: PatientEncounter[];
}

export const WORKBENCH_PATIENTS: PatientProfileData[] = [
  {
    id: 'pat-105',
    name: 'Andrea Dizon',
    dob: '1984-06-30',
    age: '042Y',
    gender: 'Female',
    race: 'Filipino / Asian',
    address: '14 Magsaysay Drive, East Tapinac',
    city: 'Olongapo City',
    province: 'Zambales 2200',
    language: 'Tagalog, English',
    primaryClinician: 'Dr. Florence Espinosa, MD',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80',
    insurance: {
      provider: 'PhilHealth Konsulta',
      policyId: '12-345678901-2',
      groupNumber: 'KONSULTA-R3-OLG',
      status: 'ACTIVE',
      validUntil: '12/31/2026',
      konsultaAccredited: true,
      statutoryType: 'REGULAR',
    },
    allergies: [
      { id: 'alg-1', substance: 'Penicillin G / Ampicillin', category: 'MEDICATION', status: 'ACTIVE', reaction: 'Urticaria & facial edema' },
      { id: 'alg-2', substance: 'Mefenamic Acid (NSAIDs)', category: 'MEDICATION', status: 'ACTIVE', reaction: 'Gastric bronchospasm' },
      { id: 'alg-3', substance: 'Shellfish / Prawns', category: 'FOOD', status: 'INACTIVE', reaction: 'Mild cutaneous pruritus' },
    ],
    problems: [
      { id: 'prob-1', condition: 'Dysfunctional Uterine Bleeding (DUB)', icd10: 'N93.8', status: 'ACTIVE', onsetDate: '2026-08-10' },
      { id: 'prob-2', condition: 'Mild Microcytic Iron Deficiency Anemia', icd10: 'D50.9', status: 'ACTIVE', onsetDate: '2026-09-01' },
      { id: 'prob-3', condition: 'Cervical Nabothian Cyst (benign)', icd10: 'N88.8', status: 'ACTIVE', onsetDate: '2025-11-15' },
    ],
    tasks: [
      {
        id: 'tsk-101',
        title: 'Review and sign off on lab results',
        dueDate: 'Due 10/05/2026',
        assignedTo: 'Dr. Florence Espinosa',
        status: 'In Progress',
        category: 'LAB_REVIEW',
        description: 'Review Pelvic & Transvaginal Ultrasound (TVS) diagnostic report and endometrial stripe measurement from 10/04/2026.',
        notes: [
          {
            id: 'n-1',
            authorInitials: 'JR',
            authorName: 'Nurse Joy Reyes, RN',
            authorRole: 'Triage Nurse',
            timestamp: 'Today at 01:48 PM',
            content: 'Transvaginal scan images and radiologist preliminary report uploaded to chart. Patient is waiting in Room 204.',
          },
          {
            id: 'n-2',
            authorInitials: 'FE',
            authorName: 'Dr. Florence Espinosa, MD',
            authorRole: 'Attending Ob-Gyn',
            timestamp: 'Today at 02:15 PM',
            content: 'Endometrial thickening measured at 14mm with secretory cystic changes. Correlating with cyclic menorrhagia. Progestin therapy indicated.',
          },
        ],
      },
      {
        id: 'tsk-102',
        title: 'Reconcile medication list',
        dueDate: 'Due 10/06/2026',
        assignedTo: 'Nurse Joy Reyes, RN',
        status: 'Ready',
        category: 'MED_RECON',
        description: 'Verify oral ferrous sulfate intake compliance and confirm avoidance of OTC NSAIDs due to severe allergy.',
        notes: [
          {
            id: 'n-3',
            authorInitials: 'JR',
            authorName: 'Nurse Joy Reyes, RN',
            authorRole: 'Triage Nurse',
            timestamp: 'Yesterday at 09:30 AM',
            content: 'Confirmed patient stopped mefenamic acid and is taking Ferrous Sulfate 325mg OD after breakfast with vitamin C.',
          },
        ],
      },
      {
        id: 'tsk-103',
        title: 'Complete PhilHealth Konsulta prior authorization',
        dueDate: 'Due 10/07/2026',
        assignedTo: 'Cashier Maria Gomez',
        status: 'In Progress',
        category: 'AUTH',
        description: 'Generate electronic PhilHealth CF4 Konsulta attachment for diagnostic ultrasound subsidy.',
        notes: [
          {
            id: 'n-4',
            authorInitials: 'MG',
            authorName: 'Maria Gomez',
            authorRole: 'Billing Officer',
            timestamp: 'Today at 10:15 AM',
            content: 'Member PIN verified active in PhilHealth eClaims portal. Konsulta capitation subsidy of ₱500 queued.',
          },
        ],
      },
      {
        id: 'tsk-104',
        title: 'Follow up on gynecologic ultrasound referral',
        dueDate: 'Due 10/09/2026',
        assignedTo: 'Dr. Florence Espinosa',
        status: 'Ready',
        category: 'REFERRAL',
        description: 'Schedule post-treatment endometrial checkup in 21 days following Medroxyprogesterone completion.',
        notes: [],
      },
      {
        id: 'tsk-105',
        title: 'Close out patient portal intake message',
        dueDate: 'Due 10/10/2026',
        assignedTo: 'Nurse Joy Reyes, RN',
        status: 'Requested',
        category: 'MESSAGE',
        description: 'Send electronic discharge instructions and follow-up calendar reminder through SMS/portal.',
        notes: [],
      },
    ],
    medications: [
      {
        id: 'med-1',
        genericName: 'Medroxyprogesterone Acetate (RA 6675)',
        brandName: 'Provera',
        dosage: '10 mg oral tablet',
        instructions: 'Take 1 tablet daily for 10 days starting on cycle day 16 to regulate endometrial shedding.',
        status: 'ACTIVE',
        prescribedBy: 'Dr. Florence Espinosa, MD',
        datePrescribed: '2026-10-04',
      },
      {
        id: 'med-2',
        genericName: 'Tranexamic Acid',
        brandName: 'Hemostan',
        dosage: '500 mg capsule',
        instructions: 'Take 1 capsule TID during heavy menstrual bleeding days (max 5 days).',
        status: 'ACTIVE',
        prescribedBy: 'Dr. Florence Espinosa, MD',
        datePrescribed: '2026-10-04',
      },
      {
        id: 'med-3',
        genericName: 'Ferrous Sulfate + Folic Acid',
        brandName: 'Iberet-Folic',
        dosage: '60 mg elemental iron tablet',
        instructions: 'Take 1 tablet OD after meals for 60 days to treat microcytic anemia.',
        status: 'ACTIVE',
        prescribedBy: 'Dr. Florence Espinosa, MD',
        datePrescribed: '2026-09-01',
      },
    ],
    labs: [
      {
        id: 'lab-1',
        testName: 'Transvaginal & Pelvic Diagnostic Ultrasound',
        loincCode: '24606-6',
        orderedDate: '2026-10-04',
        status: 'REPORT_READY',
        resultsSummary: 'Anteverted uterus (7.8 x 4.5 x 5.1 cm). Endometrial stripe measures 14.2 mm. No adnexal masses or free pelvic fluid.',
      },
      {
        id: 'lab-2',
        testName: 'Complete Blood Count (CBC) with Platelets',
        loincCode: '58410-2',
        orderedDate: '2026-10-04',
        status: 'REPORT_READY',
        resultsSummary: 'Hemoglobin: 10.4 g/dL (Low), Hematocrit: 32% (Low), WBC: 7.2 x 10^9/L, Platelets: 285 x 10^9/L.',
      },
      {
        id: 'lab-3',
        testName: 'Routine Urinalysis',
        loincCode: '24356-8',
        orderedDate: '2026-10-04',
        status: 'REPORT_READY',
        resultsSummary: 'Color: Straw, Clear. pH: 6.0, Protein: Negative, Glucose: Negative, Pus cells: 1-2/hpf, RBC: 0-1/hpf.',
      },
    ],
    encounters: [
      {
        id: 'enc-2026-9923',
        date: 'Oct 04, 2026 · 02:00 PM',
        type: 'Outpatient Ob-Gyn Specialist Consult',
        clinician: 'Dr. Florence Espinosa, MD',
        chiefComplaint: 'Dysfunctional Uterine Bleeding workup & Transvaginal Ultrasound',
        subjective: 'Andrea reports irregular, heavy menstrual bleeding for the past 2 cycles lasting 8-10 days with passage of small clots. Mild lower abdominal cramping. Denies fever, dizziness, or syncope. Allergic to penicillin and mefenamic acid.',
        objective: 'BP: 118/76 mmHg, HR: 74 bpm, Temp: 36.6 °C, SpO2: 99%, BMI: 22.8 kg/m². Abdomen soft, non-tender, no palpable masses. Speculum exam shows closed cervical os, minimal active blood in vaginal vault. TVS shows 14.2mm endometrial thickness.',
        assessment: '1. Dysfunctional Uterine Bleeding secondary to ovulatory dysfunction (AUB-O)\n2. Mild microcytic iron deficiency anemia secondary to chronic menorrhagia\n3. Drug allergy to Penicillin & Mefenamic Acid',
        plan: '1. Medroxyprogesterone acetate 10mg PO OD x 10 days starting Day 16\n2. Tranexamic acid 500mg PO TID PRN during heavy flow days\n3. Continue Ferrous sulfate 325mg PO OD\n4. Repeat pelvic ultrasound in 3 months\n5. PhilHealth Konsulta accreditation applied',
        status: 'IN_PROGRESS',
      },
    ],
  },
  {
    id: 'pat-101',
    name: 'Juan Dela Cruz',
    dob: '1959-04-12',
    age: '067Y',
    gender: 'Male',
    race: 'Filipino / Asian',
    address: '88 Rizal Avenue, East Bajac-Bajac',
    city: 'Olongapo City',
    province: 'Zambales 2200',
    language: 'Tagalog, Ilocano, English',
    primaryClinician: 'Dr. Florence Espinosa, MD',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80',
    insurance: {
      provider: 'PhilHealth Senior Citizen Program',
      policyId: '12-345678901-2',
      groupNumber: 'OSCA-MKT-2021-9982',
      status: 'ACTIVE',
      validUntil: 'Lifetime Senior Privilege',
      konsultaAccredited: true,
      statutoryType: 'SENIOR',
      statutoryId: 'OSCA-MKT-2021-9982',
    },
    allergies: [
      { id: 'alg-4', substance: 'Aspirin / Salicylates', category: 'MEDICATION', status: 'ACTIVE', reaction: 'Bronchospasm' },
      { id: 'alg-5', substance: 'Dust Mites', category: 'ENVIRONMENTAL', status: 'ACTIVE', reaction: 'Allergic rhinitis' },
    ],
    problems: [
      { id: 'prob-4', condition: 'Essential Hypertension, Stage 1', icd10: 'I10', status: 'ACTIVE', onsetDate: '2021-03-15' },
      { id: 'prob-5', condition: 'Community-Acquired Pneumonia, Low Risk', icd10: 'J18.9', status: 'ACTIVE', onsetDate: '2026-09-28' },
    ],
    tasks: [
      {
        id: 'tsk-201',
        title: 'Review chest radiograph PA view',
        dueDate: 'Due 10/05/2026',
        assignedTo: 'Dr. Florence Espinosa',
        status: 'In Progress',
        category: 'LAB_REVIEW',
        description: 'Evaluate resolution of right basilar infiltrates following 7-day oral Amoxicillin-Clavulanate course.',
        notes: [
          {
            id: 'n-5',
            authorInitials: 'FE',
            authorName: 'Dr. Florence Espinosa, MD',
            authorRole: 'Main Doctor',
            timestamp: 'Today at 09:40 AM',
            content: 'Chest radiograph shows significant clearing of right lower lobe infiltrates. Patient afebrile.',
          },
        ],
      },
      {
        id: 'tsk-202',
        title: 'BIR Senior 20% Discount & VAT Exemption Verification',
        dueDate: 'Due 10/05/2026',
        assignedTo: 'Cashier Maria Gomez',
        status: 'Ready',
        category: 'AUTH',
        description: 'Verify OSCA ID booklet and compute 20% statutory discount + 12% VAT exemption on prescription meds.',
        notes: [],
      },
    ],
    medications: [
      {
        id: 'med-4',
        genericName: 'Losartan Potassium (RA 6675)',
        brandName: 'Cozaar',
        dosage: '50 mg oral tablet',
        instructions: 'Take 1 tablet OD every morning for blood pressure control.',
        status: 'ACTIVE',
        prescribedBy: 'Dr. Florence Espinosa, MD',
        datePrescribed: '2026-08-12',
      },
      {
        id: 'med-5',
        genericName: 'Amoxicillin + Clavulanate (RA 6675)',
        brandName: 'Augmentin',
        dosage: '625 mg oral tablet',
        instructions: 'Take 1 tablet BID with food for 7 days to treat CAP-LR.',
        status: 'ACTIVE',
        prescribedBy: 'Dr. Florence Espinosa, MD',
        datePrescribed: '2026-09-28',
      },
    ],
    labs: [
      {
        id: 'lab-4',
        testName: 'Chest X-Ray PA View',
        loincCode: '24648-8',
        orderedDate: '2026-10-04',
        status: 'REPORT_READY',
        resultsSummary: 'Resolving consolidation in right lower lobe. Clear costophrenic angles. Normal cardiothoracic ratio.',
      },
    ],
    encounters: [
      {
        id: 'enc-2026-9915',
        date: 'Oct 04, 2026 · 09:15 AM',
        type: 'General Medical Outpatient Follow-up',
        clinician: 'Dr. Florence Espinosa, MD',
        chiefComplaint: 'Follow-up for cough and elevated blood pressure',
        subjective: 'Patient reports cough is significantly reduced with no fever or hemoptysis. Complies with morning Losartan.',
        objective: 'BP: 130/85 mmHg, HR: 78 bpm, Temp: 36.6 °C, SpO2: 98%, BMI: 25.0 kg/m².',
        assessment: '1. Community-Acquired Pneumonia, Low Risk (CAP-LR), resolving\n2. Essential Hypertension (controlled)\n3. Senior Citizen (RA 9994 privileges applied)',
        plan: 'Complete antibiotics, continue Losartan 50mg OD, return in 3 months for lipid & fasting glucose panel.',
        status: 'COMPLETED',
      },
    ],
  },
  {
    id: 'pat-102',
    name: 'Maria Angelica Santos',
    dob: '1992-08-25',
    age: '034Y',
    gender: 'Female',
    race: 'Filipino / Asian',
    address: '45 Gordon Avenue, New Kalalake',
    city: 'Olongapo City',
    province: 'Zambales 2200',
    language: 'Tagalog, English',
    primaryClinician: 'Dr. Florence Espinosa, MD',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&h=160&q=80',
    insurance: {
      provider: 'PhilHealth Konsulta',
      policyId: '09-876543210-9',
      groupNumber: 'KONSULTA-R3-OLG',
      status: 'ACTIVE',
      validUntil: '12/31/2026',
      konsultaAccredited: true,
      statutoryType: 'REGULAR',
    },
    allergies: [],
    problems: [
      { id: 'prob-6', condition: 'Intrauterine Pregnancy at 28 weeks AOG (G1P0)', icd10: 'Z34.03', status: 'ACTIVE', onsetDate: '2026-03-20' },
      { id: 'prob-7', condition: 'Gestational Diabetes Mellitus (diet controlled)', icd10: 'O24.414', status: 'ACTIVE', onsetDate: '2026-08-15' },
    ],
    tasks: [
      {
        id: 'tsk-301',
        title: 'Review 50g Glucose Challenge Test & HbA1c',
        dueDate: 'Due 10/06/2026',
        assignedTo: 'Dr. Florence Espinosa',
        status: 'Ready',
        category: 'LAB_REVIEW',
        description: 'Review 2nd trimester 75g OGTT results. Fasting: 88 mg/dL, 1-hr: 142 mg/dL, 2-hr: 128 mg/dL.',
        notes: [],
      },
    ],
    medications: [
      {
        id: 'med-6',
        genericName: 'Prenatal Multivitamins + DHA',
        brandName: 'Obimin Plus',
        dosage: '1 softgel capsule',
        instructions: 'Take 1 capsule OD after meals throughout pregnancy.',
        status: 'ACTIVE',
        prescribedBy: 'Dr. Florence Espinosa, MD',
        datePrescribed: '2026-03-20',
      },
      {
        id: 'med-7',
        genericName: 'Calcium Carbonate + Cholecalciferol',
        brandName: 'Caltrate Plus',
        dosage: '600 mg tablet',
        instructions: 'Take 1 tablet OD at bedtime.',
        status: 'ACTIVE',
        prescribedBy: 'Dr. Florence Espinosa, MD',
        datePrescribed: '2026-04-15',
      },
    ],
    labs: [
      {
        id: 'lab-5',
        testName: 'Obstetric Ultrasound (Biophysical Profile & Doppler)',
        loincCode: '11522-0',
        orderedDate: '2026-10-04',
        status: 'REPORT_READY',
        resultsSummary: 'Single live intrauterine pregnancy in cephalic presentation. BPD: 72mm, FL: 53mm, AC: 240mm. Estimated fetal weight: 1,220g. AFI: 14cm (normal).',
      },
    ],
    encounters: [
      {
        id: 'enc-2026-9918',
        date: 'Oct 04, 2026 · 01:15 PM',
        type: 'Antenatal Routine Checkup',
        clinician: 'Dr. Florence Espinosa, MD',
        chiefComplaint: '28 weeks AOG routine antenatal checkup & Pelvic ultrasound review',
        subjective: 'Good fetal movements felt. Denies vaginal spotting, watery discharge, or uterine contractions. Blood sugar log normal.',
        objective: 'BP: 110/70 mmHg, Fundic Height: 28 cm, FHR: 144 bpm regular. Urine dipstick protein: negative, glucose: negative.',
        assessment: '1. Intrauterine pregnancy 28 weeks AOG, cephalic, appropriate for gestational age\n2. Gestational diabetes mellitus, well-controlled on dietary management',
        plan: 'Continue prenatal vitamins, maintain 1,800 kcal diet, repeat checkup in 2 weeks.',
        status: 'IN_PROGRESS',
      },
    ],
  },
];
