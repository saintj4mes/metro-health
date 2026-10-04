'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState, useMemo } from 'react';
import {
  StaffUser,
  UserRole,
  UserBranchAccess,
  EmploymentType,
  INITIAL_STAFF_USERS,
  CLINIC_SERVICES_CATALOG,
  formatBranchAccessLabel,
} from '@/lib/user-management-store';
import { CLINIC_BRANCHES } from '@/lib/ph-constants';
import {
  ShieldCheck,
  UserPlus,
  Users,
  Building2,
  Lock,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  AlertTriangle,
  Search,
  Filter,
  Phone,
  Mail,
  Clock,
  Calendar,
  CalendarOff,
  Stethoscope,
  ChevronRight,
  ChevronDown,
  Check,
  Camera,
  Trash2,
  MoreVertical,
  Briefcase,
  Layers,
} from 'lucide-react';

interface UserManagementViewProps {
  currentUser: StaffUser;
  onStaffListChange?: (users: StaffUser[]) => void;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const SPECIALTY_OPTIONS = [
  'Internal Medicine & Adult Pulmonology',
  'Family Medicine & Primary Care',
  'Pediatrics & Adolescent Medicine',
  'Cardiology & Vascular Medicine',
  'Obstetrics & Gynecology (OB-GYN)',
  'General Dentistry & Oral Surgery',
  'Dermatology & Skin Health',
  'Clinical Triage & Emergency Response',
  'Healthcare Finance & BIR Compliance',
  'Patient Reception & Front Desk',
];

export function UserManagementView({ currentUser, onStaffListChange }: UserManagementViewProps) {
  const [users, setUsers] = useState<StaffUser[]>(INITIAL_STAFF_USERS);
  const [activeTab, setActiveTab] = useState<'ALL' | 'DOCTORS' | 'GENERAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');

  // Wizard Modal State
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Edit modal
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);

  // New Staff Wizard Form Data
  const [formData, setFormData] = useState({
    // Step 1: Staff Info
    name: '',
    role: 'DOCTOR' as UserRole,
    roleTitle: 'Attending Physician',
    specialty: 'Internal Medicine & Adult Pulmonology',
    email: '',
    phone: '',
    address: '',
    prcLicense: '',
    ptrNo: '',
    employmentType: 'FULL_TIME' as EmploymentType,
    accessType: 'ALL' as 'ALL' | 'SPECIFIC',
    selectedBranches: ['branch-espinosa'] as string[],
    avatarPreview: '',

    // Step 2: Assigned Services
    assignedServices: [
      'General OPD Consultation',
      'Digital Prescription Signing (RA 6675)',
    ] as string[],

    // Step 3: Working Hours
    workingDays: [1, 2, 3, 4, 5] as number[], // Mon-Fri
    startTime: '08:00 AM',
    endTime: '05:00 PM',
    consultationRoom: 'Consultation Room 101',

    // Step 4: Days Off
    daysOff: ['Sunday', 'Saturday'] as string[],
    onCallAvailability: true,
  });

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Tab filter
      if (activeTab === 'DOCTORS' && u.role !== 'DOCTOR' && u.role !== 'MAIN_DOCTOR') {
        return false;
      }
      if (activeTab === 'GENERAL' && (u.role === 'DOCTOR' || u.role === 'MAIN_DOCTOR')) {
        return false;
      }
      // Branch filter
      if (selectedBranchFilter !== 'ALL') {
        if (u.branchAccess !== 'ALL' && !u.branchAccess.includes(selectedBranchFilter)) {
          return false;
        }
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchRole = u.roleTitle.toLowerCase().includes(q);
        const matchSpec = u.specialty?.toLowerCase().includes(q);
        const matchPrc = u.prcLicense?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchRole && !matchSpec && !matchPrc) {
          return false;
        }
      }
      return true;
    });
  }, [users, activeTab, selectedBranchFilter, searchQuery]);

  // Counts
  const stats = useMemo(() => {
    const total = users.length;
    const doctors = users.filter((u) => u.role === 'DOCTOR' || u.role === 'MAIN_DOCTOR').length;
    const fullTime = users.filter((u) => u.employmentType === 'FULL_TIME').length;
    const partTime = users.filter((u) => u.employmentType === 'PART_TIME').length;
    return { total, doctors, fullTime, partTime };
  }, [users]);

  // Handlers for Wizard Form
  const handleBranchCheckboxChange = (branchId: string) => {
    setFormData((prev) => {
      const exists = prev.selectedBranches.includes(branchId);
      const updated = exists
        ? prev.selectedBranches.filter((id) => id !== branchId)
        : [...prev.selectedBranches, branchId];
      return { ...prev, selectedBranches: updated };
    });
  };

  const handleToggleService = (service: string) => {
    setFormData((prev) => {
      const exists = prev.assignedServices.includes(service);
      const updated = exists
        ? prev.assignedServices.filter((s) => s !== service)
        : [...prev.assignedServices, service];
      return { ...prev, assignedServices: updated };
    });
  };

  const handleToggleDay = (dayIndex: number) => {
    setFormData((prev) => {
      const exists = prev.workingDays.includes(dayIndex);
      const updated = exists
        ? prev.workingDays.filter((d) => d !== dayIndex)
        : [...prev.workingDays, dayIndex].sort();
      return { ...prev, workingDays: updated };
    });
  };

  const handleToggleDayOff = (dayName: string) => {
    setFormData((prev) => {
      const exists = prev.daysOff.includes(dayName);
      const updated = exists
        ? prev.daysOff.filter((d) => d !== dayName)
        : [...prev.daysOff, dayName];
      return { ...prev, daysOff: updated };
    });
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const branchAccess: UserBranchAccess =
      formData.accessType === 'ALL' ? 'ALL' : formData.selectedBranches;

    const newStaff: StaffUser = {
      id: `user-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim() || 'Dr. Alyssa Valdez, MD',
      role: formData.role,
      roleTitle: formData.roleTitle,
      specialty: formData.specialty,
      email: formData.email.trim() || 'a.valdez@metrohealth.ph',
      phone: formData.phone.trim() || '+63 917 888 9999',
      address: formData.address || 'Metro Manila, Philippines',
      prcLicense: formData.prcLicense.trim() || '0159982',
      ptrNo: formData.ptrNo.trim() || '9912034',
      branchAccess,
      employmentType: formData.employmentType,
      workingDays: formData.workingDays.length > 0 ? formData.workingDays : [1, 2, 3, 4, 5],
      workingHours: `${formData.startTime} - ${formData.endTime}`,
      assignedServices: formData.assignedServices.length > 0 ? formData.assignedServices : ['General OPD Consultation'],
      daysOff: formData.daysOff,
      status: 'ACTIVE',
      joinedDate: new Date().toISOString().split('T')[0],
    };

    const updatedUsers = [...users, newStaff];
    setUsers(updatedUsers);
    if (onStaffListChange) onStaffListChange(updatedUsers);

    // Show Zendenta-style success toast
    setSuccessToast(`Staff added - "${newStaff.name}" added to clinic staff`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);

    // Reset Wizard
    setShowWizardModal(false);
    setCurrentStep(1);
    setFormData({
      name: '',
      role: 'DOCTOR',
      roleTitle: 'Attending Physician',
      specialty: 'Internal Medicine & Adult Pulmonology',
      email: '',
      phone: '',
      address: '',
      prcLicense: '',
      ptrNo: '',
      employmentType: 'FULL_TIME',
      accessType: 'ALL',
      selectedBranches: ['branch-espinosa'],
      avatarPreview: '',
      assignedServices: ['General OPD Consultation', 'Digital Prescription Signing (RA 6675)'],
      workingDays: [1, 2, 3, 4, 5],
      startTime: '08:00 AM',
      endTime: '05:00 PM',
      consultationRoom: 'Consultation Room 101',
      daysOff: ['Sunday', 'Saturday'],
      onCallAvailability: true,
    });
  };

  const handleToggleStatus = (userId: string) => {
    const updatedUsers = users.map((u) => {
      if (u.id !== userId) return u;
      return {
        ...u,
        status: u.status === 'ACTIVE' ? ('SUSPENDED' as const) : ('ACTIVE' as const),
      };
    });
    setUsers(updatedUsers);
    if (onStaffListChange) onStaffListChange(updatedUsers);
  };

  return (
    <div className="space-y-4">
      {/* 0. Floating Zendenta-Style Success Toast */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 shadow-xl dark:border-emerald-800 dark:bg-slate-900 animate-in slide-in-from-top-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="h-4 w-4 stroke-[3]" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Staff Added Successfully</div>
            <div className="text-[11px] text-slate-500">{successToast}</div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="ml-2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 1. Header & Quick Metrics Strip */}
      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Staff & Practitioner Directory
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {stats.total} Total
                  </span>
                </h1>
                <p className="text-[11px] text-slate-500">
                  Practitioners, clinical specialties, and branch access scopes.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowWizardModal(true);
                setCurrentStep(1);
              }}
              className="inline-flex items-center gap-1.5 rounded bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-blue-700 transition"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Staff</span>
            </button>
          </div>
        </div>

        {/* Tab Selector & Filter Bar */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Tabs */}
          <div className="flex items-center space-x-1 rounded bg-slate-100 p-0.5 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              All Staff ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('DOCTORS')}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                activeTab === 'DOCTORS'
                  ? 'bg-white text-blue-600 shadow-2xs dark:bg-slate-700 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Doctors ({stats.doctors})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('GENERAL')}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition ${
                activeTab === 'GENERAL'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              General ({stats.total - stats.doctors})
            </button>
          </div>

          {/* Search & Branch Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-56">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-7 rounded border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="h-7 rounded border border-slate-200 bg-white px-2 text-xs text-slate-700 focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Branches</option>
              {CLINIC_BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Staff List Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:border-slate-700">
              <tr>
                <th className="px-3 py-1.5">Name & Specialty</th>
                <th className="px-3 py-1.5">Contact</th>
                <th className="px-3 py-1.5">Working Days</th>
                <th className="px-3 py-1.5">Assigned Services</th>
                <th className="px-3 py-1.5">Branch Scope</th>
                <th className="px-3 py-1.5">Employment</th>
                <th className="px-3 py-1.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No staff records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSuspended = u.status === 'SUSPENDED';
                  const initials = u.name
                    .replace(/^Dr\.\s*/, '')
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('');

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                        isSuspended ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs dark:bg-blue-950 dark:text-blue-300">
                            {initials}
                            <span
                              className={`absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white dark:border-slate-900 ${
                                isSuspended ? 'bg-rose-500' : 'bg-emerald-500'
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                              {u.name}
                              {u.role === 'MAIN_DOCTOR' && (
                                <span className="rounded bg-blue-50 px-1 py-0.1 text-[9px] font-semibold text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                                  Director
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {u.specialty || u.roleTitle}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-3 py-1.5">
                        <div className="font-mono text-slate-800 dark:text-slate-200 text-xs">
                          {u.phone}
                        </div>
                        <div className="text-[10px] text-blue-600 dark:text-blue-400">
                          {u.email}
                        </div>
                        {u.prcLicense && (
                          <div className="text-[9px] font-mono text-slate-400">
                            PRC: {u.prcLicense}
                          </div>
                        )}
                      </td>

                      {/* Working Days */}
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-0.5">
                          {DAY_LABELS.map((day, idx) => {
                            const isWorking = u.workingDays?.includes(idx);
                            return (
                              <div
                                key={idx}
                                title={DAY_NAMES[idx]}
                                className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-bold transition ${
                                  isWorking
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                                }`}
                              >
                                {day}
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-0.5 text-[9px] text-slate-400 font-mono">
                          {u.workingHours || '08:00 AM - 05:00 PM'}
                        </div>
                      </td>

                      {/* Assigned Services */}
                      <td className="px-3 py-1.5">
                        <div className="flex flex-wrap items-center gap-1 max-w-xs">
                          {u.assignedServices && u.assignedServices.length > 0 ? (
                            <>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {u.assignedServices[0]}
                              </span>
                              {u.assignedServices.length > 1 && (
                                <span className="rounded bg-blue-50 px-1 py-0.5 text-[9px] font-semibold text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                                  +{u.assignedServices.length - 1}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-slate-400 text-xs italic">General Clinic OPD</span>
                          )}
                        </div>
                      </td>

                      {/* Branch Scope */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {formatBranchAccessLabel(u.branchAccess)}
                        </span>
                      </td>

                      {/* Employment Type */}
                      <td className="px-3 py-1.5 whitespace-nowrap">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            u.employmentType === 'FULL_TIME'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                          }`}
                        >
                          {u.employmentType === 'FULL_TIME' ? 'Full-Time' : 'Part-Time'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-1.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(u.id)}
                            title={isSuspended ? 'Activate Staff' : 'Suspend Staff'}
                            className={`rounded p-1 transition ${
                              isSuspended
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                          >
                            {isSuspended ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. 4-Step "Add Staff" Wizard Modal */}
      {showWizardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-lg border border-slate-300 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-slate-800">
              <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Add Staff Member
              </h2>
              <button
                type="button"
                onClick={() => setShowWizardModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="relative flex items-center justify-between">
                <div className="absolute left-6 right-6 top-3 h-0.5 bg-slate-200 dark:bg-slate-700 -z-0" />

                {[
                  { step: 1, title: 'Staff Info', icon: Users },
                  { step: 2, title: 'Services', icon: Stethoscope },
                  { step: 3, title: 'Hours', icon: Clock },
                  { step: 4, title: 'Days Off', icon: CalendarOff },
                ].map((s) => {
                  const Icon = s.icon;
                  const isCompleted = currentStep > s.step;
                  const isActive = currentStep === s.step;

                  return (
                    <div key={s.step} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full font-bold text-[10px] transition ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isActive
                            ? 'bg-blue-600 text-white ring-2 ring-blue-100 dark:ring-blue-950'
                            : 'border border-slate-300 bg-white text-slate-400 dark:border-slate-600 dark:bg-slate-800'
                        }`}
                      >
                        {isCompleted ? <Check className="h-3 w-3 stroke-[3]" /> : s.step}
                      </div>
                      <div
                        className={`text-[10px] font-semibold mt-1 ${
                          isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : isCompleted
                            ? 'text-slate-700 dark:text-slate-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {s.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Contents */}
            <form onSubmit={handleCreateStaff}>
              <div className="p-3.5 sm:p-4 max-h-[65vh] overflow-y-auto space-y-3">
                {/* STEP 1: Staff Info */}
                {currentStep === 1 && (
                  <div className="space-y-3">
                    {/* Avatar Upload Simulation */}
                    <div className="flex items-center gap-3 p-2 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs dark:bg-blue-950 dark:text-blue-300 border border-dashed border-blue-300">
                        {formData.name ? formData.name[0] : <Camera className="h-4 w-4 text-blue-500" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSuccessToast('Photo uploaded & attached to practitioner profile.');
                              setTimeout(() => setSuccessToast(null), 3000);
                            }}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                          >
                            Upload Photo
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, avatarPreview: '' })}
                            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Square photo (400x400px recommended).
                        </p>
                      </div>
                    </div>

                    {/* Employment Type Radio Buttons */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Employment Type
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label
                          className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition ${
                            formData.employmentType === 'FULL_TIME'
                              ? 'border-blue-600 bg-blue-50/40 text-blue-900 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-200'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="employmentType"
                            checked={formData.employmentType === 'FULL_TIME'}
                            onChange={() => setFormData({ ...formData, employmentType: 'FULL_TIME' })}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-semibold">Full time (40 hrs/wk)</span>
                        </label>

                        <label
                          className={`flex items-center gap-2 rounded-lg border p-2 cursor-pointer transition ${
                            formData.employmentType === 'PART_TIME'
                              ? 'border-blue-600 bg-blue-50/40 text-blue-900 dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-200'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="employmentType"
                            checked={formData.employmentType === 'PART_TIME'}
                            onChange={() => setFormData({ ...formData, employmentType: 'PART_TIME' })}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-xs font-semibold">Part Time (Visiting)</span>
                        </label>
                      </div>
                    </div>

                    {/* Personal & Professional Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dr. Darrell Stewart, MD"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Specialty / Department *
                        </label>
                        <select
                          value={formData.specialty}
                          onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                          className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-hidden"
                        >
                          {SPECIALTY_OPTIONS.map((spec) => (
                            <option key={spec} value={spec}>
                              {spec}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="text"
                            placeholder="+63 917 555 0100"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="email"
                            required
                            placeholder="doctor@metrohealth.ph"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          PRC License No.
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 0148821"
                          value={formData.prcLicense}
                          onChange={(e) => setFormData({ ...formData, prcLicense: e.target.value })}
                          className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-mono text-slate-900 dark:text-white focus:border-blue-600 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          PTR Receipt No.
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 5521901"
                          value={formData.ptrNo}
                          onChange={(e) => setFormData({ ...formData, ptrNo: e.target.value })}
                          className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs font-mono text-slate-900 dark:text-white focus:border-blue-600 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Address with Character Counter */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Clinic / Residential Address
                        </label>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formData.address.length}/200
                        </span>
                      </div>
                      <textarea
                        rows={2}
                        maxLength={200}
                        placeholder="Clinic office address..."
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>

                    {/* Branch Access Scope */}
                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                        Branch Access Scope
                      </label>
                      <div className="flex items-center gap-3 mb-1.5 text-xs">
                        <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                          <input
                            type="radio"
                            name="accessType"
                            checked={formData.accessType === 'ALL'}
                            onChange={() => setFormData({ ...formData, accessType: 'ALL' })}
                            className="text-blue-600"
                          />
                          <span>All 3 Branches (Full Clinic Roaming)</span>
                        </label>
                        <label className="flex items-center gap-1.5 font-medium cursor-pointer">
                          <input
                            type="radio"
                            name="accessType"
                            checked={formData.accessType === 'SPECIFIC'}
                            onChange={() => setFormData({ ...formData, accessType: 'SPECIFIC' })}
                            className="text-blue-600"
                          />
                          <span>Specific Branch Only</span>
                        </label>
                      </div>

                      {formData.accessType === 'SPECIFIC' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                          {CLINIC_BRANCHES.map((b) => (
                            <label key={b.id} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                              <input
                                type="checkbox"
                                checked={formData.selectedBranches.includes(b.id)}
                                onChange={() => handleBranchCheckboxChange(b.id)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className="truncate">{b.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 2: Assigned Services */}
                {currentStep === 2 && (
                  <div className="space-y-3">
                    <div className="text-[11px] text-slate-500">
                      Select clinical procedures and services this physician is credentialed to perform.
                    </div>

                    {/* Category 1: Consultation Services */}
                    <div className="rounded-lg border border-slate-200 overflow-hidden dark:border-slate-800">
                      <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5 dark:bg-slate-800">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Consultation & Outpatient Care
                        </span>
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {formData.assignedServices.filter((s) => CLINIC_SERVICES_CATALOG.consultation.includes(s)).length} Selected
                        </span>
                      </div>
                      <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-white dark:bg-slate-900">
                        {CLINIC_SERVICES_CATALOG.consultation.map((s) => (
                          <label key={s} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                            <input
                              type="checkbox"
                              checked={formData.assignedServices.includes(s)}
                              onChange={() => handleToggleService(s)}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span>{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Category 2: Diagnostic & Clinical Procedures */}
                    <div className="rounded-lg border border-slate-200 overflow-hidden dark:border-slate-800">
                      <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5 dark:bg-slate-800">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Diagnostic & Clinical Orders
                        </span>
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {formData.assignedServices.filter((s) => CLINIC_SERVICES_CATALOG.procedures.includes(s)).length} Selected
                        </span>
                      </div>
                      <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-white dark:bg-slate-900">
                        {CLINIC_SERVICES_CATALOG.procedures.map((s) => (
                          <label key={s} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                            <input
                              type="checkbox"
                              checked={formData.assignedServices.includes(s)}
                              onChange={() => handleToggleService(s)}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span>{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Category 3: Administrative & Legal Clearances */}
                    <div className="rounded-lg border border-slate-200 overflow-hidden dark:border-slate-800">
                      <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5 dark:bg-slate-800">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Statutory Clearances & Prescriptions
                        </span>
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {formData.assignedServices.filter((s) => CLINIC_SERVICES_CATALOG.administrative.includes(s)).length} Selected
                        </span>
                      </div>
                      <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-white dark:bg-slate-900">
                        {CLINIC_SERVICES_CATALOG.administrative.map((s) => (
                          <label key={s} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                            <input
                              type="checkbox"
                              checked={formData.assignedServices.includes(s)}
                              onChange={() => handleToggleService(s)}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span>{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Working Hours & Schedule Setup */}
                {currentStep === 3 && (
                  <div className="space-y-3">
                    <div className="text-[11px] text-slate-500">
                      Configure active consultation days and clinic room assignment.
                    </div>

                    {/* Day Selection */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                        Select Working Days
                      </label>
                      <div className="flex items-center gap-1.5">
                        {DAY_LABELS.map((day, idx) => {
                          const isSelected = formData.workingDays.includes(idx);
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleToggleDay(idx)}
                              className={`flex h-8 w-8 flex-col items-center justify-center rounded font-bold text-xs transition ${
                                isSelected
                                  ? 'bg-blue-600 text-white shadow-2xs'
                                  : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              <span>{day}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shift Times */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Shift Start Time
                        </label>
                        <select
                          value={formData.startTime}
                          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                          className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-900 dark:text-white focus:border-blue-600"
                        >
                          <option value="07:00 AM">07:00 AM</option>
                          <option value="08:00 AM">08:00 AM</option>
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="10:00 AM">10:00 AM</option>
                          <option value="01:00 PM">01:00 PM</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Shift End Time
                        </label>
                        <select
                          value={formData.endTime}
                          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                          className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs text-slate-900 dark:text-white focus:border-blue-600"
                        >
                          <option value="12:00 PM">12:00 PM</option>
                          <option value="03:00 PM">03:00 PM</option>
                          <option value="05:00 PM">05:00 PM</option>
                          <option value="07:00 PM">07:00 PM</option>
                          <option value="09:00 PM">09:00 PM</option>
                        </select>
                      </div>
                    </div>

                    {/* Room Assignment */}
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        Assigned Room
                      </label>
                      <input
                        type="text"
                        value={formData.consultationRoom}
                        onChange={(e) => setFormData({ ...formData, consultationRoom: e.target.value })}
                        className="w-full h-8 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-600"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: Days Off */}
                {currentStep === 4 && (
                  <div className="space-y-3">
                    <div className="text-[11px] text-slate-500">
                      Manage rest days and on-call availability.
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                        Weekly Scheduled Days Off
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {DAY_NAMES.map((name) => {
                          const isOff = formData.daysOff.includes(name);
                          return (
                            <label
                              key={name}
                              className={`flex items-center gap-1.5 rounded border p-1.5 text-xs font-medium cursor-pointer transition ${
                                isOff
                                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-200'
                                  : 'border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isOff}
                                onChange={() => handleToggleDayOff(name)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-[11px]">{name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">
                          On-Call Emergency Coverage
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Allow triage contact outside scheduled shifts.
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.onCallAvailability}
                        onChange={(e) => setFormData({ ...formData, onCallAvailability: e.target.checked })}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Wizard Footer Controls */}
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep > 1) {
                      setCurrentStep((prev) => (prev - 1) as any);
                    } else {
                      setShowWizardModal(false);
                    }
                  }}
                  className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
                >
                  {currentStep === 1 ? 'Cancel' : 'Previous'}
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep === 1 && !formData.name.trim()) {
                        setSuccessToast('Please enter doctor name before proceeding.');
                        setTimeout(() => setSuccessToast(null), 3000);
                        return;
                      }
                      setCurrentStep((prev) => (prev + 1) as any);
                    }}
                    className="inline-flex items-center gap-1 rounded bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs transition"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs transition"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Save Practitioner</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
