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
} from '@/lib/workbench-patient-data';
import { BranchLocation, calculatePhilippineDiscount, formatPhp } from '@/lib/ph-constants';
import { StaffUser } from '@/lib/user-management-store';
import { PrintableBillingModal, BillingLineItem } from './PrintableBillingModal';
import { PrintablePrescriptionModal, PrescriptionItem } from './PrintablePrescriptionModal';
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

interface UnifiedClinicalWorkbenchProps {
  currentBranch: BranchLocation;
  currentUser: StaffUser;
  onNavigateToView?: (view: string) => void;
  onOpenSearch?: () => void;
  initialPatientId?: string;
  initialTab?: WorkbenchTab;
}

export function UnifiedClinicalWorkbench({
  currentBranch,
  currentUser,
  onNavigateToView,
  onOpenSearch,
  initialPatientId = 'pat-105',
  initialTab = 'Tasks',
}: UnifiedClinicalWorkbenchProps) {
  // Navigation State
  const [navCollapsed, setNavCollapsed] = useState<boolean>(false);
  const [patientSummaryCollapsed, setPatientSummaryCollapsed] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<string>('patients');

  // Patients & Active Selection
  const [patientsList, setPatientsList] = useState<PatientProfileData[]>(WORKBENCH_PATIENTS);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId);
  const currentPatient =
    patientsList.find((p) => p.id === selectedPatientId) || patientsList[0];

  // Accordion Expand/Collapse States in Column 2
  const [insuranceOpen, setInsuranceOpen] = useState<boolean>(true);
  const [allergiesOpen, setAllergiesOpen] = useState<boolean>(true);
  const [problemsOpen, setProblemsOpen] = useState<boolean>(true);

  // Column 3 Tabs & Filter States
  const [activeTab, setActiveTab] = useState<WorkbenchTab>(initialTab);
  const [taskFilter, setTaskFilter] = useState<'MY' | 'ALL'>('MY');

  // Selected Item in Column 3 (Default to first task of active patient)
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    currentPatient.tasks[0]?.id || ''
  );
  const activeTask =
    currentPatient.tasks.find((t) => t.id === selectedTaskId) || currentPatient.tasks[0];

  // Notes Composer State in Column 4
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

  // Billing Interactive State for Billing Tab
  const [billingPatientType, setBillingPatientType] = useState<'SENIOR' | 'PWD' | 'NONE'>(
    currentPatient.insurance.statutoryType === 'SENIOR'
      ? 'SENIOR'
      : currentPatient.insurance.statutoryType === 'PWD'
      ? 'PWD'
      : 'NONE'
  );
  const [tenderAmount, setTenderAmount] = useState<number>(2000);
  const [paymentDone, setPaymentDone] = useState<boolean>(false);

  // Handler to Post a Note in Column 4
  const handleAddNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newNoteText.trim() || !activeTask) return;

    const newNote: ClinicalTaskNote = {
      id: `n-${Date.now()}`,
      authorInitials: currentUser.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
      authorName: currentUser.name,
      authorRole: currentUser.role === 'MAIN_DOCTOR' ? 'Attending Physician' : 'Clinical Staff',
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

  // Billing Calculations
  const sampleBillingItems: BillingLineItem[] = [
    { id: '1', description: 'Obstetrics & Gynecology Specialist Consultation', category: 'Consultation', qty: 1, unitPrice: 1000, amount: 1000 },
    { id: '2', description: 'Pelvic & Transvaginal Diagnostic Ultrasound', category: 'Diagnostic / Lab', qty: 1, unitPrice: 1200, amount: 1200 },
    { id: '3', description: 'Prescribed Oral Antibiotics & Prenatal Vitamins Course', category: 'Pharmacy', qty: 1, unitPrice: 850, amount: 850 },
  ];
  const grossBilling = sampleBillingItems.reduce((acc, item) => acc + item.amount, 0);
  const discountCalc = calculatePhilippineDiscount(grossBilling, billingPatientType, true);
  const philHealthCredit = currentPatient.insurance.konsultaAccredited ? 500 : 0;
  const netBillingPayable = Math.max(0, discountCalc.netPayablePhp - philHealthCredit);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white font-sans text-slate-900 antialiased selection:bg-blue-100">
      {/* ========================================================================= */}
      {/* COLUMN 1: LEFT NAVIGATION SIDEBAR (Matches Reference Style 1:1)           */}
      {/* ========================================================================= */}
      <aside
        className={`flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out ${
          navCollapsed ? 'w-16' : 'w-52'
        } shrink-0 select-none z-20`}
      >
        {/* Top Logo / App Title */}
        <div className="flex h-14 items-center gap-2.5 px-4 border-b border-slate-100">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
            <span className="text-base font-black leading-none">+</span>
          </div>
          {!navCollapsed && (
            <div className="min-w-0">
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
            onClick={onOpenSearch}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <Search className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && (
              <span className="flex-1 text-left flex items-center justify-between">
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
            onClick={() => onNavigateToView?.('branches')}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              activeNav === 'spaces'
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span>Spaces</span>}
          </button>

          {/* Patients (Active in reference image) */}
          <button
            type="button"
            onClick={() => {
              setActiveNav('patients');
              onNavigateToView?.('chart');
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              activeNav === 'patients'
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="h-4 w-4 shrink-0 text-sky-600" />
            {!navCollapsed && <span>Patients</span>}
          </button>

          {/* Schedule */}
          <button
            type="button"
            onClick={() => {
              setActiveNav('schedule');
              onNavigateToView?.('schedule');
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              activeNav === 'schedule'
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Calendar className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span>Schedule</span>}
          </button>

          {/* Messages */}
          <button
            type="button"
            onClick={() => {
              setActiveNav('messages');
              setActiveTab('Messages');
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              activeNav === 'messages'
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Mail className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span>Messages</span>}
          </button>

          {/* Tasks */}
          <button
            type="button"
            onClick={() => {
              setActiveNav('tasks');
              setActiveTab('Tasks');
            }}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
              activeNav === 'tasks'
                ? 'bg-sky-50 text-sky-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ClipboardCheck className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span>Tasks</span>}
          </button>

          {/* Divider: Quick Links */}
          <div className="pt-3 pb-1">
            {!navCollapsed && (
              <span className="block px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Links
              </span>
            )}
          </div>

          {/* Get Started / New Patient */}
          <button
            type="button"
            onClick={() => onNavigateToView?.('admit')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <Plus className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span>New Patient</span>}
          </button>

          {/* Cashier & Billing */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('Billing');
              setActiveNav('billing');
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <CreditCard className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span>Billing & Ledger</span>}
          </button>

          {/* PhilHealth eClaims */}
          <button
            type="button"
            onClick={() => onNavigateToView?.('claims')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <ShieldCheck className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span>PhilHealth Claims</span>}
          </button>

          {/* Today's Queue */}
          <button
            type="button"
            onClick={() => onNavigateToView?.('queue')}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <FolderKanban className="h-4 w-4 shrink-0 text-slate-500" />
            {!navCollapsed && <span>Facility Queue</span>}
          </button>
        </div>

        {/* Bottom Doctor Profile & Collapse Toggle */}
        <div className="border-t border-slate-200 p-2.5 bg-slate-50/50">
          <div className="flex items-center justify-between">
            {!navCollapsed && (
              <div className="min-w-0 flex items-center gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                  {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="truncate">
                  <span className="block text-xs font-semibold text-slate-800 truncate">
                    {currentUser.name}
                  </span>
                  <span className="block text-[10px] text-slate-400 truncate">
                    {currentBranch.name}
                  </span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setNavCollapsed(!navCollapsed)}
              className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              title={navCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              {navCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* COLUMN 2: PATIENT PROFILE & DEMOGRAPHICS (Matches Reference Style 1:1)   */}
      {/* ========================================================================= */}
      {!patientSummaryCollapsed && (
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col overflow-y-auto select-none z-10">
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

          {/* Quick Patient Switcher Selector (Philippine Metro Health patients) */}
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

          {/* Demographics Icon List (Exact match to screenshot) */}
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
        </aside>
      )}

      {/* Expand Button if Column 2 is Collapsed */}
      {patientSummaryCollapsed && (
        <div className="border-r border-slate-200 bg-white p-2 flex flex-col items-center">
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
      {/* COLUMN 3: TABBED CLINICAL WORKSPACE LIST (Matches Reference Style 1:1)    */}
      {/* ========================================================================= */}
      <section className="w-88 shrink-0 border-r border-slate-200 bg-white flex flex-col select-none">
        {/* Top Horizontal Clinical Tab Strip */}
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

        {/* Sub-Filter Bar under Active Tab (Exact match to screenshot for Tasks) */}
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-100 bg-slate-50/40">
          <div className="flex items-center gap-1.5 text-xs">
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
          </div>

          <div className="flex items-center gap-2">
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
          {activeTab === 'Tasks' &&
            currentPatient.tasks.map((task) => {
              const isSelected = activeTask?.id === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
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
            })}

          {activeTab === 'Visits' &&
            currentPatient.encounters.map((enc) => (
              <div
                key={enc.id}
                className="p-3.5 hover:bg-slate-50/60 cursor-pointer transition"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{enc.type}</h4>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.2 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                    {enc.status}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">{enc.date}</div>
                <div className="mt-0.5 text-xs text-slate-700 font-medium">
                  {enc.chiefComplaint}
                </div>
              </div>
            ))}

          {activeTab === 'Meds' &&
            currentPatient.medications.map((med) => (
              <div
                key={med.id}
                className="p-3.5 hover:bg-slate-50/60 cursor-pointer transition"
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
            ))}

          {activeTab === 'Labs' &&
            currentPatient.labs.map((lab) => (
              <div
                key={lab.id}
                className="p-3.5 hover:bg-slate-50/60 cursor-pointer transition"
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
            ))}

          {activeTab === 'Billing' && (
            <div className="p-3.5 space-y-3">
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
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* COLUMN 4: DETAIL / ACTION WORKSTATION (Matches Reference Style 1:1)       */}
      {/* ========================================================================= */}
      <main className="flex-1 bg-white overflow-y-auto flex flex-col p-6 max-w-4xl">
        {activeTask ? (
          <div className="space-y-6">
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

            {/* If task is lab review, display clinical finding box */}
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
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRxModal(true)}
                    className="inline-flex items-center gap-1.5 rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-blue-700 transition"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Issue e-Prescription (RA 6675)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBillingModal(true)}
                    className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
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
                    placeholder="Add a note about this Task..."
                    className="w-full resize-none text-xs text-slate-800 outline-none placeholder:text-slate-400 pr-10"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteText.trim()}
                    className={`absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-xs transition ${
                      newNoteText.trim()
                        ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                        : 'bg-slate-300 cursor-not-allowed'
                    }`}
                    title="Post note"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400 text-xs italic">
            Select an item from the list to view workstation details
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL: ADD ALLERGY                                                        */}
      {/* ========================================================================= */}
      {showAddAllergyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Document Patient Allergy</h3>
              <button
                type="button"
                onClick={() => setShowAddAllergyModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveAllergy} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Allergenic Substance / Drug
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin, Ibuprofen, Shellfish"
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 text-xs outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observed Clinical Reaction
                </label>
                <input
                  type="text"
                  placeholder="e.g. Facial edema, urticaria, bronchospasm"
                  value={newAllergyReaction}
                  onChange={(e) => setNewAllergyReaction(e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 text-xs outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAllergyModal(false)}
                  className="rounded px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Save Allergy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD PROBLEM (ICD-10)                                               */}
      {/* ========================================================================= */}
      {showAddProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Clinical Problem / Diagnosis</h3>
              <button
                type="button"
                onClick={() => setShowAddProblemModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveProblem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Condition / Diagnostic Term
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Essential Hypertension, Type 2 Diabetes"
                  value={newConditionName}
                  onChange={(e) => setNewConditionName(e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 text-xs outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ICD-10 Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. I10, E11.9, N93.8"
                  value={newIcd10Code}
                  onChange={(e) => setNewIcd10Code(e.target.value)}
                  className="w-full rounded border border-slate-300 p-2 text-xs font-mono outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProblemModal(false)}
                  className="rounded px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Save Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PRINTABLE OFFICIAL BILLING RECEIPT                                 */}
      {/* ========================================================================= */}
      <PrintableBillingModal
        isOpen={showBillingModal}
        onClose={() => setShowBillingModal(false)}
        branch={currentBranch}
        statementNo="OR-2026-9041"
        patient={{
          name: currentPatient.name,
          age: parseInt(currentPatient.age) || 42,
          gender: currentPatient.gender,
          address: `${currentPatient.address}, ${currentPatient.city}`,
          philhealth: currentPatient.insurance.policyId,
          discountType: (currentPatient.insurance.statutoryType as 'SENIOR' | 'PWD' | 'NONE') || 'NONE',
          discountId: currentPatient.insurance.statutoryId,
        }}
        items={sampleBillingItems}
        philhealthCredit={philHealthCredit}
        paymentMethod="CASH"
        cashierName={currentUser.name}
      />

      {/* ========================================================================= */}
      {/* MODAL: PRINTABLE E-PRESCRIPTION (RA 6675)                                 */}
      {/* ========================================================================= */}
      <PrintablePrescriptionModal
        isOpen={showRxModal}
        onClose={() => setShowRxModal(false)}
        branch={currentBranch}
        patient={{
          name: currentPatient.name,
          age: parseInt(currentPatient.age) || 42,
          gender: currentPatient.gender,
          address: `${currentPatient.address}, ${currentPatient.city}`,
          philhealth: currentPatient.insurance.policyId,
          seniorId: currentPatient.insurance.statutoryId,
        }}
        prescriptions={currentPatient.medications.map((m) => ({
          genericName: m.genericName,
          brandName: m.brandName,
          dosage: m.dosage,
          route: 'Oral (PO)',
          frequency: 'Once Daily (OD)',
          duration: '30 days',
          dispenseQty: '30 tablets',
          instructions: m.instructions,
        }))}
        physician={{
          name: currentUser.name,
          title: 'Obstetrician-Gynecologist & Primary Care',
          prcNo: '0089241',
          ptrNo: '5521901',
          s2No: 'S2-2025-4190',
        }}
      />
    </div>
  );
}
