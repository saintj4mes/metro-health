'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Building2, ChevronDown, Stethoscope, UserCheck, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { CLINIC_BRANCHES, BranchLocation } from '@/lib/ph-constants';

interface NavbarProps {
  currentBranch: BranchLocation;
  onBranchChange: (branch: BranchLocation) => void;
  activeRole: string;
  onRoleChange: (role: string) => void;
}

export function Navbar({ currentBranch, onBranchChange, activeRole, onRoleChange }: NavbarProps) {
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const roles = [
    { id: 'DOCTOR', name: 'Dr. Florence Espinosa, MD', title: 'Consulting Physician (OB-GYN)', badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    { id: 'NURSE', name: 'Nurse Joy Reyes, RN', title: 'Triage & Vitals', badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    { id: 'RECEPTION', name: 'Angela Diaz', title: 'Front Desk & Admissions', badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    { id: 'BILLING', name: 'Carlo Mendoza', title: 'Cashier & PhilHealth Claims', badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-cyan-900 text-white shadow-2xs">
            <Stethoscope className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Metro Health <span className="text-cyan-800 dark:text-cyan-400">PH</span>
              </span>
              <span className="rounded bg-cyan-50 px-1.5 py-0.2 text-[10px] font-semibold tracking-wide text-cyan-800 uppercase border border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800">
                EHR
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Philippine Clinical Operating System
            </p>
          </div>
        </div>

        {/* Center / Right: Branch Switcher & Role Selector */}
        <div className="flex items-center gap-3">
          {/* Branch Switcher Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setBranchMenuOpen(!branchMenuOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Building2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <div className="text-left">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Branch</span>
                <span className="font-semibold text-slate-900 dark:text-white">{currentBranch.name}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-1" />
            </button>

            {branchMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setBranchMenuOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 focus:outline-none dark:border-slate-700 dark:bg-slate-800">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Facility Location
                  </div>
                  {CLINIC_BRANCHES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onBranchChange(b);
                        setBranchMenuOpen(false);
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition ${
                        b.id === currentBranch.id
                          ? 'bg-teal-50 text-teal-900 font-semibold dark:bg-teal-950 dark:text-teal-200'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <Building2 className={`h-4 w-4 shrink-0 mt-0.5 ${b.id === currentBranch.id ? 'text-teal-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="font-medium">{b.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{b.address.city} &middot; {b.address.barangay}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Role Switcher (Simulates login across the 4 roles) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
                <UserCheck className="h-4 w-4" />
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Role</span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {roles.find((r) => r.id === activeRole)?.name.split(',')[0]}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setRoleMenuOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 focus:outline-none dark:border-slate-700 dark:bg-slate-800">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Simulate Clinic Role
                  </div>
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onRoleChange(r.id);
                        setRoleMenuOpen(false);
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left text-xs transition ${
                        r.id === activeRole
                          ? 'bg-sky-50 text-sky-900 font-semibold dark:bg-sky-950 dark:text-sky-200'
                          : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <ShieldCheck className={`h-4 w-4 shrink-0 mt-0.5 ${r.id === activeRole ? 'text-sky-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{r.title}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
