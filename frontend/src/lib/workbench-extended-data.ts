// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

export interface TimelineEventItem {
  id: string;
  patientId: string;
  title: string;
  category: 'ENCOUNTER' | 'LAB' | 'RX' | 'CLAIM' | 'VITALS' | 'ALLERGY';
  date: string;
  time: string;
  clinician: string;
  facility: string;
  description: string;
  statusBadge: string;
  badgeVariant: 'emerald' | 'blue' | 'purple' | 'amber' | 'sky';
  vitals?: {
    bp?: string;
    hr?: string;
    spo2?: string;
    temp?: string;
    bmi?: string;
    bs?: string;
  };
  details?: string[];
}

export interface ChatMessageItem {
  id: string;
  sender: string;
  role: string;
  avatarText: string;
  isSelf: boolean;
  time: string;
  text: string;
  attachmentName?: string;
}

export interface MessageThreadItem {
  id: string;
  patientId: string;
  contactName: string;
  contactRole: string;
  avatarText: string;
  lastMessageSnippet: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
  channel: 'CLINICAL_PORTAL' | 'SMS_BRIDGE' | 'CARE_TEAM';
  messages: ChatMessageItem[];
}

export interface DoseSpotRxItem {
  id: string;
  patientId: string;
  drugName: string;
  brandName: string;
  dosage: string;
  sig: string;
  quantity: string;
  refillsRemaining: number;
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyPhone: string;
  status: 'TRANSMITTED' | 'DISPENSED' | 'PENDING_APPROVAL' | 'CANCELLED';
  orderDate: string;
  pdeaControlledS2: boolean;
  deaVerificationCode?: string;
  drugInteractionRisk: 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE';
}

export interface ConnectedHealthDevice {
  id: string;
  patientId: string;
  deviceName: string;
  deviceType: 'BLOOD_PRESSURE' | 'GLUCOMETER' | 'PULSE_OXIMETER' | 'WEIGHT_SCALE';
  connectivity: 'Bluetooth Low Energy' | 'NFC Wireless' | 'Wi-Fi Cloud Sync';
  batteryLevel: number;
  syncStatus: 'ONLINE' | 'STANDBY' | 'SYNCING' | 'OFFLINE';
  lastSyncTime: string;
  currentReading: string;
  targetRange: string;
  isAbnormal: boolean;
  metricHistory: Array<{ date: string; value: string; status: 'NORMAL' | 'ELEVATED' | 'HIGH' }>;
}

export interface PatientDocumentRecord {
  id: string;
  patientId: string;
  title: string;
  documentCategory: 'PHILHEALTH_CF4' | 'DIAGNOSTIC_IMAGING' | 'LAB_REPORT' | 'CONSENT_FORM' | 'DISCHARGE_SUMMARY';
  fileFormat: 'PDF' | 'DICOM' | 'DOCX';
  fileSize: string;
  uploadedDate: string;
  authorName: string;
  authorPrc: string;
  isSigned: boolean;
  digitalSignatureHash: string;
  summary: string;
}

export interface CarePlanPathway {
  id: string;
  patientId: string;
  pathwayTitle: string;
  protocolStandard: string;
  enrollmentDate: string;
  leadClinician: string;
  progressPercentage: number;
  status: 'ACTIVE_ON_TRACK' | 'REQUIRES_REVIEW' | 'COMPLETED';
  clinicalGoals: Array<{
    id: string;
    targetTitle: string;
    currentValue: string;
    targetValue: string;
    isAchieved: boolean;
  }>;
  scheduledInterventions: Array<{
    id: string;
    title: string;
    dueTimeline: string;
    assignedProvider: string;
    isDone: boolean;
  }>;
  guidelineNotes: string;
}

// ============================================================================
// MOCK DATA STORE
// ============================================================================

export const EXTENDED_TIMELINE_EVENTS: Record<string, TimelineEventItem[]> = {
  'pat-101': [
    {
      id: 'tl-101-1',
      patientId: 'pat-101',
      title: 'Konsulta Outpatient Encounter & Medication Review',
      category: 'ENCOUNTER',
      date: 'Today, Oct 04, 2026',
      time: '10:30 AM',
      clinician: 'Dr. Florence Espinosa, MD (PRC 0098412)',
      facility: 'Metro Health - Olongapo Main Clinic (Room 204)',
      description: 'Follow-up consultation for Essential Hypertension Stage 1 and recovery evaluation for community-acquired pneumonia. Patient is clinically stable with controlled BP.',
      statusBadge: 'Completed',
      badgeVariant: 'emerald',
      vitals: {
        bp: '128/82 mmHg',
        hr: '72 bpm',
        spo2: '98%',
        temp: '36.5 °C',
        bmi: '24.8 kg/m²',
        bs: '108 mg/dL',
      },
      details: [
        'Chest auscultation: Clear breath sounds bilaterally, no crackles or rhonchi',
        'OSCA 20% Senior Citizen discount and VAT exemption certified on chart',
        'PhilHealth CF4 electronic transmittal prepared for submission',
      ],
    },
    {
      id: 'tl-101-2',
      patientId: 'pat-101',
      title: 'Automated RPM Telemetry Sync (Omron Evolv BP)',
      category: 'VITALS',
      date: 'Today, Oct 04, 2026',
      time: '08:15 AM',
      clinician: 'Omron Wireless Telemetry Gateway',
      facility: 'Home Telehealth Monitoring (East Bajac-Bajac)',
      description: 'Morning resting arterial blood pressure logged via Bluetooth monitor. Values meet the targeted European & Philippine Society of Hypertension guidelines (<130/80 mmHg).',
      statusBadge: 'Normal Target',
      badgeVariant: 'sky',
      vitals: {
        bp: '128/82 mmHg',
        hr: '72 bpm',
      },
      details: ['Cuff position: Left Upper Arm', 'Pulse pressure: 46 mmHg', 'Irregular heartbeat detector: Negative'],
    },
    {
      id: 'tl-101-3',
      patientId: 'pat-101',
      title: 'DoseSpot Electronic Prescription Transmittal (Rx-2026-901)',
      category: 'RX',
      date: 'Oct 02, 2026',
      time: '03:45 PM',
      clinician: 'Dr. Florence Espinosa, MD',
      facility: 'Mercury Drug #0412 (East Bajac-Bajac Branch)',
      description: 'Philippine Generics Act RA 6675 refill order transmitted electronically. Losartan Potassium 50mg tablets #30 dispensed with Senior Citizen statutory discount applied.',
      statusBadge: 'Dispensed',
      badgeVariant: 'blue',
      details: ['Dispensed item: Losartan Potassium 50mg #30', 'Pharmacist on Duty: RPh. Mary Ann Santos (PRC 0048192)'],
    },
    {
      id: 'tl-101-4',
      patientId: 'pat-101',
      title: 'PhilHealth Konsulta Capitation Claim Verified (TR-2026-00412)',
      category: 'CLAIM',
      date: 'Sep 28, 2026',
      time: '11:20 AM',
      clinician: 'Central Billing Office (EHR Cashier)',
      facility: 'PhilHealth Regional Office 3 (Central Luzon)',
      description: 'Konsulta First Tranche Comprehensive Package transmittal verified and pre-approved by PhilHealth claims adjudicator. Benefit credit applied to patient account.',
      statusBadge: 'Approved · ₱1,750.00',
      badgeVariant: 'purple',
      details: ['Package: Konsulta First Visit Package (K01)', 'Statutory PIN: 12-345678901-2', 'Accredited facility: Metro Health PH'],
    },
    {
      id: 'tl-101-5',
      patientId: 'pat-101',
      title: 'Diagnostic Chest X-Ray & Comprehensive Chemistry',
      category: 'LAB',
      date: 'Sep 20, 2026',
      time: '09:00 AM',
      clinician: 'Dr. Ramon Bautista, MD, FPCR (Radiologist)',
      facility: 'Metro Health Imaging & Diagnostic Suite',
      description: 'PA Chest Radiograph confirms complete resolution of previously noted right lower lobe opacity. Fasting blood glucose is 108 mg/dL; Serum Creatinine 0.9 mg/dL.',
      statusBadge: 'Resolved',
      badgeVariant: 'emerald',
      details: ['Cardiac silhouette within normal limits', 'Costophrenic sulci sharp bilaterally', 'eGFR > 60 mL/min/1.73m² (Normal renal clearance)'],
    },
  ],
  'pat-105': [
    {
      id: 'tl-105-1',
      patientId: 'pat-105',
      title: 'Transvaginal Ultrasound (TVS) Diagnostic Evaluation',
      category: 'LAB',
      date: 'Today, Oct 04, 2026',
      time: '01:45 PM',
      clinician: 'Dr. Ramon Bautista, MD, FPCR',
      facility: 'Metro Health Ultrasound Suite (Room 202)',
      description: 'Endometrial thickening verified at 14.2mm with uniform secretory echotexture. No adnexal pathology or cystic masses detected.',
      statusBadge: 'Report Ready',
      badgeVariant: 'blue',
      details: ['Endometrial thickness: 14.2 mm', 'Right ovary: 2.8 x 1.9 cm', 'Left ovary: 2.5 x 1.7 cm'],
    },
    {
      id: 'tl-105-2',
      patientId: 'pat-105',
      title: 'Consultation for Dysfunctional Uterine Bleeding',
      category: 'ENCOUNTER',
      date: 'Today, Oct 04, 2026',
      time: '02:00 PM',
      clinician: 'Dr. Florence Espinosa, MD',
      facility: 'Metro Health Ob-Gyn Suite (Room 201)',
      description: 'Clinical examination and formulation of progestin management protocol under Philippine Ob-Gyn clinical practice guidelines.',
      statusBadge: 'In Progress',
      badgeVariant: 'amber',
      vitals: {
        bp: '118/76 mmHg',
        hr: '74 bpm',
        spo2: '99%',
        temp: '36.6 °C',
        bmi: '22.8 kg/m²',
      },
    },
  ],
};

export const EXTENDED_MESSAGE_THREADS: Record<string, MessageThreadItem[]> = {
  'pat-101': [
    {
      id: 'thr-101-1',
      patientId: 'pat-101',
      contactName: 'Juan Dela Cruz (Patient)',
      contactRole: 'Patient Portal & SMS Bridge',
      avatarText: 'JD',
      lastMessageSnippet: 'Opo Tatay Juan, huwag ninyong ititigil ang Losartan 50mg...',
      timestamp: '2 mins ago',
      unreadCount: 1,
      isOnline: true,
      channel: 'SMS_BRIDGE',
      messages: [
        {
          id: 'msg-1',
          sender: 'Juan Dela Cruz',
          role: 'Patient',
          avatarText: 'JD',
          isSelf: false,
          time: '10:05 AM',
          text: 'Magandang araw po Doktora Florence. Natapos ko na po yung 7-day amoxicillin course para sa ubo ko. Kailangan ko pa po ba ipagpatuloy?',
        },
        {
          id: 'msg-2',
          sender: 'Dr. Florence Espinosa, MD',
          role: 'Attending Physician',
          avatarText: 'FE',
          isSelf: true,
          time: '10:18 AM',
          text: 'Magandang araw Tatay Juan! Mabuti at natapos niyo ang buong 7 days. Kamusta po ang ubo at lagnat? May plema pa po ba o hirap huminga?',
        },
        {
          id: 'msg-3',
          sender: 'Juan Dela Cruz',
          role: 'Patient',
          avatarText: 'JD',
          isSelf: false,
          time: '10:24 AM',
          text: 'Wala na pong lagnat Doktora, medyo may konting tuyong ubo na lang sa umaga pero maaliwalas na ang dibdib ko. Tuloy pa rin po ba ang Losartan 50mg ko tuwing umaga?',
        },
        {
          id: 'msg-4',
          sender: 'Dr. Florence Espinosa, MD',
          role: 'Attending Physician',
          avatarText: 'FE',
          isSelf: true,
          time: '10:30 AM',
          text: 'Opo Tatay Juan, huwag ninyong ititigil ang Losartan 50mg. Maintenance po ninyo iyon para sa presyon. Na-check ko po ang BP ninyo sa Omron device kanina, 128/82 mmHg na po, napakaganda ng control. Ingat po palagi at tawagan lang kami kung may katanungan.',
        },
        {
          id: 'msg-5',
          sender: 'Juan Dela Cruz',
          role: 'Patient',
          avatarText: 'JD',
          isSelf: false,
          time: '10:32 AM',
          text: 'Maraming salamat po Doktora at kay Nurse Joy sa maagang pag-update!',
        },
      ],
    },
    {
      id: 'thr-101-2',
      patientId: 'pat-101',
      contactName: 'Nurse Joy Reyes, RN',
      contactRole: 'Triage & Vital Signs Station',
      avatarText: 'JR',
      lastMessageSnippet: 'Patient arrived early. Morning BP confirmed 128/82 mmHg in Room 203.',
      timestamp: '1 hour ago',
      unreadCount: 0,
      isOnline: true,
      channel: 'CARE_TEAM',
      messages: [
        {
          id: 'msg-201',
          sender: 'Nurse Joy Reyes, RN',
          role: 'Triage Nurse',
          avatarText: 'JR',
          isSelf: false,
          time: '08:45 AM',
          text: 'Good morning Dr. Espinosa! Tatay Juan Dela Cruz has synced his Omron wireless BP device from home. Reading is 128/82 mmHg. Vitals logged in telemetry dashboard.',
        },
        {
          id: 'msg-202',
          sender: 'Dr. Florence Espinosa, MD',
          role: 'Attending Physician',
          avatarText: 'FE',
          isSelf: true,
          time: '08:50 AM',
          text: 'Thank you Joy! Excellent control. Please confirm his Senior Citizen OSCA ID is attached to the billing invoice.',
        },
      ],
    },
    {
      id: 'thr-101-3',
      patientId: 'pat-101',
      contactName: 'Mercury Drug Olongapo',
      contactRole: 'Accredited Dispensing Pharmacy',
      avatarText: 'MD',
      lastMessageSnippet: 'Prescription Rx-2026-901 has been claimed and dispensed to patient.',
      timestamp: 'Oct 02, 2026',
      unreadCount: 0,
      isOnline: false,
      channel: 'CLINICAL_PORTAL',
      messages: [
        {
          id: 'msg-301',
          sender: 'Mercury Drug Dispensing System',
          role: 'Pharmacy Portal',
          avatarText: 'MD',
          isSelf: false,
          time: '04:10 PM',
          text: 'Electronic prescription for Losartan Potassium 50mg #30 claimed with 20% OSCA discount. Batch transmittal verified.',
        },
      ],
    },
    {
      id: 'thr-101-4',
      patientId: 'pat-101',
      contactName: 'PhilHealth Konsulta Coordinator',
      contactRole: 'eClaims Regulatory Liaison',
      avatarText: 'PH',
      lastMessageSnippet: 'Batch submission TR-2026-00412 pre-approved by Regional Office 3.',
      timestamp: 'Sep 28, 2026',
      unreadCount: 0,
      isOnline: false,
      channel: 'CARE_TEAM',
      messages: [
        {
          id: 'msg-401',
          sender: 'PhilHealth Konsulta Liaison',
          role: 'Billing Liaison',
          avatarText: 'PH',
          isSelf: false,
          time: '11:15 AM',
          text: 'Verification confirmed: Juan Dela Cruz (PIN 12-345678901-2) eligible for First Tranche Konsulta consultation subsidy (₱1,750.00).',
        },
      ],
    },
  ],
  'pat-105': [
    {
      id: 'thr-105-1',
      patientId: 'pat-105',
      contactName: 'Andrea Dizon (Patient)',
      contactRole: 'Patient Portal',
      avatarText: 'AD',
      lastMessageSnippet: 'Doktora, ready na po ang lab results ng ultrasound ko sa reception.',
      timestamp: '15 mins ago',
      unreadCount: 1,
      isOnline: true,
      channel: 'CLINICAL_PORTAL',
      messages: [
        {
          id: 'msg-105-1',
          sender: 'Andrea Dizon',
          role: 'Patient',
          avatarText: 'AD',
          isSelf: false,
          time: '01:30 PM',
          text: 'Good afternoon Dra. Espinosa. Katatapos lang po ng transvaginal ultrasound ko. Aakyat na po ako sa clinic.',
        },
      ],
    },
  ],
};

export const EXTENDED_DOSESPOT_DATA: Record<string, DoseSpotRxItem[]> = {
  'pat-101': [
    {
      id: 'ds-1',
      patientId: 'pat-101',
      drugName: 'Losartan Potassium (RA 6675)',
      brandName: 'Cozaar',
      dosage: '50 mg oral tablet',
      sig: 'Take 1 tablet orally once daily in the morning with water.',
      quantity: '30 tablets (1 month supply)',
      refillsRemaining: 2,
      pharmacyName: 'Mercury Drug Corporation #0412',
      pharmacyAddress: 'East Bajac-Bajac, Rizal Avenue, Olongapo City',
      pharmacyPhone: '(047) 224-8891',
      status: 'TRANSMITTED',
      orderDate: '2026-10-02',
      pdeaControlledS2: false,
      drugInteractionRisk: 'NONE',
    },
    {
      id: 'ds-2',
      patientId: 'pat-101',
      drugName: 'Amlodipine Besylate',
      brandName: 'Norvasc',
      dosage: '5 mg oral tablet',
      sig: 'Take 1 tablet daily at bedtime if systolic blood pressure exceeds 140 mmHg.',
      quantity: '30 tablets',
      refillsRemaining: 1,
      pharmacyName: 'Southstar Drug - Rizal Avenue',
      pharmacyAddress: 'Rizal Avenue, East Tapinac, Olongapo City',
      pharmacyPhone: '(047) 222-4100',
      status: 'DISPENSED',
      orderDate: '2026-09-15',
      pdeaControlledS2: false,
      drugInteractionRisk: 'LOW',
    },
    {
      id: 'ds-3',
      patientId: 'pat-101',
      drugName: 'Paracetamol (Acetaminophen)',
      brandName: 'Biogesic',
      dosage: '500 mg tablet',
      sig: 'Take 1 tablet every 4 to 6 hours as needed for headache or joint pain (Max 4g/day).',
      quantity: '20 tablets',
      refillsRemaining: 0,
      pharmacyName: 'The Generics Pharmacy (TGP)',
      pharmacyAddress: 'Gordon Avenue, Olongapo City',
      pharmacyPhone: '(047) 224-1188',
      status: 'DISPENSED',
      orderDate: '2026-09-02',
      pdeaControlledS2: false,
      drugInteractionRisk: 'NONE',
    },
  ],
  'pat-105': [
    {
      id: 'ds-105-1',
      patientId: 'pat-105',
      drugName: 'Medroxyprogesterone Acetate (RA 6675)',
      brandName: 'Provera',
      dosage: '10 mg oral tablet',
      sig: 'Take 1 tablet daily for 10 days starting on cycle day 16.',
      quantity: '10 tablets',
      refillsRemaining: 2,
      pharmacyName: 'Mercury Drug - Magsaysay Branch',
      pharmacyAddress: 'Magsaysay Drive, Olongapo City',
      pharmacyPhone: '(047) 224-5561',
      status: 'TRANSMITTED',
      orderDate: '2026-10-04',
      pdeaControlledS2: false,
      drugInteractionRisk: 'NONE',
    },
  ],
};

export const EXTENDED_CONNECTED_DEVICES: Record<string, ConnectedHealthDevice[]> = {
  'pat-101': [
    {
      id: 'dev-1',
      patientId: 'pat-101',
      deviceName: 'Omron Evolv Wireless Blood Pressure Monitor',
      deviceType: 'BLOOD_PRESSURE',
      connectivity: 'Bluetooth Low Energy',
      batteryLevel: 85,
      syncStatus: 'ONLINE',
      lastSyncTime: '14 mins ago',
      currentReading: '128 / 82 mmHg (HR: 72 bpm)',
      targetRange: 'Target < 130 / 80 mmHg',
      isAbnormal: false,
      metricHistory: [
        { date: 'Today 08:15 AM', value: '128/82 mmHg', status: 'NORMAL' },
        { date: 'Yesterday 07:30 PM', value: '126/80 mmHg', status: 'NORMAL' },
        { date: 'Oct 02 08:00 AM', value: '132/84 mmHg', status: 'ELEVATED' },
        { date: 'Oct 01 08:10 AM', value: '134/86 mmHg', status: 'ELEVATED' },
      ],
    },
    {
      id: 'dev-2',
      patientId: 'pat-101',
      deviceName: 'Accu-Chek Instant Wireless Blood Glucose Meter',
      deviceType: 'GLUCOMETER',
      connectivity: 'NFC Wireless',
      batteryLevel: 92,
      syncStatus: 'ONLINE',
      lastSyncTime: '2 hours ago',
      currentReading: '108 mg/dL (Fasting)',
      targetRange: 'Target 70 - 130 mg/dL',
      isAbnormal: false,
      metricHistory: [
        { date: 'Today 07:00 AM', value: '108 mg/dL', status: 'NORMAL' },
        { date: 'Yesterday Fasting', value: '112 mg/dL', status: 'NORMAL' },
        { date: 'Oct 02 Post-meal', value: '138 mg/dL', status: 'NORMAL' },
      ],
    },
    {
      id: 'dev-3',
      patientId: 'pat-101',
      deviceName: 'Wellue O2Ring Continuous Nocturnal Pulse Oximeter',
      deviceType: 'PULSE_OXIMETER',
      connectivity: 'BLE Telemetry',
      batteryLevel: 74,
      syncStatus: 'STANDBY',
      lastSyncTime: '4 hours ago',
      currentReading: 'SpO2: 98% · Pulse: 72 bpm',
      targetRange: 'Target SpO2 > 95%',
      isAbnormal: false,
      metricHistory: [
        { date: 'Last Night Mean', value: 'SpO2 97.8%', status: 'NORMAL' },
        { date: 'Lowest SpO2 Drop', value: 'SpO2 96%', status: 'NORMAL' },
      ],
    },
  ],
  'pat-105': [
    {
      id: 'dev-105-1',
      patientId: 'pat-105',
      deviceName: 'Withings Body+ Smart Composition Scale',
      deviceType: 'WEIGHT_SCALE',
      connectivity: 'Wi-Fi Cloud Sync',
      batteryLevel: 88,
      syncStatus: 'ONLINE',
      lastSyncTime: 'Today 07:15 AM',
      currentReading: '58.4 kg (BMI: 22.8 kg/m²)',
      targetRange: 'Target 56 - 60 kg',
      isAbnormal: false,
      metricHistory: [
        { date: 'Today', value: '58.4 kg', status: 'NORMAL' },
        { date: 'Last Week', value: '58.9 kg', status: 'NORMAL' },
      ],
    },
  ],
};

export const EXTENDED_PATIENT_DOCUMENTS: Record<string, PatientDocumentRecord[]> = {
  'pat-101': [
    {
      id: 'doc-1',
      patientId: 'pat-101',
      title: 'PhilHealth_Konsulta_CF4_Form_Signed.pdf',
      documentCategory: 'PHILHEALTH_CF4',
      fileFormat: 'PDF',
      fileSize: '420 KB',
      uploadedDate: 'Oct 04, 2026',
      authorName: 'Dr. Florence Espinosa, MD',
      authorPrc: 'PRC 0098412',
      isSigned: true,
      digitalSignatureHash: 'sha256-e9b401fa94bc218903cde882b491a92e8870192a83f12019',
      summary: 'Official PhilHealth Clinical Form 4 detailing Konsulta First Tranche Clinical Summary, ICD-10 diagnostic codes (I10, J18.9), and primary management plan.',
    },
    {
      id: 'doc-2',
      patientId: 'pat-101',
      title: 'Chest_XRay_PA_Radiology_Report.pdf',
      documentCategory: 'DIAGNOSTIC_IMAGING',
      fileFormat: 'PDF',
      fileSize: '2.8 MB',
      uploadedDate: 'Oct 02, 2026',
      authorName: 'Dr. Ramon Bautista, MD, FPCR',
      authorPrc: 'PRC 0089211',
      isSigned: true,
      digitalSignatureHash: 'sha256-a1928019b882310f92bce81938b8192a83918230910f8192',
      summary: 'Official radiologist report confirming complete resolution of previously noted right lower lobe pneumonia. Normal heart size and clear lung parenchyma.',
    },
    {
      id: 'doc-3',
      patientId: 'pat-101',
      title: 'Clinical_Chemistry_Comprehensive_Panel.pdf',
      documentCategory: 'LAB_REPORT',
      fileFormat: 'PDF',
      fileSize: '840 KB',
      uploadedDate: 'Sep 20, 2026',
      authorName: 'Quest Diagnostic Clinical Laboratory',
      authorPrc: 'DOH-LIC-03-9182',
      isSigned: true,
      digitalSignatureHash: 'sha256-ff819230198129ba819208192081920192a910283019281a',
      summary: 'Fasting Blood Sugar 108 mg/dL, HbA1c 6.2%, Serum Creatinine 0.9 mg/dL, Total Cholesterol 185 mg/dL. Renal profile within normal reference.',
    },
    {
      id: 'doc-4',
      patientId: 'pat-101',
      title: 'Informed_Consent_Telehealth_Monitoring.pdf',
      documentCategory: 'CONSENT_FORM',
      fileFormat: 'PDF',
      fileSize: '185 KB',
      uploadedDate: 'Sep 15, 2026',
      authorName: 'Juan Dela Cruz (Patient Signer)',
      authorPrc: 'OSCA-INT-2021-0082',
      isSigned: true,
      digitalSignatureHash: 'sha256-cc18291029182a9182918291029102910291829182910291',
      summary: 'Executed patient consent for remote patient monitoring (RPM), SMS notification dispatch, and digital prescription transmission under Data Privacy Act (RA 10173).',
    },
  ],
  'pat-105': [
    {
      id: 'doc-105-1',
      patientId: 'pat-105',
      title: 'Transvaginal_Ultrasound_HighRes_Scan.pdf',
      documentCategory: 'DIAGNOSTIC_IMAGING',
      fileFormat: 'PDF',
      fileSize: '4.2 MB',
      uploadedDate: 'Oct 04, 2026',
      authorName: 'Dr. Ramon Bautista, MD, FPCR',
      authorPrc: 'PRC 0089211',
      isSigned: true,
      digitalSignatureHash: 'sha256-9182019280192a8192019283019283019283019283019283',
      summary: 'Pelvic and TVS diagnostic scan images showing 14.2mm endometrial stripe measurement.',
    },
  ],
};

export const EXTENDED_CARE_PLANS: Record<string, CarePlanPathway[]> = {
  'pat-101': [
    {
      id: 'cp-1',
      patientId: 'pat-101',
      pathwayTitle: 'PhilHealth Konsulta Essential Hypertension Pathway (Stage 1)',
      protocolStandard: 'Philippine Society of Hypertension & WHO Clinical Practice Guidelines 2026',
      enrollmentDate: 'Enrolled Sep 15, 2026',
      leadClinician: 'Dr. Florence Espinosa, MD (PRC 0098412)',
      progressPercentage: 85,
      status: 'ACTIVE_ON_TRACK',
      guidelineNotes: 'Patient demonstrates high medication adherence and active biometric logging. BP controlled at 128/82 mmHg under Losartan monotherapy. Continue sodium restriction and low-impact morning walking.',
      clinicalGoals: [
        {
          id: 'g-1',
          targetTitle: 'Target Resting Systolic BP < 130 mmHg',
          currentValue: '128 mmHg',
          targetValue: '< 130 mmHg',
          isAchieved: true,
        },
        {
          id: 'g-2',
          targetTitle: 'Target Resting Diastolic BP < 80 mmHg',
          currentValue: '82 mmHg',
          targetValue: '< 80 mmHg',
          isAchieved: false,
        },
        {
          id: 'g-3',
          targetTitle: 'Daily Sodium Intake Restriction (< 2,000 mg/day)',
          currentValue: 'Self-reported ~1,800 mg/day',
          targetValue: '< 2,000 mg/day',
          isAchieved: true,
        },
        {
          id: 'g-4',
          targetTitle: 'Oral Antihypertensive Adherence Rate (> 95%)',
          currentValue: '98% on-time doses',
          targetValue: '> 95%',
          isAchieved: true,
        },
      ],
      scheduledInterventions: [
        {
          id: 'int-1',
          title: 'Quarterly Serum Electrolytes & Renal Function Panel',
          dueTimeline: 'Due December 15, 2026',
          assignedProvider: 'Quest Diagnostic Laboratory',
          isDone: false,
        },
        {
          id: 'int-2',
          title: 'Annual Dilated Eye Fundoscopy for Hypertensive Retinopathy',
          dueTimeline: 'Due November 20, 2026',
          assignedProvider: 'Ophthalmology Clinic',
          isDone: false,
        },
        {
          id: 'int-3',
          title: 'Monthly Remote Telehealth Follow-up & DoseSpot Refill',
          dueTimeline: 'Due November 04, 2026',
          assignedProvider: 'Dr. Florence Espinosa, MD',
          isDone: false,
        },
      ],
    },
    {
      id: 'cp-2',
      patientId: 'pat-101',
      pathwayTitle: 'Cardiovascular Risk Prevention & Pneumonia Convalescence',
      protocolStandard: 'Philippine College of Chest Physicians (PCCP) Guidelines',
      enrollmentDate: 'Enrolled Sep 20, 2026',
      leadClinician: 'Nurse Joy Reyes, RN (Care Coordinator)',
      progressPercentage: 92,
      status: 'ACTIVE_ON_TRACK',
      guidelineNotes: 'Recovery from low-risk CAP complete. Lungs clear. Annual Pneumococcal and Influenza vaccinations scheduled prior to rainy season.',
      clinicalGoals: [
        {
          id: 'g-201',
          targetTitle: 'Resting Oxygen Saturation SpO2 > 96%',
          currentValue: '98% on room air',
          targetValue: '> 96%',
          isAchieved: true,
        },
        {
          id: 'g-202',
          targetTitle: 'Annual Flu & Pneumococcal Vaccine Booster',
          currentValue: 'Pneumococcal PCV20 scheduled',
          targetValue: 'Complete',
          isAchieved: false,
        },
      ],
      scheduledInterventions: [
        {
          id: 'int-201',
          title: 'Administer Pneumococcal PCV20 Immunization',
          dueTimeline: 'Due October 18, 2026',
          assignedProvider: 'Nurse Joy Reyes, RN',
          isDone: false,
        },
      ],
    },
  ],
  'pat-105': [
    {
      id: 'cp-105-1',
      patientId: 'pat-105',
      pathwayTitle: 'Dysfunctional Uterine Bleeding (AUB-O) Management',
      protocolStandard: 'Philippine Obstetrical & Gynecological Society (POGS)',
      enrollmentDate: 'Enrolled Oct 04, 2026',
      leadClinician: 'Dr. Florence Espinosa, MD',
      progressPercentage: 60,
      status: 'ACTIVE_ON_TRACK',
      guidelineNotes: 'Progestin cyclic therapy initiated. Repeat pelvic ultrasound in 3 months.',
      clinicalGoals: [
        {
          id: 'g-105-1',
          targetTitle: 'Hemoglobin Stabilization > 12.0 g/dL',
          currentValue: '10.4 g/dL',
          targetValue: '> 12.0 g/dL',
          isAchieved: false,
        },
      ],
      scheduledInterventions: [
        {
          id: 'int-105-1',
          title: 'Repeat Pelvic & Transvaginal Ultrasound',
          dueTimeline: 'Due January 04, 2027',
          assignedProvider: 'Dr. Ramon Bautista, FPCR',
          isDone: false,
        },
      ],
    },
  ],
};
