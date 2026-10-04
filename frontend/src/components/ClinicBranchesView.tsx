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
  ShieldCheck,
  Users,
  Activity,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">
              Clinic Branches & Operating Schedules
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Multi-Branch Facility Network &bull; Active Context: <strong className="text-slate-800">{currentBranch.name}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium">Filter View:</label>
          <select
            value={viewBy}
            onChange={(e) => setViewBy(e.target.value as any)}
            className="rounded border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs focus:border-cyan-700 focus:outline-hidden"
          >
            <option value="Clinic">Group by Clinic</option>
            <option value="Doctor">Group by Attending Clinician</option>
            <option value="Day">Group by Operating Day</option>
          </select>
        </div>
      </div>

      {/* Facility Network KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="rounded border border-slate-200 bg-white p-2.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
            <span>Branch Facilities</span>
            <Building2 className="h-3.5 w-3.5 text-cyan-700" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">4</span>
            <span className="text-[10px] text-slate-400">active sites</span>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-2.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
            <span>Consultation Bays</span>
            <Activity className="h-3.5 w-3.5 text-teal-700" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">12</span>
            <span className="text-[10px] text-teal-700 font-medium">operational</span>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-2.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
            <span>PhilHealth Konsulta</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-emerald-800">100%</span>
            <span className="text-[10px] text-emerald-700 font-medium">accredited</span>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-2.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
            <span>Medplum FHIR CDR</span>
            <Clock className="h-3.5 w-3.5 text-purple-700" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">Online</span>
            <span className="text-[10px] text-purple-700 font-medium">real-time sync</span>
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
              className={`rounded border bg-white transition shadow-2xs overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'border-cyan-700 ring-2 ring-cyan-100'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Card Header */}
                <div className="p-3 border-b border-slate-100 flex flex-col justify-between gap-1.5 bg-slate-50/70">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                      {b.name}
                    </h2>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 rounded bg-cyan-50 px-2 py-0.5 text-[10px] font-bold text-cyan-800 border border-cyan-200">
                        <CheckCircle2 className="h-3 w-3" />
                        Current Workspace
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectBranch(b)}
                        className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                      >
                        <span>Switch Facility</span>
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
                <div className="divide-y divide-slate-100">
                  {b.schedules && b.schedules.length > 0 ? (
                    b.schedules.map((sched, idx) => (
                      <div
                        key={idx}
                        className="px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-800 text-xs">
                            {sched.day}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {sched.hours}
                          </div>
                        </div>

                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200">
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
