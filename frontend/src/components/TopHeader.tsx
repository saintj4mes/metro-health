'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { Search, Building2, ChevronDown, Bell, UserPlus, Database, Lock, Menu } from 'lucide-react';
import { CLINIC_BRANCHES, BranchLocation } from '@/lib/ph-constants';
import { StaffUser, canUserAccessBranch } from '@/lib/user-management-store';

interface TopHeaderProps {
  currentBranch: BranchLocation;
  onBranchChange: (branch: BranchLocation) => void;
  onOpenSearch: () => void;
  onNewAdmission: () => void;
  currentUser: StaffUser;
  onOpenMobileMenu?: () => void;
}

export function TopHeader({
  currentBranch,
  onBranchChange,
  onOpenSearch,
  onNewAdmission,
  currentUser,
  onOpenMobileMenu,
}: TopHeaderProps) {
  const [branchOpen, setBranchOpen] = useState(false);

  // Filter branches strictly permitted to the current logged-in staff user
  const allowedBranches = CLINIC_BRANCHES.filter((b) =>
    currentUser ? canUserAccessBranch(currentUser, b.id) : true
  );

  const canSwitchBranches = allowedBranches.length > 1;

  return (
    <header className="sticky top-0 z-40 flex h-13 w-full items-center justify-between border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
      {/* Left: Mobile Menu & Quick Search trigger button */}
      <div className="flex items-center gap-2 flex-1 max-w-sm">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition min-h-[44px] min-w-[44px]"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-slate-800 transition min-h-[44px]"
        >
          <div className="flex items-center gap-1.5">
            <Search className="h-3 w-3 text-slate-400" />
            <span className="text-xs">Search patient by name, PIN, or ID...</span>
          </div>
          <kbd className="hidden sm:inline-block rounded border border-slate-200 bg-white px-1 text-[9px] font-semibold text-slate-400 shadow-2xs dark:border-slate-700 dark:bg-slate-900">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Branch Switcher & Quick Actions */}
      <div className="flex items-center gap-2">
        {/* Branch Selector Dropdown or Locked Pill */}
        {canSwitchBranches ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setBranchOpen(!branchOpen)}
              className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs transition"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              <span>{currentBranch.name}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {branchOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setBranchOpen(false)} />
                <div className="absolute right-0 z-50 mt-1.5 w-72 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Workspace ({allowedBranches.length} Permitted)
                  </div>
                  {allowedBranches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        onBranchChange(b);
                        setBranchOpen(false);
                      }}
                      className={`flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left text-xs transition ${
                        b.id === currentBranch.id
                          ? 'bg-slate-100 font-bold text-slate-900 dark:bg-slate-700 dark:text-white'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <Building2 className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
                      <div>
                        <div className="font-semibold">{b.name}</div>
                        <div className="text-[11px] text-slate-400">{b.address.city}, {b.address.province}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Locked Branch Pill for single-branch staff */
          <div
            className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-2xs"
            title="Your role is assigned exclusively to this clinic facility"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span>{currentBranch.name}</span>
            <Lock className="h-3 w-3 text-slate-400" />
          </div>
        )}

        {/* Backend Connectivity Status Pill */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Database className="h-3 w-3 text-cyan-600" />
          <span>Medplum FHIR R4: Online</span>
        </div>

        {/* Quick Action: New Admission */}
        <button
          type="button"
          onClick={onNewAdmission}
          className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>New Admission</span>
        </button>
      </div>
    </header>
  );
}
