'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import {
  WORKBENCH_PATIENTS,
  PatientProfileData,
  ClinicalTask,
  PatientAllergy,
  PatientProblem,
  ClinicalTaskNote,
  PatientMedication,
  PatientLabOrder,
  PatientEncounter,
} from '@/lib/workbench-patient-data';
import {
  CLINIC_BRANCHES,
  BranchLocation,
  calculatePhilippineDiscount,
  formatPhp,
} from '@/lib/ph-constants';
import {
  StaffUser,
  INITIAL_STAFF_USERS,
  canUserAccessBranch,
} from '@/lib/user-management-store';
import {
  QueueStage,
  QueuePatientItem,
  INITIAL_BRANCH_QUEUES,
} from '@/lib/branch-workspace-store';
import {
  ClinicAppointment,
  INITIAL_APPOINTMENTS,
} from '@/lib/appointment-store';
import { PrintableBillingModal, BillingLineItem } from './PrintableBillingModal';
import { PrintablePrescriptionModal, PrescriptionItem } from './PrintablePrescriptionModal';
import { CommandSearchModal } from './CommandSearchModal';
import {
  Search,
  Users,
  Calendar,
  Mail,
  ClipboardCheck,
  Plus,
  CreditCard,
  ShieldCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Trash2,
  Check,
  PenLine,
  SlidersHorizontal,
  MapPin,
  Languages,
  Stethoscope,
  Activity,
  FileText,
  FlaskConical,
  HeartPulse,
  Sparkles,
  Layers,
  Printer,
  X,
  Clock,
  ShieldAlert,
  FolderKanban,
  CheckCircle2,
  Menu,
  ArrowLeft,
  ArrowRight,
  UserPlus,
  Receipt,
  BellRing,
  Phone,
  AlertCircle,
  RefreshCw,
  Send,
  UserCheck,
  Lock,
  Edit3,
} from 'lucide-react';

export type WorkbenchTab =
  | 'Timeline'
  | 'Visits'
  | 'Tasks'
  | 'Meds'
  | 'DoseSpot'
  | 'Labs'
  | 'Devices'
  | 'Documents'
  | 'Care Plans'
  | 'Billing'
  | 'Messages';

export type WorkbenchNav =
  | 'patients'
  | 'schedule'
  | 'messages'
  | 'tasks'
  | 'spaces'
  | 'admit'
  | 'billing'
  | 'claims'
  | 'queue';

interface UnifiedClinicalWorkbenchProps {
  currentBranch: BranchLocation;
  currentUser: StaffUser;
  staffList?: StaffUser[];
  onSwitchBranch?: (branch: BranchLocation) => void;
  onSwitchUser?: (user: StaffUser) => void;
  initialPatientId?: string;
  initialTab?: WorkbenchTab;
  initialNav?: WorkbenchNav;
}

export function UnifiedClinicalWorkbench({
  currentBranch: propBranch,
  currentUser: propUser,
  staffList = INITIAL_STAFF_USERS,
  onSwitchBranch,
  onSwitchUser,
  initialPatientId = 'pat-105',
  initialTab = 'Tasks',
  initialNav = 'patients',
}: UnifiedClinicalWorkbenchProps) {
  // Navigation & Shell State
  const [activeNav, setActiveNav] = useState<WorkbenchNav>(initialNav);
  const [navCollapsed, setNavCollapsed] = useState<boolean>(false);
  const [patientSummaryCollapsed, setPatientSummaryCollapsed] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [userProfileDropdownOpen, setUserProfileDropdownOpen] = useState<boolean>(false);

  // Active Branch & Practitioner
  const [activeBranch, setActiveBranch] = useState<BranchLocation>(propBranch);
  const [activeUser, setActiveUser] = useState<StaffUser>(propUser);

  // Mobile Responsive Drawer & Bottom Sheet States
  const [mobileNavDrawerOpen, setMobileNavDrawerOpen] = useState<boolean>(false);
  const [mobilePatientProfileOpen, setMobilePatientProfileOpen] = useState<boolean>(false);
  const [mobileDetailViewOpen, setMobileDetailViewOpen] = useState<boolean>(false);

  // Patients Data & Selection
  const [patientsList, setPatientsList] = useState<PatientProfileData[]>(WORKBENCH_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId);
  const currentPatient =
    patientsList.find((p) => p.id === selectedPatientId) || patientsList[0];

  // Accordion Expand/Collapse States in Column 2 (Patient Chart)
  const [insuranceOpen, setInsuranceOpen] = useState<boolean>(true);
  const [allergiesOpen, setAllergiesOpen] = useState<boolean>(true);
  const [problemsOpen, setProblemsOpen] = useState<boolean>(true);

  // Column 3 Clinical Tabs & Filter States
  const [activeTab, setActiveTab] = useState<WorkbenchTab>(initialTab);
  const [taskFilter, setTaskFilter] = useState<'MY' | 'ALL'>('MY');

  // Selected Items for Column 4
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    currentPatient.tasks[0]?.id || ''
  );
  const activeTask =
    currentPatient.tasks.find((t) => t.id === selectedTaskId) || currentPatient.tasks[0];

  const [selectedEncounterId, setSelectedEncounterId] = useState<string>(
    currentPatient.encounters[0]?.id || ''
  );
  const activeEncounter =
    currentPatient.encounters.find((e) => e.id === selectedEncounterId) ||
    currentPatient.encounters[0];

  const [selectedMedId, setSelectedMedId] = useState<string>(
    currentPatient.medications[0]?.id || ''
  );
  const activeMed =
    currentPatient.medications.find((m) => m.id === selectedMedId) ||
    currentPatient.medications[0];

  const [selectedLabId, setSelectedLabId] = useState<string>(
    currentPatient.labs[0]?.id || ''
  );
  const activeLab =
    currentPatient.labs.find((l) => l.id === selectedLabId) || currentPatient.labs[0];

  // Queue Data State
  const [branchQueues, setBranchQueues] = useState<Record<string, QueuePatientItem[]>>(
    INITIAL_BRANCH_QUEUES
  );
  const activeQueueList = branchQueues[activeBranch.id] || branchQueues['branch-espinosa'] || [];
  const [selectedQueuePatientId, setSelectedQueuePatientId] = useState<string>(
    activeQueueList[0]?.id || ''
  );
  const [queueStageFilter, setQueueStageFilter] = useState<string>('ALL');
  const activeQueuePatient =
    activeQueueList.find((q) => q.id === selectedQueuePatientId) || activeQueueList[0];

  // Schedule Appointments State
  const [appointments, setAppointments] = useState<ClinicAppointment[]>(INITIAL_APPOINTMENTS);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(
    INITIAL_APPOINTMENTS[0]?.id || ''
  );
  const [scheduleDoctorFilter, setScheduleDoctorFilter] = useState<string>('ALL');
  const activeAppointment =
    appointments.find((a) => a.id === selectedAppointmentId) || appointments[0];

  // Notes Composer State in Column 4 (Tasks)
  const [newNoteText, setNewNoteText] = useState<string>('');

  // Modals for Adding Allergy & Problem
  const [showAddAllergyModal, setShowAddAllergyModal] = useState<boolean>(false);
  const [newAllergen, setNewAllergen] = useState<string>('');
  const [newAllergyReaction, setNewAllergyReaction] = useState<string>('');

  const [showAddProblemModal, setShowAddProblemModal] = useState<boolean>(false);
  const [newConditionName, setNewConditionName] = useState<string>('');
  const [newIcd10Code, setNewIcd10Code] = useState<string>('');

  // Modals for Printing
  const [showBillingModal, setShowBillingModal] = useState<boolean>(false);
  const [showRxModal, setShowRxModal] = useState<boolean>(false);

  // Billing Interactive State
  const [billingPatientType, setBillingPatientType] = useState<'SENIOR' | 'PWD' | 'NONE'>(
    currentPatient.insurance.statutoryType === 'SENIOR'
      ? 'SENIOR'
      : currentPatient.insurance.statutoryType === 'PWD'
      ? 'PWD'
      : 'NONE'
  );
  const [tenderAmount, setTenderAmount] = useState<number>(2000);
  const [paymentDone, setPaymentDone] = useState<boolean>(false);

  // Admission Form State
  const [admitForm, setAdmitForm] = useState({
    name: '',
    dob: '1995-05-12',
    gender: 'Female',
    civilStatus: 'Single',
    phone: '+63 917 555 0192',
    address: 'Brgy. San Jose, Antipolo City, Rizal',
    philhealth: '12-987654321-0',
    statutoryId: '',
    statutoryType: 'REGULAR',
    chiefComplaint: 'Mild lower abdominal discomfort and scheduled prenatal routine checkup',
    assignedDoctor: activeUser.name,
    priority: 'Standard',
  });
  const [admissionSuccess, setAdmissionSuccess] = useState<boolean>(false);

  // New Prescription Form State (Meds Tab)
  const [newRxGeneric, setNewRxGeneric] = useState<string>('Amoxicillin Clavulanate');
  const [newRxDose, setNewRxDose] = useState<string>('625mg tablet');
  const [newRxSig, setNewRxSig] = useState<string>('Take 1 tablet every 12 hours after meals for 7 days');
  const [rxSuccessMessage, setRxSuccessMessage] = useState<string>('');

  // New Lab Order Form State (Labs Tab)
  const [newLabTestName, setNewLabTestName] = useState<string>('Complete Blood Count (CBC) with Platelet');
  const [newLabLoinc, setNewLabLoinc] = useState<string>('58410-2');
  const [labSuccessMessage, setLabSuccessMessage] = useState<string>('');

  // Visits SOAP Form State
  const [soapSubjective, setSoapSubjective] = useState<string>(activeEncounter?.subjective || '');
  const [soapObjective, setSoapObjective] = useState<string>(activeEncounter?.objective || '');
  const [soapAssessment, setSoapAssessment] = useState<string>(activeEncounter?.assessment || '');
  const [soapPlan, setSoapPlan] = useState<string>(activeEncounter?.plan || '');
  const [soapSigned, setSoapSigned] = useState<boolean>(false);

  // Handler to Post a Note in Column 4 (Tasks)
  const handleAddNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNoteText.trim() || !activeTask) return;

    const newNote: ClinicalTaskNote = {
      id: `n-${Date.now()}`,
      authorInitials: activeUser.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
      authorName: activeUser.name,
      authorRole: activeUser.role === 'MAIN_DOCTOR' ? 'Attending Physician' : 'Clinical Staff',
      timestamp: 'Just now',
      content: newNoteText.trim(),
    };

    setPatientsList((prev) =>
      prev.map((pat) => {
        if (pat.id !== currentPatient.id) return pat;
        return {
          ...pat,
          tasks: pat.tasks.map((tsk) => {
            if (tsk.id !== activeTask.id) return tsk;
            return {
              ...tsk,
              notes: [...tsk.notes, newNote],
            };
          }),
        };
      })
    );

    setNewNoteText('');
  };

  // Handler to Toggle Task Status
  const handleToggleTaskStatus = (taskId: string) => {
    setPatientsList((prev) =>
      prev.map((pat) => {
        if (pat.id !== currentPatient.id) return pat;
        return {
          ...pat,
          tasks: pat.tasks.map((tsk) => {
            if (tsk.id !== taskId) return tsk;
            const nextStatus = tsk.status === 'Completed' ? 'In Progress' : 'Completed';
            return { ...tsk, status: nextStatus };
          }),
        };
      })
    );
  };

  // Handler to Add Allergy
  const handleSaveAllergy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergen.trim()) return;

    const newAlg: PatientAllergy = {
      id: `alg-${Date.now()}`,
      substance: newAllergen.trim(),
      reaction: newAllergyReaction.trim() || 'Clinical sensitivity',
      category: 'MEDICATION',
      status: 'ACTIVE',
    };

    setPatientsList((prev) =>
      prev.map((pat) => {
        if (pat.id !== currentPatient.id) return pat;
        return { ...pat, allergies: [newAlg, ...pat.allergies] };
      })
    );

    setNewAllergen('');
    setNewAllergyReaction('');
    setShowAddAllergyModal(false);
  };

  // Handler to Add Chronic Problem
  const handleSaveProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConditionName.trim()) return;

    const newProb: PatientProblem = {
      id: `prob-${Date.now()}`,
      condition: newConditionName.trim(),
      icd10: newIcd10Code.trim() || 'R69',
      status: 'ACTIVE',
      onsetDate: new Date().toISOString().split('T')[0],
    };

    setPatientsList((prev) =>
      prev.map((pat) => {
        if (pat.id !== currentPatient.id) return pat;
        return { ...pat, problems: [newProb, ...pat.problems] };
      })
    );

    setNewConditionName('');
    setNewIcd10Code('');
    setShowAddProblemModal(false);
  };

  // Handler for New Prescription Submission
  const handleAddPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRxGeneric.trim()) return;

    const newMed: PatientMedication = {
      id: `med-${Date.now()}`,
      genericName: newRxGeneric.trim(),
      dosage: newRxDose.trim(),
      instructions: newRxSig.trim(),
      status: 'ACTIVE',
      prescribedBy: activeUser.name,
      datePrescribed: new Date().toISOString().split('T')[0],
    };

    setPatientsList((prev) =>
      prev.map((pat) => {
        if (pat.id !== currentPatient.id) return pat;
        return { ...pat, medications: [newMed, ...pat.medications] };
      })
    );

    setRxSuccessMessage(`e-Prescription issued for ${newRxGeneric} (RA 6675 compliant)`);
    setTimeout(() => setRxSuccessMessage(''), 4000);
  };

  // Handler for New Lab Requisition Submission
  const handleAddLabOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabTestName.trim()) return;

    const newOrder: PatientLabOrder = {
      id: `lab-${Date.now()}`,
      testName: newLabTestName.trim(),
      loincCode: newLabLoinc.trim() || '58410-2',
      orderedDate: new Date().toISOString().split('T')[0],
      status: 'ORDERED',
      resultsSummary: 'Diagnostic order transmitted to clinical laboratory. Specimen collection pending.',
    };

    setPatientsList((prev) =>
      prev.map((pat) => {
        if (pat.id !== currentPatient.id) return pat;
        return { ...pat, labs: [newOrder, ...pat.labs] };
      })
    );

    setLabSuccessMessage(`Diagnostic order sent for ${newLabTestName}`);
    setTimeout(() => setLabSuccessMessage(''), 4000);
  };

  // Handler to Advance Queue Patient
  const handleAdvanceQueueStage = (patientId: string) => {
    setBranchQueues((prev) => {
      const currentList = prev[activeBranch.id] || [];
      const updated = currentList.map((item) => {
        if (item.id !== patientId) return item;
        const nextStage: QueueStage =
          item.stage === 'CHECKIN'
            ? 'TRIAGE'
            : item.stage === 'TRIAGE'
            ? 'CONSULT'
            : item.stage === 'CONSULT'
            ? 'BILLING'
            : 'DISCHARGED';
        return { ...item, stage: nextStage };
      });
      return { ...prev, [activeBranch.id]: updated };
    });
  };

  // Handler to Check-In Appointment to Facility Queue
  const handleCheckInAppointment = (apt: ClinicAppointment) => {
    const newQueueItem: QueuePatientItem = {
      id: apt.patientId,
      name: apt.patientName,
      age: apt.patientAge,
      gender: apt.patientGender,
      dob: apt.patientDob,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      waitMinutes: '0m',
      stage: 'TRIAGE',
      stageLabel: 'Nurse Triage Vitals',
      doctor: apt.doctorName,
      priority: apt.seniorId ? 'Senior Priority' : apt.pwdId ? 'PWD Priority' : 'Standard',
      senior: !!apt.seniorId,
      pwd: !!apt.pwdId,
      targetTab: 'vitals',
      chiefComplaint: apt.chiefComplaint,
      branchId: activeBranch.id,
    };

    setBranchQueues((prev) => ({
      ...prev,
      [activeBranch.id]: [newQueueItem, ...(prev[activeBranch.id] || [])],
    }));

    setAppointments((prev) =>
      prev.map((a) => (a.id === apt.id ? { ...a, status: 'CHECKED_IN' } : a))
    );

    setActiveNav('queue');
    setSelectedQueuePatientId(apt.patientId);
  };

  // Handler for New Patient Admission Submit
  const handleAdmitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitForm.name.trim()) return;

    const newPatId = `pat-${Date.now()}`;
    const newPatProfile: PatientProfileData = {
      id: newPatId,
      name: admitForm.name,
      dob: admitForm.dob,
      age: `${new Date().getFullYear() - parseInt(admitForm.dob.split('-')[0])}Y`,
      gender: admitForm.gender as 'Female' | 'Male' | 'Other',
      race: 'Filipino / Asian',
      address: admitForm.address,
      city: 'Metro Manila',
      province: 'NCR',
      language: 'Tagalog, English',
      primaryClinician: admitForm.assignedDoctor,
      insurance: {
        provider: 'PhilHealth Konsulta',
        policyId: admitForm.philhealth || '12-000000000-0',
        status: 'ACTIVE',
        validUntil: '12/31/2026',
        konsultaAccredited: true,
        statutoryType: admitForm.statutoryType as 'SENIOR' | 'PWD' | 'REGULAR',
        statutoryId: admitForm.statutoryId,
      },
      allergies: [],
      problems: [
        {
          id: `p-${Date.now()}`,
          condition: admitForm.chiefComplaint,
          icd10: 'R69',
          status: 'ACTIVE',
          onsetDate: new Date().toISOString().split('T')[0],
        },
      ],
      tasks: [
        {
          id: `t-${Date.now()}`,
          title: 'Initial triage & vital signs assessment',
          dueDate: 'Today',
          assignedTo: 'Nurse Joy Reyes, RN',
          status: 'In Progress',
          category: 'TRIAGE',
          description: `Patient admitted with chief complaint: ${admitForm.chiefComplaint}`,
          notes: [],
        },
      ],
      medications: [],
      labs: [],
      encounters: [],
    };

    setPatientsList((prev) => [newPatProfile, ...prev]);

    // Also push into facility queue directly
    const newQueueItem: QueuePatientItem = {
      id: newPatId,
      name: admitForm.name,
      age: parseInt(newPatProfile.age),
      gender: admitForm.gender === 'Female' ? 'F' : 'M',
      dob: admitForm.dob,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      waitMinutes: '1m',
      stage: 'TRIAGE',
      stageLabel: 'Nurse Triage Vitals',
      doctor: admitForm.assignedDoctor,
      priority:
        admitForm.statutoryType === 'SENIOR'
          ? 'Senior Priority'
          : admitForm.statutoryType === 'PWD'
          ? 'PWD Priority'
          : 'Standard',
      senior: admitForm.statutoryType === 'SENIOR',
      pwd: admitForm.statutoryType === 'PWD',
      targetTab: 'vitals',
      chiefComplaint: admitForm.chiefComplaint,
      branchId: activeBranch.id,
    };

    setBranchQueues((prev) => ({
      ...prev,
      [activeBranch.id]: [newQueueItem, ...(prev[activeBranch.id] || [])],
    }));

    setAdmissionSuccess(true);
    setTimeout(() => {
      setAdmissionSuccess(false);
      setSelectedPatientId(newPatId);
      setActiveNav('patients');
    }, 1500);
  };

  // Billing Calculations
  const sampleBillingItems: BillingLineItem[] = [
    {
      id: '1',
      description: 'Obstetrics & Gynecology Specialist Consultation',
      category: 'Consultation',
      qty: 1,
      unitPrice: 1000,
      amount: 1000,
    },
    {
      id: '2',
      description: 'Pelvic & Transvaginal Diagnostic Ultrasound',
      category: 'Diagnostic / Lab',
      qty: 1,
      unitPrice: 1200,
      amount: 1200,
    },
    {
      id: '3',
      description: 'Prescribed Oral Antibiotics & Prenatal Vitamins Course',
      category: 'Pharmacy',
      qty: 1,
      unitPrice: 850,
      amount: 850,
    },
  ];
  const grossBilling = sampleBillingItems.reduce((acc, item) => acc + item.amount, 0);
  const discountCalc = calculatePhilippineDiscount(grossBilling, billingPatientType, true);
  const philHealthCredit = currentPatient.insurance.konsultaAccredited ? 500 : 0;
  const netBillingPayable = Math.max(0, discountCalc.netPayablePhp - philHealthCredit);

  // Switch Practitioner Persona
  const handleSelectUser = (user: StaffUser) => {
    setActiveUser(user);
    onSwitchUser?.(user);
    setUserProfileDropdownOpen(false);

    if (!canUserAccessBranch(user, activeBranch.id)) {
      const allowed = CLINIC_BRANCHES.filter((b) => canUserAccessBranch(user, b.id));
      if (allowed.length > 0) {
        setActiveBranch(allowed[0]);
        onSwitchBranch?.(allowed[0]);
      }
    }
  };

  // Switch Active Clinic Branch
  const handleSelectBranch = (branch: BranchLocation) => {
    if (canUserAccessBranch(activeUser, branch.id)) {
      setActiveBranch(branch);
      onSwitchBranch?.(branch);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-white font-sans text-slate-900 antialiased selection:bg-blue-100">
      {/* ========================================================================= */}
      {/* MOBILE STICKY TOP APP BAR (< md)                                          */}
      {/* ========================================================================= */}
      <header className="md:hidden flex h-14 items-center justify-between px-3 border-b border-slate-200 bg-white shrink-0 z-30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileNavDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition min-h-[44px] min-w-[44px]"
            title="Open Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-xs shadow-xs">
              +
            </div>
            <div>
              <span className="block font-bold text-xs text-slate-900 leading-none">Metro Health</span>
              <span className="block text-[9px] text-slate-400 font-medium">Clinical EHR</span>
            </div>
          </div>
        </div>

        {/* Patient Switcher Chip on Mobile */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobilePatientProfileOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 py-1.5 px-3 text-xs font-semibold text-slate-800 hover:bg-slate-100 transition min-h-[44px]"
            title="View Patient Demographics & Profile"
          >
            <img
              src={
                currentPatient.avatarUrl ||
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80'
              }
              alt={currentPatient.name}
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className="max-w-[85px] truncate">{currentPatient.name.split(' ')[0]}</span>
            <span className="text-[10px] text-slate-500 font-mono">({currentPatient.age})</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition min-h-[44px] min-w-[44px]"
            title="Search Records (⌘K)"
            aria-label="Search Records"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MOBILE OFF-CANVAS NAV DRAWER (< md)                                       */}
      {/* ========================================================================= */}
      {mobileNavDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileNavDrawerOpen(false)}
          />
          <div className="relative flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex h-14 items-center justify-between px-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white font-bold text-sm">
                  +
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900 leading-tight">Metro Health PH</span>
                  <span className="block text-[10px] text-slate-400">Clinical EHR System</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavDrawerOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 min-h-[44px] min-w-[44px]"
                aria-label="Close Navigation Menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs">
                  {activeUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{activeUser.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{activeBranch.name}</div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {[
                { id: 'patients', label: 'Patients', icon: Users },
                { id: 'schedule', label: 'Schedule', icon: Calendar },
                { id: 'queue', label: 'Facility Queue', icon: FolderKanban },
                { id: 'billing', label: 'Billing & Ledger', icon: CreditCard },
                { id: 'claims', label: 'PhilHealth Claims', icon: ShieldCheck },
                { id: 'spaces', label: 'Spaces / Branches', icon: Layers },
                { id: 'admit', label: '+ New Patient Admission', icon: Plus },
                { id: 'tasks', label: 'Clinical Tasks', icon: ClipboardCheck },
                { id: 'messages', label: 'Team Messages', icon: Mail },
              ].map((item) => {
                const Icon = item.icon;
                const isItemActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveNav(item.id as WorkbenchNav);
                      setMobileNavDrawerOpen(false);
                      setMobileDetailViewOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-semibold transition min-h-[44px] ${
                      isItemActive
                        ? 'bg-sky-50 text-sky-700 border border-sky-100'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE PATIENT PROFILE BOTTOM SHEET (< md & Tablet)                       */}
      {/* ========================================================================= */}
      {mobilePatientProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-end xl:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobilePatientProfileOpen(false)}
          />
          <div className="relative flex w-full max-h-[85vh] flex-col rounded-t-2xl bg-white shadow-2xl z-10 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={
                    currentPatient.avatarUrl ||
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80'
                  }
                  alt={currentPatient.name}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-2xs"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{currentPatient.name}</h3>
                  <div className="text-xs text-slate-500 font-mono">
                    {currentPatient.dob} ({currentPatient.age}y &bull; {currentPatient.gender})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobilePatientProfileOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 min-h-[44px] min-w-[44px]"
                aria-label="Close Patient Profile"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Switch Active Patient Record
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    const nextPat = patientsList.find((p) => p.id === e.target.value);
                    if (nextPat?.tasks[0]) setSelectedTaskId(nextPat.tasks[0].id);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white p-2.5 text-base sm:text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 min-h-[44px]"
                >
                  {patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.age} • {p.gender})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>DOB: {currentPatient.dob} ({currentPatient.age} years old)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Gender: {currentPatient.gender} &bull; Ethnicity: {currentPatient.race}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{currentPatient.address}, {currentPatient.city}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Languages className="h-4 w-4 text-slate-400 shrink-0" />
                  <span>Preferred Language: {currentPatient.language}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Stethoscope className="h-4 w-4 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-900">Attending: {currentPatient.primaryClinician}</span>
                </div>
              </div>

              {/* Insurance */}
              <div className="rounded-lg border border-slate-200 p-3 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Insurance & PhilHealth</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                    ACTIVE
                  </span>
                </div>
                <div className="font-semibold text-slate-800">{currentPatient.insurance.provider}</div>
                <div className="text-[11px] font-mono text-slate-500">
                  PIN: {currentPatient.insurance.policyId}
                </div>
                {currentPatient.insurance.statutoryId && (
                  <div className="pt-1">
                    <span className="inline-block rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold font-mono text-amber-800 border border-amber-200">
                      OSCA ID: {currentPatient.insurance.statutoryId} (RA 9994)
                    </span>
                  </div>
                )}
              </div>

              {/* Allergies */}
              <div className="rounded-lg border border-slate-200 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Documented Allergies</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMobilePatientProfileOpen(false);
                      setShowAddAllergyModal(true);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 min-h-[36px]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </div>
                {currentPatient.allergies.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No allergies documented</p>
                ) : (
                  currentPatient.allergies.map((alg) => (
                    <div key={alg.id} className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                      <span className="font-medium text-slate-800">{alg.substance}</span>
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-700 border border-rose-200">
                        {alg.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Problems */}
              <div className="rounded-lg border border-slate-200 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Clinical Problems (ICD-10)</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMobilePatientProfileOpen(false);
                      setShowAddProblemModal(true);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 min-h-[36px]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </div>
                {currentPatient.problems.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No active problems</p>
                ) : (
                  currentPatient.problems.map((prob) => (
                    <div key={prob.id} className="flex items-center justify-between border-t border-slate-100 pt-1.5">
                      <div>
                        <div className="font-medium text-slate-800">{prob.condition}</div>
                        <div className="text-[10px] font-mono text-slate-400">ICD-10: {prob.icd10}</div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                        {prob.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={() => setMobilePatientProfileOpen(false)}
                className="w-full rounded-lg bg-slate-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-slate-800 min-h-[44px]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COLUMN 1: LEFT NAVIGATION RAIL (Desktop & Tablet)                         */}
      {/* ========================================================================= */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out ${
          navCollapsed ? 'w-16' : 'w-16 xl:w-52'
        } shrink-0 select-none z-20`}
      >
        {/* Top Logo / App Title */}
        <div className="flex h-14 items-center gap-2.5 px-4 border-b border-slate-100">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
            <span className="text-base font-black leading-none">+</span>
          </div>
          {!navCollapsed && (
            <div className="hidden xl:block min-w-0">
              <span className="block text-xs font-bold tracking-tight text-slate-900 leading-none">
                Metro Health <span className="text-purple-600">PH</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium leading-tight">
                Clinical EHR
              </span>
            </div>
          )}
        </div>

        {/* Primary Navigation Item List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {/* Quick Search Item */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            title="Search (⌘K)"
          >
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && (
              <span className="hidden xl:flex flex-1 text-left items-center justify-between">
                <span>Search</span>
                <kbd className="rounded border border-slate-200 bg-slate-50 px-1 py-0.2 text-[9px] font-mono text-slate-400">
                  ⌘K
                </kbd>
              </span>
            )}
          </button>

          {/* Spaces */}
          <button
            type="button"
            onClick={() => {
              setActiveNav('spaces');
              setMobileDetailViewOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
              activeNav === 'spaces'
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Spaces / Clinics"
          >
            <Layers className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span className="hidden xl:inline">Spaces</span>}
          </button>

          {/* Patients (Active in reference image) */}
          <button
            type="button"
            onClick={() => {
              setActiveNav('patients');
              setMobileDetailViewOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
              activeNav === 'patients'
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Patients"
          >
            <Users className="h-4 w-4 shrink-0 text-sky-600" />
            {!navCollapsed && <span className="hidden xl:inline">Patients</span>}
          </button>

          {/* Schedule */}
          <button
            type="button"
            onClick={() => {
              setActiveNav('schedule');
              setMobileDetailViewOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
              activeNav === 'schedule'
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Schedule"
          >
            <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span className="hidden xl:inline">Schedule</span>}
          </button>

          {/* Messages */}
          <button
            type="button"
            onClick={() => {
              setActiveNav('messages');
              setActiveTab('Messages');
              setMobileDetailViewOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
              activeNav === 'messages'
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Messages"
          >
            <Mail className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span className="hidden xl:inline">Messages</span>}
          </button>

          {/* Tasks */}
          <button
            type="button"
            onClick={() => {
              setActiveNav('tasks');
              setActiveTab('Tasks');
              setMobileDetailViewOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
              activeNav === 'tasks'
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Tasks"
          >
            <ClipboardCheck className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span className="hidden xl:inline">Tasks</span>}
          </button>

          {/* Divider: Quick Links */}
          <div className="pt-3 pb-1">
            {!navCollapsed && (
              <span className="hidden xl:block px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Links
              </span>
            )}
          </div>

          {/* + New Patient Admission */}
          <button
            type="button"
            onClick={() => {
              setActiveNav('admit');
              setMobileDetailViewOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
              activeNav === 'admit'
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="New Patient Admission"
          >
            <Plus className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span className="hidden xl:inline">New Patient</span>}
          </button>

          {/* Cashier & Billing */}
          <button
            type="button"
            onClick={() => {
              setActiveNav('billing');
              setActiveTab('Billing');
              setMobileDetailViewOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
              activeNav === 'billing'
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Billing & Ledger"
          >
            <CreditCard className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span className="hidden xl:inline">Billing & Ledger</span>}
          </button>

          {/* PhilHealth eClaims */}
          <button
            type="button"
            onClick={() => {
              setActiveNav('claims');
              setMobileDetailViewOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
              activeNav === 'claims'
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="PhilHealth Claims"
          >
            <ShieldCheck className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span className="hidden xl:inline">PhilHealth Claims</span>}
          </button>

          {/* Facility Queue */}
          <button
            type="button"
            onClick={() => {
              setActiveNav('queue');
              setMobileDetailViewOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition ${
              activeNav === 'queue'
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
            title="Facility Queue"
          >
            <FolderKanban className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span className="hidden xl:inline">Facility Queue</span>}
          </button>
        </div>

        {/* Bottom Doctor Profile & Popover Switcher */}
        <div className="relative border-t border-slate-200 p-2.5 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setUserProfileDropdownOpen(!userProfileDropdownOpen)}
              className="flex items-center gap-2 text-left hover:opacity-80 transition min-w-0"
              title="Click to Switch Doctor Persona or Branch"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                {activeUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              {!navCollapsed && (
                <div className="hidden xl:block min-w-0 truncate">
                  <span className="block text-xs font-semibold text-slate-800 truncate">
                    {activeUser.name}
                  </span>
                  <span className="block text-[10px] text-slate-400 truncate">
                    {activeBranch.code} &bull; {activeUser.role === 'MAIN_DOCTOR' ? 'Director' : 'Staff'}
                  </span>
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => setNavCollapsed(!navCollapsed)}
              className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              title={navCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              {navCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Interactive Persona & Branch Switcher Dropdown */}
          {userProfileDropdownOpen && (
            <div className="absolute bottom-14 left-2 z-50 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Switch Active Persona
                </span>
                <div className="space-y-1">
                  {staffList.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                        activeUser.id === user.id
                          ? 'bg-purple-50 font-bold text-purple-800'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-left">
                        <div className="truncate font-semibold">{user.name}</div>
                        <div className="text-[10px] text-slate-400">{user.role}</div>
                      </div>
                      {activeUser.id === user.id && <Check className="h-3.5 w-3.5 text-purple-700" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Switch Facility Branch
                </span>
                <div className="space-y-1">
                  {CLINIC_BRANCHES.map((b) => {
                    const permitted = canUserAccessBranch(activeUser, b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        disabled={!permitted}
                        onClick={() => handleSelectBranch(b)}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                          activeBranch.id === b.id
                            ? 'bg-blue-50 font-bold text-blue-800'
                            : permitted
                            ? 'text-slate-700 hover:bg-slate-50'
                            : 'opacity-40 cursor-not-allowed text-slate-400'
                        }`}
                      >
                        <div className="text-left truncate">
                          <div className="truncate">{b.name}</div>
                          <div className="text-[10px] text-slate-400">{b.code}</div>
                        </div>
                        {activeBranch.id === b.id && <Check className="h-3.5 w-3.5 text-blue-700" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* COLUMN 2: CONTEXT PROFILE PANEL (Patient / Module Context)                */}
      {/* ========================================================================= */}
      {!patientSummaryCollapsed && (
        <aside className="hidden xl:flex w-64 shrink-0 border-r border-slate-200 bg-white flex-col overflow-y-auto select-none z-10">
          {/* Patient Context Header (Patients, Tasks, Messages, Billing) */}
          {(activeNav === 'patients' || activeNav === 'tasks' || activeNav === 'messages' || activeNav === 'billing') ? (
            <>
              {/* Patient Card Header */}
              <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                <img
                  src={
                    currentPatient.avatarUrl ||
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80'
                  }
                  alt={currentPatient.name}
                  className="h-11 w-11 rounded-full object-cover border border-slate-200 shadow-2xs"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 truncate leading-tight">
                      {currentPatient.name}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPatientSummaryCollapsed(true)}
                      className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      title="Collapse patient summary"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentPatient.dob}
                  </span>
                </div>
              </div>

              {/* Quick Patient Switcher Selector */}
              <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50/60">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Active Patient Record
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    const nextPat = patientsList.find((p) => p.id === e.target.value);
                    if (nextPat?.tasks[0]) setSelectedTaskId(nextPat.tasks[0].id);
                  }}
                  className="w-full rounded border border-slate-200 bg-white py-1 px-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                >
                  {patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.age} • {p.gender})
                    </option>
                  ))}
                </select>
              </div>

              {/* Demographics Icon List (Exact match to reference screenshot) */}
              <div className="p-3.5 space-y-2 border-b border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>
                    {currentPatient.dob} ({currentPatient.age})
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{currentPatient.gender}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Sparkles className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{currentPatient.race}</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">
                    {currentPatient.address}, {currentPatient.city}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Languages className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{currentPatient.language}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Stethoscope className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium text-slate-900">{currentPatient.primaryClinician}</span>
                </div>
              </div>

              {/* Accordion 1: Insurance & PhilHealth */}
              <div className="border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setInsuranceOpen(!insuranceOpen)}
                  className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-bold text-slate-900 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-1.5">
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                        insuranceOpen ? '' : '-rotate-90'
                      }`}
                    />
                    <span>Insurance</span>
                  </div>
                </button>
                {insuranceOpen && (
                  <div className="px-3.5 pb-3 text-xs space-y-1.5">
                    <div className="font-semibold text-slate-800">
                      {currentPatient.insurance.provider}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      ID: {currentPatient.insurance.policyId}
                      {currentPatient.insurance.groupNumber && (
                        <> &bull; Group: {currentPatient.insurance.groupNumber}</>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                        ACTIVE
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Ends {currentPatient.insurance.validUntil}
                      </span>
                    </div>
                    {currentPatient.insurance.statutoryId && (
                      <div className="pt-1">
                        <span className="inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold font-mono text-amber-800 border border-amber-200">
                          OSCA ID: {currentPatient.insurance.statutoryId} (RA 9994)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 2: Allergies */}
              <div className="border-b border-slate-100">
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <button
                    type="button"
                    onClick={() => setAllergiesOpen(!allergiesOpen)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-blue-600"
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                        allergiesOpen ? '' : '-rotate-90'
                      }`}
                    />
                    <span>Allergies</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAllergyModal(true)}
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                    title="Add Allergy"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                {allergiesOpen && (
                  <div className="px-3.5 pb-3 space-y-2 text-xs">
                    {currentPatient.allergies.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No allergies documented</span>
                    ) : (
                      currentPatient.allergies.map((alg) => (
                        <div key={alg.id} className="space-y-0.5">
                          <div className="font-semibold text-slate-800">{alg.substance}</div>
                          <span
                            className={`inline-block rounded-full px-2 py-0.2 text-[9px] font-bold border ${
                              alg.status === 'ACTIVE'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {alg.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Accordion 3: Problems */}
              <div className="border-b border-slate-100">
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <button
                    type="button"
                    onClick={() => setProblemsOpen(!problemsOpen)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-blue-600"
                  >
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                        problemsOpen ? '' : '-rotate-90'
                      }`}
                    />
                    <span>Problems</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProblemModal(true)}
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                    title="Add Problem"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                {problemsOpen && (
                  <div className="px-3.5 pb-3 space-y-2 text-xs">
                    {currentPatient.problems.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No active problems</span>
                    ) : (
                      currentPatient.problems.map((prob) => (
                        <div key={prob.id} className="space-y-0.5">
                          <div className="font-semibold text-slate-800">{prob.condition}</div>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded-full bg-emerald-50 px-2 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                              {prob.status}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              ICD-10: {prob.icd10}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          ) : activeNav === 'queue' ? (
            /* Queue Metrics Context Panel */
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Facility Queue Stats
                </h3>
                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Dispatch
                </span>
              </div>
              <div className="text-xs text-slate-600 font-semibold">{activeBranch.name}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-slate-200 p-2.5 bg-slate-50 text-center">
                  <span className="text-[10px] text-slate-400 block font-bold">TOTAL QUEUED</span>
                  <span className="text-xl font-black text-slate-900">{activeQueueList.length}</span>
                </div>
                <div className="rounded-lg border border-slate-200 p-2.5 bg-slate-50 text-center">
                  <span className="text-[10px] text-slate-400 block font-bold">AVG WAIT</span>
                  <span className="text-xl font-black text-slate-900">14m</span>
                </div>
              </div>
              <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-xs space-y-1 text-amber-900">
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                  Philippine Priority Lane
                </span>
                <p className="text-[11px] leading-tight text-amber-800">
                  Mandatory priority express triage for Senior Citizens (RA 9994) & PWDs (RA 7277).
                </p>
              </div>
            </div>
          ) : activeNav === 'schedule' ? (
            /* Schedule Mini-Calendar Context Panel */
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Appointments Book
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Oct 2026</span>
              </div>
              <div className="rounded-lg border border-slate-200 p-2.5 bg-slate-50 text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active Demo Date
                </span>
                <div className="text-sm font-black text-slate-900">Monday, Oct 05, 2026</div>
                <div className="text-[11px] text-slate-500">12 Patients Scheduled</div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Filter by Attending Doctor
                </label>
                <select
                  value={scheduleDoctorFilter}
                  onChange={(e) => setScheduleDoctorFilter(e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Attending Doctors</option>
                  <option value="Dr. Florence Espinosa, MD">Dr. Florence Espinosa, MD</option>
                  <option value="Dr. Juan Carlos Ramos, MD">Dr. Juan Carlos Ramos, MD</option>
                </select>
              </div>
            </div>
          ) : activeNav === 'spaces' ? (
            /* Spaces / Branches Context Panel */
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Clinic Network
                </h3>
              </div>
              <div className="space-y-2">
                {CLINIC_BRANCHES.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => handleSelectBranch(b)}
                    className={`p-3 rounded-lg border cursor-pointer transition ${
                      activeBranch.id === b.id
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">{b.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{b.address.city}</div>
                    <div className="mt-1 text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded inline-block">
                      Konsulta Accredited
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeNav === 'admit' ? (
            /* Admission Checklist Context Panel */
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Admission Intake
                </h3>
              </div>
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                    1
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Personal Demographics</span>
                    <span className="text-[11px] text-slate-500">Civil status, address, contacts</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">PhilHealth & IDs</span>
                    <span className="text-[11px] text-slate-500">12-digit PIN, Senior / PWD card</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                    3
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Triage Queue Dispatch</span>
                    <span className="text-[11px] text-slate-500">Push to Nurse Station</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PhilHealth eClaims Context Panel */
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  eClaims Center
                </h3>
              </div>
              <div className="rounded-lg border border-slate-200 p-2.5 bg-slate-50 space-y-1 text-xs">
                <span className="text-[10px] text-slate-400 block font-bold">API TRANSMISSION</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Konsulta API Connected
                </span>
                <div className="text-[10px] text-slate-500">Batch Series 2026-R3</div>
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Expand Button if Column 2 is Collapsed */}
      {patientSummaryCollapsed && (
        <div className="hidden xl:flex border-r border-slate-200 bg-white p-2 flex-col items-center">
          <button
            type="button"
            onClick={() => setPatientSummaryCollapsed(false)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            title="Expand Patient Summary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COLUMN 3: CLINICAL TAB STRIP & MODULE LIST                                */}
      {/* ========================================================================= */}
      <section
        className={`${
          mobileDetailViewOpen ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-88 shrink-0 border-r border-slate-200 bg-white flex-col select-none`}
      >
        {/* If in Patient Chart mode: Top Horizontal Clinical Tab Strip */}
        {activeNav === 'patients' && (
          <div className="flex items-center gap-1 overflow-x-auto px-3 py-2 border-b border-slate-100 text-xs scrollbar-none">
            {[
              'Timeline',
              'Visits',
              'Tasks',
              'Meds',
              'DoseSpot',
              'Labs',
              'Devices',
              'Documents',
              'Care Plans',
              'Billing',
              'Messages',
            ].map((tab) => {
              const isTabActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab as WorkbenchTab)}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-full text-xs transition ${
                    isTabActive
                      ? 'bg-slate-100 font-bold text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        )}

        {/* Sub-Filter Bar under Active Tab / Module */}
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 bg-slate-50/40">
          <div className="flex items-center gap-1.5 text-xs">
            {activeNav === 'patients' ? (
              <>
                <button
                  type="button"
                  onClick={() => setTaskFilter('MY')}
                  className={`px-2.5 py-1 rounded-full transition ${
                    taskFilter === 'MY'
                      ? 'bg-slate-100 font-bold text-slate-900'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  My {activeTab}
                </button>
                <button
                  type="button"
                  onClick={() => setTaskFilter('ALL')}
                  className={`px-2.5 py-1 rounded-full transition ${
                    taskFilter === 'ALL'
                      ? 'bg-slate-100 font-bold text-slate-900'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All {activeTab}
                </button>
              </>
            ) : activeNav === 'queue' ? (
              <span className="font-bold text-slate-900 text-xs">Queue Stage Filter</span>
            ) : activeNav === 'schedule' ? (
              <span className="font-bold text-slate-900 text-xs">Daily Roster (Oct 05)</span>
            ) : activeNav === 'spaces' ? (
              <span className="font-bold text-slate-900 text-xs">Clinical Suites</span>
            ) : activeNav === 'admit' ? (
              <span className="font-bold text-slate-900 text-xs">Recent Admissions</span>
            ) : (
              <span className="font-bold text-slate-900 text-xs">Batch Transmittals</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick Patient Switcher Chip for Tablets (hidden on mobile and >=xl) */}
            <button
              type="button"
              onClick={() => setMobilePatientProfileOpen(true)}
              className="hidden md:flex xl:hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-100 py-1 px-2.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-200 transition min-h-[36px]"
              title="View Patient Demographics & Profile"
            >
              <img
                src={
                  currentPatient.avatarUrl ||
                  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&h=160&q=80'
                }
                alt={currentPatient.name}
                className="h-4 w-4 rounded-full object-cover"
              />
              <span className="truncate max-w-[70px]">{currentPatient.name.split(' ')[0]}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
            <button
              type="button"
              className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              title="Filter"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition"
              title="New Item"
            >
              <Plus className="h-3 w-3 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Clinical Item List Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {/* Patient Mode: Tasks List */}
          {(activeNav === 'patients' && activeTab === 'Tasks') || activeNav === 'tasks' ? (
            currentPatient.tasks.map((task) => {
              const isSelected = activeTask?.id === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => {
                    setSelectedTaskId(task.id);
                    setMobileDetailViewOpen(true);
                  }}
                  className={`p-3.5 cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-50/80 border-l-2 border-l-blue-600'
                      : 'hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {task.title}
                    </h4>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.2 text-[9px] font-semibold border ${
                        task.status === 'In Progress'
                          ? 'border-sky-300 text-sky-700 bg-sky-50'
                          : task.status === 'Ready'
                          ? 'border-cyan-300 text-cyan-700 bg-cyan-50'
                          : task.status === 'Requested'
                          ? 'border-purple-300 text-purple-700 bg-purple-50'
                          : 'border-emerald-300 text-emerald-700 bg-emerald-50'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {task.dueDate}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Assigned to {task.assignedTo}
                  </div>
                </div>
              );
            })
          ) : activeNav === 'patients' && activeTab === 'Visits' ? (
            /* Patient Mode: Visits List */
            currentPatient.encounters.map((enc) => {
              const isSelected = activeEncounter?.id === enc.id;
              return (
                <div
                  key={enc.id}
                  onClick={() => {
                    setSelectedEncounterId(enc.id);
                    setMobileDetailViewOpen(true);
                  }}
                  className={`p-3.5 cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-50/80 border-l-2 border-l-blue-600'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{enc.type}</h4>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                      {enc.status}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">{enc.date} &bull; {enc.clinician}</div>
                  <div className="mt-0.5 text-xs text-slate-700 font-medium">
                    {enc.chiefComplaint}
                  </div>
                </div>
              );
            })
          ) : activeNav === 'patients' && activeTab === 'Meds' ? (
            /* Patient Mode: Meds List */
            currentPatient.medications.map((med) => {
              const isSelected = activeMed?.id === med.id;
              return (
                <div
                  key={med.id}
                  onClick={() => {
                    setSelectedMedId(med.id);
                    setMobileDetailViewOpen(true);
                  }}
                  className={`p-3.5 cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-50/80 border-l-2 border-l-blue-600'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{med.genericName}</h4>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                      {med.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">{med.dosage}</div>
                  <div className="mt-1 text-[11px] text-slate-500 italic leading-snug">
                    {med.instructions}
                  </div>
                </div>
              );
            })
          ) : activeNav === 'patients' && activeTab === 'Labs' ? (
            /* Patient Mode: Labs List */
            currentPatient.labs.map((lab) => {
              const isSelected = activeLab?.id === lab.id;
              return (
                <div
                  key={lab.id}
                  onClick={() => {
                    setSelectedLabId(lab.id);
                    setMobileDetailViewOpen(true);
                  }}
                  className={`p-3.5 cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-50/80 border-l-2 border-l-blue-600'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{lab.testName}</h4>
                    <span className="rounded-full bg-blue-50 px-2 py-0.2 text-[9px] font-bold text-blue-700 border border-blue-200">
                      {lab.status}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                    LOINC: {lab.loincCode} &bull; {lab.orderedDate}
                  </div>
                  {lab.resultsSummary && (
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                      {lab.resultsSummary}
                    </p>
                  )}
                </div>
              );
            })
          ) : (activeNav === 'patients' && activeTab === 'Billing') || activeNav === 'billing' ? (
            /* Patient Mode: Billing List */
            <div
              onClick={() => setMobileDetailViewOpen(true)}
              className="p-3.5 space-y-3 cursor-pointer"
            >
              <div className="rounded border border-slate-200 p-2.5 bg-slate-50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Pending Invoice Total
                </span>
                <span className="text-lg font-black font-mono text-slate-900">
                  {formatPhp(netBillingPayable)}
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                {sampleBillingItems.map((item) => (
                  <div key={item.id} className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-700 font-medium truncate max-w-[200px]">
                      {item.description}
                    </span>
                    <span className="font-mono text-slate-900 font-semibold">
                      {formatPhp(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : activeNav === 'queue' ? (
            /* Operational Mode: Queue List */
            activeQueueList.map((q) => {
              const isSelected = activeQueuePatient?.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQueuePatientId(q.id);
                    setMobileDetailViewOpen(true);
                  }}
                  className={`p-3.5 cursor-pointer transition ${
                    isSelected
                      ? 'bg-slate-50/80 border-l-2 border-l-blue-600'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{q.name}</h4>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold border ${
                        q.stage === 'CONSULT'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : q.stage === 'TRIAGE'
                          ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                          : q.stage === 'BILLING'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {q.stage}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {q.gender}, {q.age}y &bull; Waiting: {q.waitMinutes}
                  </div>
                  <div className="text-xs text-slate-700 mt-1 line-clamp-1">
                    {q.chiefComplaint}
                  </div>
                  {q.priority !== 'Standard' && (
                    <span className="mt-1 inline-block rounded bg-amber-50 px-1.5 py-0.2 text-[9px] font-bold text-amber-800 border border-amber-200">
                      {q.priority}
                    </span>
                  )}
                </div>
              );
            })
          ) : activeNav === 'schedule' ? (
            /* Operational Mode: Schedule Appointment Slots */
            appointments
              .filter(
                (a) =>
                  scheduleDoctorFilter === 'ALL' || a.doctorName.includes(scheduleDoctorFilter)
              )
              .map((apt) => {
                const isSelected = activeAppointment?.id === apt.id;
                return (
                  <div
                    key={apt.id}
                    onClick={() => {
                      setSelectedAppointmentId(apt.id);
                      setMobileDetailViewOpen(true);
                    }}
                    className={`p-3.5 cursor-pointer transition ${
                      isSelected
                        ? 'bg-slate-50/80 border-l-2 border-l-blue-600'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-blue-700">
                        {apt.timeSlot}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold border ${
                          apt.status === 'CHECKED_IN'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">
                      {apt.patientName}
                    </div>
                    <div className="text-[11px] text-slate-500">{apt.serviceType}</div>
                  </div>
                );
              })
          ) : activeNav === 'spaces' ? (
            /* Operational Mode: Clinic Rooms */
            [
              { room: 'Room 201', spec: 'Obstetrics & Gynecology Suite', dr: 'Dr. Florence Espinosa', status: 'In Use' },
              { room: 'Room 202', spec: 'Transvaginal & Pelvic Ultrasound', dr: 'Radiologist on Duty', status: 'Available' },
              { room: 'Room 203', spec: 'Nurse Triage & Vital Signs', dr: 'Nurse Joy Reyes', status: 'In Use' },
              { room: 'Room 204', spec: 'General Consultation & Internal Med', dr: 'Dr. Juan Carlos Ramos', status: 'Available' },
            ].map((r, i) => (
              <div key={i} className="p-3.5 hover:bg-slate-50 cursor-pointer transition">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-900">{r.room}</h4>
                  <span className="text-[9px] font-bold rounded px-1.5 py-0.2 bg-slate-100 text-slate-700 border border-slate-200">
                    {r.status}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium mt-0.5">{r.spec}</div>
                <div className="text-[11px] text-slate-400">{r.dr}</div>
              </div>
            ))
          ) : activeNav === 'admit' ? (
            /* Operational Mode: Recent Admissions */
            patientsList.slice(0, 5).map((pat) => (
              <div
                key={pat.id}
                onClick={() => {
                  setSelectedPatientId(pat.id);
                  setActiveNav('patients');
                }}
                className="p-3.5 hover:bg-slate-50 cursor-pointer transition"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-900">{pat.name}</h4>
                  <span className="text-[9px] font-bold rounded px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Admitted
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  DOB: {pat.dob} ({pat.gender})
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  PIN: {pat.insurance.policyId}
                </div>
              </div>
            ))
          ) : (
            /* PhilHealth Batch Transmittals */
            [
              { id: 'TR-2026-00412', pat: 'Andrea Dizon', pkg: 'Konsulta Comprehensive First Visit', amount: 1750 },
              { id: 'TR-2026-00398', pat: 'Benjamin Alcantara', pkg: 'Diabetes Follow-up & Lab Package', amount: 2200 },
              { id: 'TR-2026-00350', pat: 'Maria Angelica Santos', pkg: 'Antenatal Consultation Package', amount: 1500 },
            ].map((t) => (
              <div key={t.id} className="p-3.5 hover:bg-slate-50 cursor-pointer transition">
                <div className="flex justify-between items-center font-mono text-xs font-bold text-slate-900">
                  <span>{t.id}</span>
                  <span className="text-emerald-700">{formatPhp(t.amount)}</span>
                </div>
                <div className="text-xs font-semibold text-slate-800 mt-1">{t.pat}</div>
                <div className="text-[11px] text-slate-500">{t.pkg}</div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* COLUMN 4: FULL-WIDTH DETAIL & ACTION WORKSTATION                          */}
      {/* (FLUID WIDTH: Zero dead whitespace on large monitors)                     */}
      {/* ========================================================================= */}
      <main
        className={`${
          mobileDetailViewOpen ? 'flex' : 'hidden md:flex'
        } flex-1 w-full min-w-0 bg-white overflow-y-auto flex-col p-4 sm:p-6 lg:p-8`}
      >
        {/* Mobile Drill-Down Back Header (< md) */}
        <div className="md:hidden flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setMobileDetailViewOpen(false)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 min-h-[44px]"
            aria-label="Back to list"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>← Back to {activeNav === 'patients' ? activeTab : activeNav}</span>
          </button>
          <span className="text-xs font-bold text-slate-900 truncate max-w-[160px]">
            {activeNav === 'patients' ? activeTask?.title || activeTab : activeNav}
          </span>
        </div>

        {/* ======================================================================= */}
        {/* WORKSTATION VIEW 1: CLINICAL TASKS (Exact 1:1 match to reference image) */}
        {/* ======================================================================= */}
        {((activeNav === 'patients' && activeTab === 'Tasks') || activeNav === 'tasks') && activeTask && (
          <div className="space-y-6 w-full">
            {/* Header: Task Title & Action Buttons (Trash & Solid Blue Checkmark) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {activeTask.title}
              </h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
                  title="Delete task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleTaskStatus(activeTask.id)}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-white shadow-xs transition ${
                    activeTask.status === 'Completed'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  title={activeTask.status === 'Completed' ? 'Task completed' : 'Mark task complete'}
                >
                  <Check className="h-4 w-4 stroke-[3]" />
                </button>
              </div>
            </div>

            {/* Task Description Body (Exact match to reference text) */}
            <div className="text-sm text-slate-800 leading-relaxed">
              {activeTask.description}
            </div>

            {/* If task is lab review, display clinical finding box with Action Buttons */}
            {activeTask.category === 'LAB_REVIEW' && currentPatient.labs[0] && (
              <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    {currentPatient.labs[0].testName}
                  </span>
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-mono text-blue-800">
                    LOINC: {currentPatient.labs[0].loincCode}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed font-sans">
                  {currentPatient.labs[0].resultsSummary}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRxModal(true)}
                    className="inline-flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition min-h-[36px]"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Issue e-Prescription (RA 6675)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBillingModal(true)}
                    className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition min-h-[36px]"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Print Cashier Bill
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-slate-200" />

            {/* Notes Section (Exact match to reference image with circular initials) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Notes
              </h3>

              {/* Notes Stream */}
              <div className="space-y-3">
                {activeTask.notes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No notes added yet.</p>
                ) : (
                  activeTask.notes.map((note) => (
                    <div key={note.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700">
                          {note.authorInitials}
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {note.authorName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {note.timestamp}
                        </span>
                      </div>
                      <div className="pl-7 text-xs text-slate-700 leading-relaxed">
                        {note.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Note Input Container with Circular Blue Pen Submit Button */}
              <form onSubmit={handleAddNote} className="pt-2">
                <div className="relative rounded-lg border border-slate-300 bg-white p-3 shadow-2xs focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition">
                  <textarea
                    rows={3}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add a clinical note about this Task..."
                    className="w-full resize-none text-base sm:text-xs text-slate-800 outline-none placeholder:text-slate-400 pr-12 min-h-[52px]"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className={`absolute bottom-3 right-3 flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-full text-white shadow-xs transition ${
                      newNoteText.trim()
                        ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                    title="Post note"
                    aria-label="Post clinical note"
                  >
                    <PenLine className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* WORKSTATION VIEW 2: VISITS & ENCOUNTERS (SOAP Notes Editor)             */}
        {/* ======================================================================= */}
        {activeNav === 'patients' && activeTab === 'Visits' && activeEncounter && (
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {activeEncounter.type}
                </h2>
                <div className="text-xs text-slate-500">
                  {activeEncounter.date} &bull; Attending: {activeEncounter.clinician}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSoapSigned(true)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition min-h-[36px] ${
                  soapSigned
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {soapSigned ? (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    <span>SOAP Note Signed & Locked</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Sign & Finalize Consultation</span>
                  </>
                )}
              </button>
            </div>

            {/* Vitals Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">BLOOD PRESSURE</span>
                <span className="text-sm font-bold text-slate-800">120/80 mmHg</span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">HEART RATE</span>
                <span className="text-sm font-bold text-slate-800">78 bpm</span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">RESPIRATORY</span>
                <span className="text-sm font-bold text-slate-800">18 cpm</span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">TEMPERATURE</span>
                <span className="text-sm font-bold text-slate-800">36.6 °C</span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">SPO2</span>
                <span className="text-sm font-bold text-emerald-700">99% Room Air</span>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
                <span className="text-[10px] font-bold text-slate-400 block">WEIGHT & BMI</span>
                <span className="text-sm font-bold text-slate-800">58 kg (22.6)</span>
              </div>
            </div>

            {/* SOAP Clinical Sections */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 p-3 bg-white space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                    S &bull; Subjective (Chief Complaint & HPI)
                  </span>
                  <textarea
                    rows={4}
                    value={soapSubjective || activeEncounter.subjective}
                    onChange={(e) => setSoapSubjective(e.target.value)}
                    className="w-full text-xs text-slate-800 outline-none leading-relaxed resize-none"
                  />
                </div>
                <div className="rounded-lg border border-slate-200 p-3 bg-white space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
                    O &bull; Objective (Physical Exam & Diagnostic Findings)
                  </span>
                  <textarea
                    rows={4}
                    value={soapObjective || activeEncounter.objective}
                    onChange={(e) => setSoapObjective(e.target.value)}
                    className="w-full text-xs text-slate-800 outline-none leading-relaxed resize-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 p-3 bg-white space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                    A &bull; Assessment & Clinical Diagnoses (ICD-10)
                  </span>
                  <textarea
                    rows={4}
                    value={soapAssessment || activeEncounter.assessment}
                    onChange={(e) => setSoapAssessment(e.target.value)}
                    className="w-full text-xs text-slate-800 outline-none leading-relaxed resize-none"
                  />
                </div>
                <div className="rounded-lg border border-slate-200 p-3 bg-white space-y-1.5 shadow-2xs">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
                    P &bull; Plan (Orders, Pharmacotherapy & Follow-up)
                  </span>
                  <textarea
                    rows={4}
                    value={soapPlan || activeEncounter.plan}
                    onChange={(e) => setSoapPlan(e.target.value)}
                    className="w-full text-xs text-slate-800 outline-none leading-relaxed resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* WORKSTATION VIEW 3: MEDS (Philippine Generics Act RA 6675 Prescriptions)*/}
        {/* ======================================================================= */}
        {activeNav === 'patients' && activeTab === 'Meds' && (
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Electronic Prescriptions & Medications
                </h2>
                <div className="text-xs text-slate-500">
                  Philippine Generics Act of 1988 (RA 6675) &bull; DOH Regulatory Compliant
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRxModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition min-h-[36px]"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Official Prescription Pad
              </button>
            </div>

            {rxSuccessMessage && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{rxSuccessMessage}</span>
              </div>
            )}

            {/* Drug Allergy Warning Banner */}
            {currentPatient.allergies.length > 0 && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 text-xs space-y-1">
                <span className="font-bold text-rose-800 flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  Prescription Allergy Alert
                </span>
                <p className="text-rose-700 leading-tight">
                  Patient has verified hypersensitivity to:{' '}
                  <strong>{currentPatient.allergies.map((a) => a.substance).join(', ')}</strong>.
                  Prescribe alternative generic classes.
                </p>
              </div>
            )}

            {/* Active Medications Cards */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Active Regimens
              </h3>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {currentPatient.medications.map((med) => (
                  <div key={med.id} className="rounded-lg border border-slate-200 p-3.5 bg-white space-y-1 shadow-2xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{med.genericName}</div>
                        <div className="text-xs text-slate-600 font-medium">{med.dosage}</div>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                        {med.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 italic">{med.instructions}</div>
                    <div className="text-[11px] text-slate-400 pt-1">
                      Prescribed by {med.prescribedBy} on {med.datePrescribed}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Prescription Form */}
            <form onSubmit={handleAddPrescription} className="rounded-lg border border-slate-200 p-4 bg-slate-50/50 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Prescribe New Medication (RA 6675)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Generic Name (Required by Law)
                  </label>
                  <input
                    type="text"
                    value={newRxGeneric}
                    onChange={(e) => setNewRxGeneric(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white p-2 outline-none focus:border-blue-500"
                    placeholder="e.g. Amoxicillin Trihydrate"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Dosage & Strength
                  </label>
                  <input
                    type="text"
                    value={newRxDose}
                    onChange={(e) => setNewRxDose(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white p-2 outline-none focus:border-blue-500"
                    placeholder="e.g. 500mg capsule"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Signatura / Instructions (Sig)
                  </label>
                  <input
                    type="text"
                    value={newRxSig}
                    onChange={(e) => setNewRxSig(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white p-2 outline-none focus:border-blue-500"
                    placeholder="e.g. 1 capsule every 8 hours for 7 days after meals"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition min-h-[36px]"
              >
                + Add to Prescription Pad
              </button>
            </form>
          </div>
        )}

        {/* ======================================================================= */}
        {/* WORKSTATION VIEW 4: LABS & DIAGNOSTICS                                  */}
        {/* ======================================================================= */}
        {activeNav === 'patients' && activeTab === 'Labs' && activeLab && (
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {activeLab.testName}
                </h2>
                <div className="text-xs text-slate-500">
                  LOINC: {activeLab.loincCode} &bull; Ordered Date: {activeLab.orderedDate}
                </div>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                {activeLab.status}
              </span>
            </div>

            {labSuccessMessage && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{labSuccessMessage}</span>
              </div>
            )}

            {/* Diagnostic Report Narrative Box */}
            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Official Radiologist / Laboratory Report
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-sans">
                {activeLab.resultsSummary ||
                  'Ultrasound examination confirms an anteverted uterus measuring 7.8 x 4.5 x 5.1 cm. Endometrial stripe thickness measures 14.2 mm with uniform secretory appearance. Right ovary measures 2.8 x 1.9 cm; left ovary measures 2.5 x 1.7 cm. No adnexal solid or cystic masses detected. No free pelvic fluid.'}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Interpreting Radiologist: Dr. Ramon Bautista, MD, FPCR</span>
                <span className="font-mono">License: PRC 0089211</span>
              </div>
            </div>

            {/* Order New Lab Requisition */}
            <form onSubmit={handleAddLabOrder} className="rounded-lg border border-slate-200 p-4 bg-slate-50/50 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Order Diagnostic Requisition
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Diagnostic Test / Study Name
                  </label>
                  <input
                    type="text"
                    value={newLabTestName}
                    onChange={(e) => setNewLabTestName(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white p-2 outline-none focus:border-blue-500"
                    placeholder="e.g. Complete Blood Count (CBC)"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    LOINC Code
                  </label>
                  <input
                    type="text"
                    value={newLabLoinc}
                    onChange={(e) => setNewLabLoinc(e.target.value)}
                    className="w-full rounded border border-slate-300 bg-white p-2 outline-none focus:border-blue-500"
                    placeholder="e.g. 58410-2"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition min-h-[36px]"
              >
                + Transmit Diagnostic Requisition
              </button>
            </form>
          </div>
        )}

        {/* ======================================================================= */}
        {/* WORKSTATION VIEW 5: CASHIER & PHILHEALTH BILLING                        */}
        {/* ======================================================================= */}
        {((activeNav === 'patients' && activeTab === 'Billing') || activeNav === 'billing') && (
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Cashier Checkout & PhilHealth Ledger
                </h2>
                <div className="text-xs text-slate-500">
                  Official BIR Compliant &bull; PhilHealth Konsulta Subsidy Calculator
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBillingModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition min-h-[36px]"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Official BIR Receipt
              </button>
            </div>

            {/* Discount / Statutory Selector */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-bold text-slate-800">
                Philippine Statutory Discount Category:
              </span>
              <div className="flex gap-2">
                {[
                  { id: 'NONE', label: 'Regular Patient' },
                  { id: 'SENIOR', label: 'Senior Citizen (RA 9994)' },
                  { id: 'PWD', label: 'PWD (RA 7277)' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setBillingPatientType(type.id as 'SENIOR' | 'PWD' | 'NONE')}
                    className={`rounded-lg px-3 py-1.5 font-bold transition min-h-[36px] ${
                      billingPatientType === type.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Invoice Line Items Table */}
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">Item Description</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5 text-right">Amount (PHP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sampleBillingItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{item.description}</td>
                      <td className="px-4 py-2.5 text-slate-500">{item.category}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                        {formatPhp(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Calculation Breakdown */}
              <div className="bg-slate-50/80 p-4 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Clinic Billing:</span>
                  <span className="font-mono font-semibold">{formatPhp(grossBilling)}</span>
                </div>
                {billingPatientType !== 'NONE' && (
                  <div className="flex justify-between text-rose-700 font-semibold">
                    <span>Senior / PWD 20% Discount + 12% VAT Exemption:</span>
                    <span className="font-mono">-{formatPhp(discountCalc.discountAmount + discountCalc.vatAmount)}</span>
                  </div>
                )}
                {philHealthCredit > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>PhilHealth Konsulta Benefit Credit:</span>
                    <span className="font-mono">-{formatPhp(philHealthCredit)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Total Amount Due (Net Payable):</span>
                  <span className="font-mono text-base text-blue-700">{formatPhp(netBillingPayable)}</span>
                </div>
              </div>
            </div>

            {/* Cash Payment Tender Calculator */}
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50/50 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Cash Tender & Change Due
              </span>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Cash Received: ₱</span>
                  <input
                    type="number"
                    value={tenderAmount}
                    onChange={(e) => setTenderAmount(Number(e.target.value))}
                    className="w-32 rounded border border-slate-300 bg-white p-2 font-mono font-bold outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 font-bold text-xs">
                  <span className="text-slate-500">Change Due:</span>
                  <span className="font-mono text-emerald-700 text-sm">
                    {formatPhp(Math.max(0, tenderAmount - netBillingPayable))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* WORKSTATION VIEW 6: FACILITY QUEUE PATIENT ACTIONS                     */}
        {/* ======================================================================= */}
        {activeNav === 'queue' && activeQueuePatient && (
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {activeQueuePatient.name}
                </h2>
                <div className="text-xs text-slate-500">
                  Stage: {activeQueuePatient.stage} &bull; Attending: {activeQueuePatient.doctor}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPatientId(activeQueuePatient.id);
                  setActiveNav('patients');
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition min-h-[36px]"
              >
                <Users className="h-3.5 w-3.5" />
                Open Patient Chart
              </button>
            </div>

            {/* Queue Stage Pipeline */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { stage: 'CHECKIN', label: '1. Arrived' },
                { stage: 'TRIAGE', label: '2. Triage' },
                { stage: 'CONSULT', label: '3. Consult' },
                { stage: 'BILLING', label: '4. Cashier' },
              ].map((s) => {
                const isCurrent = activeQueuePatient.stage === s.stage;
                return (
                  <div
                    key={s.stage}
                    className={`rounded-lg p-3 border transition ${
                      isCurrent
                        ? 'border-blue-500 bg-blue-50 text-blue-800 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <span>{s.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="rounded-lg border border-slate-200 p-4 space-y-3 bg-white shadow-2xs text-xs">
              <span className="font-bold text-slate-900 block uppercase tracking-wider text-[11px]">
                Triage Clinical Details
              </span>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">CHIEF COMPLAINT</span>
                <p className="text-slate-800 font-medium mt-0.5">{activeQueuePatient.chiefComplaint}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">Wait Duration: <strong>{activeQueuePatient.waitMinutes}</strong></span>
                <span className="text-slate-500">Priority: <strong>{activeQueuePatient.priority}</strong></span>
              </div>
            </div>

            {/* Advance Stage Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAdvanceQueueStage(activeQueuePatient.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition min-h-[44px]"
              >
                <span>Advance to Next Stage →</span>
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition min-h-[44px]"
              >
                <BellRing className="h-4 w-4" />
                <span>Call Patient into Room 204</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* WORKSTATION VIEW 7: SCHEDULE & APPOINTMENT WORKSTATION                  */}
        {/* ======================================================================= */}
        {activeNav === 'schedule' && activeAppointment && (
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {activeAppointment.patientName}
                </h2>
                <div className="text-xs text-slate-500">
                  {activeAppointment.timeSlot} &bull; {activeAppointment.serviceType}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCheckInAppointment(activeAppointment)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition min-h-[36px]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Check In to Facility Queue
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 p-3 bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">PATIENT DETAILS</span>
                <div className="font-bold text-slate-800">{activeAppointment.patientName}</div>
                <div className="text-slate-500">{activeAppointment.patientGender}, {activeAppointment.patientAge} years old</div>
                <div className="text-slate-500">Phone: {activeAppointment.patientPhone}</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">APPOINTMENT INFO</span>
                <div className="font-bold text-slate-800">{activeAppointment.doctorName}</div>
                <div className="text-slate-500">Duration: {activeAppointment.durationMinutes} mins</div>
                <div className="text-emerald-700 font-semibold">{activeAppointment.status}</div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50 text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 block">CHIEF REASON FOR VISIT</span>
              <p className="text-slate-800">{activeAppointment.chiefComplaint}</p>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* WORKSTATION VIEW 8: CLINIC ADMISSION FORM (+ NEW PATIENT)               */}
        {/* ======================================================================= */}
        {activeNav === 'admit' && (
          <form onSubmit={handleAdmitSubmit} className="space-y-6 w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  New Patient Clinical Admission & Registration
                </h2>
                <div className="text-xs text-slate-500">
                  Philippine DOH & PhilHealth Konsulta Standard Intake Protocol
                </div>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition min-h-[36px]"
              >
                <UserPlus className="h-4 w-4" />
                Save & Admit Directly to Queue
              </button>
            </div>

            {admissionSuccess && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Patient successfully registered and dispatched to Triage Queue!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Full Name (Last, First, Middle)
                </label>
                <input
                  type="text"
                  required
                  value={admitForm.name}
                  onChange={(e) => setAdmitForm({ ...admitForm, name: e.target.value })}
                  placeholder="e.g. Del Rosario, Catherine Joy"
                  className="w-full rounded border border-slate-300 bg-white p-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={admitForm.dob}
                  onChange={(e) => setAdmitForm({ ...admitForm, dob: e.target.value })}
                  className="w-full rounded border border-slate-300 bg-white p-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Biological Gender
                </label>
                <select
                  value={admitForm.gender}
                  onChange={(e) => setAdmitForm({ ...admitForm, gender: e.target.value })}
                  className="w-full rounded border border-slate-300 bg-white p-2 text-xs outline-none focus:border-blue-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  PhilHealth Identification Number (PIN)
                </label>
                <input
                  type="text"
                  value={admitForm.philhealth}
                  onChange={(e) => setAdmitForm({ ...admitForm, philhealth: e.target.value })}
                  placeholder="12-345678901-2"
                  className="w-full rounded border border-slate-300 bg-white p-2 text-xs font-mono outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Statutory Discount Eligibility
                </label>
                <select
                  value={admitForm.statutoryType}
                  onChange={(e) => setAdmitForm({ ...admitForm, statutoryType: e.target.value })}
                  className="w-full rounded border border-slate-300 bg-white p-2 text-xs outline-none focus:border-blue-500"
                >
                  <option value="REGULAR">Regular Patient</option>
                  <option value="SENIOR">Senior Citizen (RA 9994)</option>
                  <option value="PWD">Person With Disability (RA 7277)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Contact Mobile Number
                </label>
                <input
                  type="text"
                  value={admitForm.phone}
                  onChange={(e) => setAdmitForm({ ...admitForm, phone: e.target.value })}
                  placeholder="+63 9XX XXX XXXX"
                  className="w-full rounded border border-slate-300 bg-white p-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={admitForm.address}
                  onChange={(e) => setAdmitForm({ ...admitForm, address: e.target.value })}
                  placeholder="Street, Barangay, City/Municipality, Province"
                  className="w-full rounded border border-slate-300 bg-white p-2 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Chief Complaint & Triage Presentation
                </label>
                <textarea
                  rows={3}
                  value={admitForm.chiefComplaint}
                  onChange={(e) => setAdmitForm({ ...admitForm, chiefComplaint: e.target.value })}
                  placeholder="Describe patient presenting symptoms and triage notes..."
                  className="w-full rounded border border-slate-300 bg-white p-2 text-xs outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
          </form>
        )}

        {/* ======================================================================= */}
        {/* WORKSTATION VIEW 9: CLINICAL SPACES & BRANCHES                          */}
        {/* ======================================================================= */}
        {activeNav === 'spaces' && (
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {activeBranch.name} ({activeBranch.code})
                </h2>
                <div className="text-xs text-slate-500">
                  {activeBranch.address.line}, {activeBranch.address.city}, {activeBranch.address.province}
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                Operating Normal
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 p-3 bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">PHILHEALTH ACCREDITATION</span>
                <div className="font-bold text-slate-800">Konsulta DOH-Licensed</div>
                <div className="text-slate-500">Facility ID: PH-R3-OLG-042</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">CLINIC CONTACT</span>
                <div className="font-bold text-slate-800">{activeBranch.phone}</div>
                <div className="text-slate-500">Direct Landline & Teleconsult</div>
              </div>
              <div className="rounded-lg border border-slate-200 p-3 bg-white space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">CAPACITY OCCUPANCY</span>
                <div className="font-bold text-slate-800">4 Consultation Rooms</div>
                <div className="text-emerald-700 font-semibold">Active Dispatch</div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50 text-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block">
                Standard Operating Schedule
              </span>
              <p className="text-slate-700">{activeBranch.operatingHours}</p>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* WORKSTATION VIEW 10: PHILHEALTH CLAIMS CENTER                           */}
        {/* ======================================================================= */}
        {activeNav === 'claims' && (
          <div className="space-y-6 w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  PhilHealth eClaims Transmittal Verification
                </h2>
                <div className="text-xs text-slate-500">
                  CF4 Clinical Summaries & Electronic Claims Batch Generator
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                Konsulta API Connected
              </span>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3 shadow-2xs text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-mono font-bold text-slate-900 text-sm">TR-2026-00412</span>
                <span className="font-mono text-emerald-700 font-bold text-sm">₱ 1,750.00</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>Member: <strong>Andrea Dizon</strong></div>
                <div>PIN: <strong className="font-mono">12-345678901-2</strong></div>
                <div>Package: <strong>Konsulta Comprehensive First Visit</strong></div>
                <div>ICD-10 Code: <strong className="font-mono">N93.8</strong></div>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  className="rounded bg-blue-600 px-3 py-1.5 font-bold text-white hover:bg-blue-700 transition min-h-[36px]"
                >
                  Transmit XML to PhilHealth
                </button>
                <button
                  type="button"
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 transition min-h-[36px]"
                >
                  Inspect CF4 Form
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD ALLERGY                                                      */}
      {/* ========================================================================= */}
      {showAddAllergyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Patient Allergy</h3>
              <button
                type="button"
                onClick={() => setShowAddAllergyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveAllergy} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Allergenic Substance / Drug
                </label>
                <input
                  type="text"
                  required
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  placeholder="e.g. Aspirin, Co-Amoxiclav, Peanut"
                  className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Reaction & Manifestations
                </label>
                <input
                  type="text"
                  value={newAllergyReaction}
                  onChange={(e) => setNewAllergyReaction(e.target.value)}
                  placeholder="e.g. Urticaria, Bronchospasm, Anaphylaxis"
                  className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAllergyModal(false)}
                  className="rounded px-3 py-1.5 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-1.5 font-bold text-white hover:bg-blue-700"
                >
                  Save Allergy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD CLINICAL PROBLEM (ICD-10)                                    */}
      {/* ========================================================================= */}
      {showAddProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Add Clinical Problem (ICD-10)</h3>
              <button
                type="button"
                onClick={() => setShowAddProblemModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveProblem} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Clinical Condition / Diagnosis
                </label>
                <input
                  type="text"
                  required
                  value={newConditionName}
                  onChange={(e) => setNewConditionName(e.target.value)}
                  placeholder="e.g. Essential Hypertension"
                  className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  ICD-10 Code
                </label>
                <input
                  type="text"
                  value={newIcd10Code}
                  onChange={(e) => setNewIcd10Code(e.target.value)}
                  placeholder="e.g. I10"
                  className="w-full rounded border border-slate-300 p-2 outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProblemModal(false)}
                  className="rounded px-3 py-1.5 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-1.5 font-bold text-white hover:bg-blue-700"
                >
                  Save Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PRINTABLE PHILIPPINE CASHIER BILL                                */}
      {/* ========================================================================= */}
      {showBillingModal && (
        <PrintableBillingModal
          isOpen={showBillingModal}
          onClose={() => setShowBillingModal(false)}
          branch={activeBranch}
          statementNo="SOA-2026-09281"
          statementDate="October 04, 2026"
          patient={{
            name: currentPatient.name,
            age: parseInt(currentPatient.age) || 42,
            gender: currentPatient.gender,
            address: `${currentPatient.address}, ${currentPatient.city}`,
            philhealth: currentPatient.insurance.policyId,
            discountType: billingPatientType,
            discountId: currentPatient.insurance.statutoryId,
          }}
          items={sampleBillingItems}
          philhealthCredit={philHealthCredit}
          cashierName={activeUser.name}
          paymentMethod="Cash (PHP)"
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PRINTABLE PHILIPPINE GENERICS PRESCRIPTION (RA 6675)             */}
      {/* ========================================================================= */}
      {showRxModal && (
        <PrintablePrescriptionModal
          isOpen={showRxModal}
          onClose={() => setShowRxModal(false)}
          branch={activeBranch}
          encounterDate="October 04, 2026"
          patient={{
            name: currentPatient.name,
            age: parseInt(currentPatient.age) || 42,
            gender: currentPatient.gender,
            address: `${currentPatient.address}, ${currentPatient.city}`,
            philhealth: currentPatient.insurance.policyId,
            seniorId: currentPatient.insurance.statutoryId,
          }}
          physician={{
            name: currentPatient.primaryClinician,
            title: 'MD, FPOGS - Obstetrician & Gynecologist',
            prcNo: 'PRC-0098412',
            ptrNo: 'PTR-2026-88192',
            s2No: 'S2-0921-8841',
          }}
          prescriptions={currentPatient.medications.map((m) => ({
            genericName: m.genericName,
            brandName: m.brandName,
            dosage: m.dosage,
            route: 'Oral',
            frequency: 'Every 8 hours',
            duration: '7 days',
            dispenseQty: '21 capsules',
            instructions: m.instructions,
          }))}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: GLOBAL ⌘K COMMAND SEARCH OMNIBOX                                 */}
      {/* ========================================================================= */}
      <CommandSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectPatient={(patient) => {
          setSearchOpen(false);
          setSelectedPatientId(patient.id);
          setActiveNav('patients');
        }}
      />
    </div>
  );
}
