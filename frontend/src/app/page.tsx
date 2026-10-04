'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState, useEffect } from 'react';
import { CLINIC_BRANCHES, BranchLocation } from '@/lib/ph-constants';
import {
  StaffUser,
  INITIAL_STAFF_USERS,
  canUserAccessBranch,
} from '@/lib/user-management-store';
import { Sidebar, NavItem } from '@/components/Sidebar';
import { TopHeader } from '@/components/TopHeader';
import { CommandSearchModal } from '@/components/CommandSearchModal';
import { UnifiedClinicalWorkbench, WorkbenchTab } from '@/components/UnifiedClinicalWorkbench';
import { QueueView } from '@/components/QueueView';
import { PatientChart } from '@/components/PatientChart';
import { PatientDirectoryView } from '@/components/PatientDirectoryView';
import { ReceptionView } from '@/components/ReceptionView';
import { NurseView } from '@/components/NurseView';
import { DoctorView } from '@/components/DoctorView';
import { BillingView } from '@/components/BillingView';
import { ClinicBranchesView } from '@/components/ClinicBranchesView';
import { UserManagementView } from '@/components/UserManagementView';
import { AppointmentCalendarMatrix } from '@/components/AppointmentCalendarMatrix';
import { AuditTrailView } from '@/components/AuditTrailView';
import { ShieldCheck } from 'lucide-react';

export default function ClinicalWorkbenchPage() {
  const [currentBranch, setCurrentBranch] = useState<BranchLocation>(CLINIC_BRANCHES[0]);
  const [currentNav, setCurrentNav] = useState<NavItem>('chart');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);

  // Staff User Management & Active Persona
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(INITIAL_STAFF_USERS);
  const [currentUser, setCurrentUser] = useState<StaffUser>(INITIAL_STAFF_USERS[0]); // Default: Dr. Florence Espinosa (Main Doctor)

  // Active Patient Chart Selection
  const [selectedPatientId, setSelectedPatientId] = useState<string>('pat-105');
  const [patientChartTab, setPatientChartTab] = useState<'soap' | 'vitals' | 'rx' | 'history' | 'billing'>('soap');

  // Global ⌘K Keyboard Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenPatientChart = (
    patientId: string,
    initialTab: 'soap' | 'vitals' | 'rx' | 'history' | 'billing' = 'soap'
  ) => {
    setSelectedPatientId(patientId);
    setPatientChartTab(initialTab);
    setCurrentNav('chart');
  };

  // Staff Persona Switcher Handler
  const handleSwitchUser = (user: StaffUser) => {
    setCurrentUser(user);

    // If the newly active user cannot access the currently selected branch,
    // automatically redirect them to their first permitted branch!
    if (!canUserAccessBranch(user, currentBranch.id)) {
      const allowed = CLINIC_BRANCHES.filter((b) => canUserAccessBranch(user, b.id));
      if (allowed.length > 0) {
        setCurrentBranch(allowed[0]);
      }
    }

    // If non-director was viewing user management or audit logs, redirect to queue
    if (user.role !== 'MAIN_DOCTOR' && (currentNav === 'users' || currentNav === 'audit')) {
      setCurrentNav('queue');
    }
  };

  // Primary 4-Column Canvas Medical Clinical EHR Workspace
  if (currentNav === 'chart') {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-white font-sans text-slate-900 antialiased">
        <UnifiedClinicalWorkbench
          currentBranch={currentBranch}
          currentUser={currentUser}
          initialPatientId={selectedPatientId}
          initialTab="Tasks"
          onNavigateToView={(view) => setCurrentNav(view as NavItem)}
          onOpenSearch={() => setSearchOpen(true)}
        />

        {/* Global ⌘K Patient Search Omnibox */}
        <CommandSearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          onSelectPatient={(patient) => {
            setSearchOpen(false);
            handleOpenPatientChart(patient.id, 'soap');
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
      {/* 1. Left Clinical Navigation Sidebar */}
      <Sidebar
        currentNav={currentNav}
        onNavigate={(item) => setCurrentNav(item)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentBranch={currentBranch}
        currentUser={currentUser}
        staffList={staffUsers}
        onSwitchUser={handleSwitchUser}
      />

      {/* 2. Main Workbench Shell */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Operational Header */}
        <TopHeader
          currentBranch={currentBranch}
          onBranchChange={setCurrentBranch}
          onOpenSearch={() => setSearchOpen(true)}
          onNewAdmission={() => setCurrentNav('admit')}
          currentUser={currentUser}
        />

        {/* Scrollable Clinical Work Area */}
        <main className="flex-1 overflow-y-auto p-2.5 sm:p-3 lg:p-3.5 w-full">
          <div className="w-full">
            {/* View 1: Today's Patient Queue (Kanban Board) */}
            {currentNav === 'queue' && (
              <QueueView
                branch={currentBranch}
                onOpenPatientChart={handleOpenPatientChart}
                onNewAdmission={() => setCurrentNav('admit')}
              />
            )}

            {/* View 3: Master Patient Index (MPI) Directory */}
            {currentNav === 'patients' && (
              <PatientDirectoryView
                currentBranch={currentBranch}
                onOpenPatientChart={(id) => handleOpenPatientChart(id, 'soap')}
                onNewAdmission={() => setCurrentNav('admit')}
              />
            )}

            {/* View 4: Front Desk Admission */}
            {currentNav === 'admit' && (
              <ReceptionView branch={currentBranch} />
            )}

            {/* View 5: Nurse Triage Unit */}
            {currentNav === 'triage' && (
              <NurseView branch={currentBranch} />
            )}

            {/* View 6: Doctor Consultation */}
            {currentNav === 'consult' && (
              <DoctorView branch={currentBranch} />
            )}

            {/* View 7: Cashier Checkout & Billing */}
            {currentNav === 'billing' && (
              <BillingView branch={currentBranch} />
            )}

            {/* View 8: Clinic Branches Directory */}
            {currentNav === 'branches' && (
              <ClinicBranchesView
                currentBranch={currentBranch}
                onSelectBranch={(branch) => {
                  if (canUserAccessBranch(currentUser, branch.id)) {
                    setCurrentBranch(branch);
                  }
                }}
              />
            )}

            {/* View 9: Dedicated User Management (Main Doctor Exclusive) */}
            {currentNav === 'users' && currentUser.role === 'MAIN_DOCTOR' && (
              <UserManagementView
                currentUser={currentUser}
                onStaffListChange={setStaffUsers}
              />
            )}

            {/* View 10: PhilHealth eClaims Center */}
            {currentNav === 'claims' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-cyan-800" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      PhilHealth eClaims Transmittals ({currentBranch.name})
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    Konsulta API Connected
                  </span>
                </div>

                <div className="rounded border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:border-slate-700">
                      <tr>
                        <th className="px-3 py-2">Transmittal #</th>
                        <th className="px-3 py-2">Patient / PIN</th>
                        <th className="px-3 py-2">Encounter Date</th>
                        <th className="px-3 py-2">Package Type</th>
                        <th className="px-3 py-2">Claim Amount</th>
                        <th className="px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
                      {[
                        { series: 'TR-2026-00412', name: 'Juan Dela Cruz', pin: '12-345678901-2', date: 'Today, 09:15 AM', pkg: 'Konsulta Comprehensive First Visit', amount: '₱ 1,750.00', status: 'Submitted / For Verification', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
                        { series: 'TR-2026-00398', name: 'Benjamin Alcantara', pin: '01-234567890-1', date: 'Sep 19, 2026', pkg: 'Diabetes Follow-up & Lab Package', amount: '₱ 2,200.00', status: 'Approved for Reimbursement', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
                        { series: 'TR-2026-00350', name: 'Maria Angelica Santos', pin: '09-876543210-9', date: 'Aug 12, 2026', pkg: 'Antenatal Consultation Package', amount: '₱ 1,500.00', status: 'Paid & Disbursed', badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
                      ].map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-3 py-2 font-mono font-semibold text-slate-900 dark:text-white">{c.series}</td>
                          <td className="px-3 py-2">
                            <span className="font-semibold text-slate-900 dark:text-white">{c.name}</span>
                            <span className="ml-2 text-[10px] text-slate-400 font-mono">PIN: {c.pin}</span>
                          </td>
                          <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{c.date}</td>
                          <td className="px-3 py-2 text-slate-700 dark:text-slate-300 font-medium">{c.pkg}</td>
                          <td className="px-3 py-2 font-mono font-bold text-slate-900 dark:text-white">{c.amount}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${c.badge}`}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* View 11: Outpatient Appointment Book & Calendar Matrix */}
            {currentNav === 'schedule' && (
              <AppointmentCalendarMatrix
                branch={currentBranch}
                onOpenPatientChart={(id) => handleOpenPatientChart(id, 'soap')}
                onCheckInToQueue={(patient) => {
                  setCurrentNav('queue');
                }}
              />
            )}

            {/* View 12: Clinic Network Activity & Audit Trail (Main Doctor / Admin) */}
            {currentNav === 'audit' && currentUser.role === 'MAIN_DOCTOR' && (
              <AuditTrailView currentBranch={currentBranch} />
            )}
          </div>
        </main>
      </div>

      {/* 3. Global ⌘K Patient Search Omnibox */}
      <CommandSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectPatient={(patient) => {
          setSearchOpen(false);
          handleOpenPatientChart(patient.id, 'soap');
        }}
      />
    </div>
  );
}
