'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState, useEffect } from 'react';
import { BranchLocation } from '@/lib/ph-constants';
import {
  QueueStage,
  QueuePatientItem,
  INITIAL_BRANCH_QUEUES,
} from '@/lib/branch-workspace-store';
import {
  ClipboardList,
  Columns,
  List,
  ArrowRight,
  Clock,
  User,
  CheckCircle2,
  Stethoscope,
  Activity,
  Receipt,
  UserPlus,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface QueueViewProps {
  branch: BranchLocation;
  onOpenPatientChart: (patientId: string, initialTab?: 'soap' | 'vitals' | 'rx' | 'history' | 'billing') => void;
  onNewAdmission?: () => void;
}

interface ColumnConfig {
  id: QueueStage;
  title: string;
  badgeColor: string;
  headerBorder: string;
  icon: React.ElementType;
}

const KANBAN_COLUMNS: ColumnConfig[] = [
  {
    id: 'CHECKIN',
    title: '1. Arrived / Front Desk',
    badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    headerBorder: 'border-t-slate-500',
    icon: UserPlus,
  },
  {
    id: 'TRIAGE',
    title: '2. Nurse Triage',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    headerBorder: 'border-t-blue-600',
    icon: Activity,
  },
  {
    id: 'CONSULT',
    title: '3. Doctor Consultation',
    badgeColor: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
    headerBorder: 'border-t-cyan-700',
    icon: Stethoscope,
  },
  {
    id: 'BILLING',
    title: '4. Cashier & Billing',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    headerBorder: 'border-t-purple-600',
    icon: Receipt,
  },
  {
    id: 'DISCHARGED',
    title: '5. Discharged',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    headerBorder: 'border-t-emerald-600',
    icon: CheckCircle2,
  },
];

export function QueueView({ branch, onOpenPatientChart, onNewAdmission }: QueueViewProps) {
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [branchQueues, setBranchQueues] = useState<Record<string, QueuePatientItem[]>>(INITIAL_BRANCH_QUEUES);

  // Active queue items for this specific branch only
  const currentQueue = branchQueues[branch.id] || [];

  // Function to advance a patient to the next stage in this branch's queue
  const handleAdvanceStage = (patientId: string, nextStage: QueueStage) => {
    setBranchQueues((prev) => {
      const items = prev[branch.id] || [];
      const updated = items.map((p) => {
        if (p.id !== patientId) return p;

        let targetTab: QueuePatientItem['targetTab'] = 'soap';
        if (nextStage === 'TRIAGE') targetTab = 'vitals';
        if (nextStage === 'CONSULT') targetTab = 'soap';
        if (nextStage === 'BILLING') targetTab = 'billing';
        if (nextStage === 'DISCHARGED') targetTab = 'history';

        return {
          ...p,
          stage: nextStage,
          targetTab,
          waitMinutes: nextStage === 'DISCHARGED' ? 'Completed' : 'Just now',
        };
      });

      return {
        ...prev,
        [branch.id]: updated,
      };
    });
  };

  return (
    <div className="space-y-2.5">
      {/* 1. Header Toolbar with Branch Context & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-cyan-800" />
              Today's Patient Queue
            </h2>
            <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {branch.code}
            </span>
            <span className="text-xs text-slate-500">
              ({currentQueue.length} Active Patients)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded dark:bg-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('KANBAN')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition ${
                viewMode === 'KANBAN'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <Columns className="h-3 w-3" />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition ${
                viewMode === 'TABLE'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              <List className="h-3 w-3" />
              <span>Table</span>
            </button>
          </div>

          {onNewAdmission && (
            <button
              type="button"
              onClick={onNewAdmission}
              className="flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition"
            >
              <Plus className="h-3 w-3" />
              <span>Check-In Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Primary Kanban Board View */}
      {viewMode === 'KANBAN' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 items-start overflow-x-auto pb-2">
          {KANBAN_COLUMNS.map((col) => {
            const colPatients = currentQueue.filter((p) => p.stage === col.id);
            const Icon = col.icon;

            return (
              <div
                key={col.id}
                className={`flex flex-col rounded border border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 shadow-2xs border-t-2 ${col.headerBorder} min-h-[480px]`}
              >
                {/* Column Header */}
                <div className="p-2 border-b border-slate-200 bg-white/80 dark:bg-slate-800/60 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-slate-500" />
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">
                      {col.title}
                    </span>
                  </div>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${col.badgeColor}`}>
                    {colPatients.length}
                  </span>
                </div>

                {/* Patient Cards List */}
                <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto max-h-[720px]">
                  {colPatients.length === 0 ? (
                    <div className="py-6 text-center text-[10px] text-slate-400 italic">
                      No patients
                    </div>
                  ) : (
                    colPatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => onOpenPatientChart(patient.id, patient.targetTab)}
                        className="group relative rounded border border-slate-200 bg-white p-2.5 shadow-2xs hover:border-cyan-800 hover:shadow-xs transition cursor-pointer dark:border-slate-800 dark:bg-slate-900"
                      >
                        {/* Top: Name & Priority Tag */}
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <div className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-cyan-800 transition">
                              {patient.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {patient.gender}, {patient.age}y &middot; {patient.dob}
                            </div>
                          </div>

                          {patient.senior && (
                            <span className="rounded bg-amber-50 px-1 py-0.2 text-[9px] font-bold text-amber-700 border border-amber-200 shrink-0">
                              SC RA 9994
                            </span>
                          )}
                          {patient.pwd && (
                            <span className="rounded bg-purple-50 px-1 py-0.2 text-[9px] font-bold text-purple-700 border border-purple-200 shrink-0">
                              PWD RA 10754
                            </span>
                          )}
                        </div>

                        {/* Complaint / Note */}
                        <p className="mt-1.5 text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                          {patient.chiefComplaint}
                        </p>

                        {/* Metadata: Wait time & Doctor */}
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {patient.time} ({patient.waitMinutes})
                          </span>
                          <span className="truncate max-w-[100px] text-right font-medium text-slate-700 dark:text-slate-300">
                            {patient.doctor.split(',')[0]}
                          </span>
                        </div>

                        {/* Stage Progression Action Buttons */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPatientChart(patient.id, patient.targetTab);
                            }}
                            className="text-[10px] font-semibold text-cyan-800 hover:underline dark:text-cyan-400"
                          >
                            Chart &rarr;
                          </button>

                          {/* Quick Stage Progression */}
                          {patient.stage === 'CHECKIN' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdvanceStage(patient.id, 'TRIAGE');
                              }}
                              className="rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 transition"
                            >
                              Triage &rarr;
                            </button>
                          )}
                          {patient.stage === 'TRIAGE' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdvanceStage(patient.id, 'CONSULT');
                              }}
                              className="rounded bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300 border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 transition"
                            >
                              Consult &rarr;
                            </button>
                          )}
                          {patient.stage === 'CONSULT' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdvanceStage(patient.id, 'BILLING');
                              }}
                              className="rounded bg-slate-100 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300 border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 transition"
                            >
                              Billing &rarr;
                            </button>
                          )}
                          {patient.stage === 'BILLING' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdvanceStage(patient.id, 'DISCHARGED');
                              }}
                              className="rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 transition"
                            >
                              Discharge &check;
                            </button>
                          )}
                          {patient.stage === 'DISCHARGED' && (
                            <span className="text-[10px] font-semibold text-emerald-700">
                              Cleared
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Secondary Dense Table View */}
      {viewMode === 'TABLE' && (
        <div className="rounded border border-slate-200 bg-white shadow-2xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800/80 dark:border-slate-700">
              <tr>
                <th className="px-3 py-1.5">Patient Record</th>
                <th className="px-3 py-1.5">Arrived Time</th>
                <th className="px-3 py-1.5">Clinical Station</th>
                <th className="px-3 py-1.5">Attending Clinician</th>
                <th className="px-3 py-1.5">Chief Complaint</th>
                <th className="px-3 py-1.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {currentQueue.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onOpenPatientChart(p.id, p.targetTab)}
                  className="hover:bg-slate-50 cursor-pointer dark:hover:bg-slate-800/40 transition"
                >
                  <td className="px-3 py-1.5">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {p.name}
                      {p.senior && (
                        <span className="rounded bg-amber-50 px-1 py-0.2 text-[10px] font-bold text-amber-700 border border-amber-200">
                          SC
                        </span>
                      )}
                      {p.pwd && (
                        <span className="rounded bg-slate-100 px-1 py-0.2 text-[10px] font-bold text-slate-700 border border-slate-200">
                          PWD
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {p.gender}, {p.age}y &middot; {p.id}
                    </div>
                  </td>
                  <td className="px-3 py-1.5 font-mono text-slate-700 dark:text-slate-300">
                    <div>{p.time}</div>
                    <div className="text-[10px] text-slate-400 font-sans">Wait: {p.waitMinutes}</div>
                  </td>
                  <td className="px-3 py-1.5">
                    <span className="inline-block rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                      {p.stage}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-slate-700 dark:text-slate-300">
                    {p.doctor}
                  </td>
                  <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {p.chiefComplaint}
                  </td>
                  <td className="px-3 py-1.5 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPatientChart(p.id, p.targetTab);
                      }}
                      className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                    >
                      <span>Chart</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
