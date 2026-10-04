'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { CLINIC_BRANCHES, BranchLocation } from '@/lib/ph-constants';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  ChevronDown,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface ClinicBranchesViewProps {
  currentBranch: BranchLocation;
  onSelectBranch: (branch: BranchLocation) => void;
}

export function ClinicBranchesView({ currentBranch, onSelectBranch }: ClinicBranchesViewProps) {
  const [viewBy, setViewBy] = useState<'Clinic' | 'Doctor' | 'Day'>('Clinic');

  return (
    <div className="space-y-2.5 w-full">
      {/* 1. Header Toolbar */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        <div>
          <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            Clinic Branches & Operating Schedules
          </h1>
          <p className="text-[11px] text-slate-500">
            Multi-branch facility network &middot; Active workspace: <strong className="text-slate-700 dark:text-slate-300">{currentBranch.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">View by:</label>
          <div className="relative">
            <select
              value={viewBy}
              onChange={(e) => setViewBy(e.target.value as any)}
              className="appearance-none rounded border border-slate-300 bg-white pl-2.5 pr-7 py-1 text-xs font-semibold text-slate-800 shadow-2xs focus:border-blue-600 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="Clinic">Clinic</option>
              <option value="Doctor">Doctor</option>
              <option value="Day">Day</option>
            </select>
            <ChevronDown className="absolute right-2 top-2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 2. Clinic Schedule Cards - Full Width Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {CLINIC_BRANCHES.map((b) => {
          const isActive = b.id === currentBranch.id;

          return (
            <div
              key={b.id}
              className={`rounded-lg border bg-white dark:bg-slate-900 transition shadow-2xs overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex flex-col justify-between gap-2 bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {b.name}
                    </h2>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-1.5 py-0.2 text-[10px] font-bold text-blue-800 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectBranch(b)}
                        className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs transition"
                      >
                        <span>Switch</span>
                      </button>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 leading-snug">
                    {b.address.line}, {b.address.city}, {b.address.province}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Tel: {b.phone}
                  </div>
                </div>

                {/* Schedules Table / Rows */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {b.schedules && b.schedules.length > 0 ? (
                    b.schedules.map((sched, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                            {sched.day}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {sched.hours}
                          </div>
                        </div>

                        <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900">
                          {sched.type}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-xs text-slate-500">
                      No schedule configured
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
