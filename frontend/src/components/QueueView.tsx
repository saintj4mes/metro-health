'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
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
  Clock,
  CheckCircle2,
  Stethoscope,
  Activity,
  Receipt,
  UserPlus,
  ChevronRight,
  Plus,
  ShieldCheck,
  AlertCircle,
  BellRing,
  ArrowRight,
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
    badgeColor: 'bg-blue-100 text-blue-800 border border-blue-200',
    headerBorder: 'border-t-blue-600',
    icon: UserPlus,
  },
  {
    id: 'TRIAGE',
    title: '2. Nurse Triage',
    badgeColor: 'bg-teal-100 text-teal-800 border border-teal-200',
    headerBorder: 'border-t-teal-600',
    icon: Activity,
  },
  {
    id: 'CONSULT',
    title: '3. Doctor Consultation',
    badgeColor: 'bg-cyan-100 text-cyan-800 border border-cyan-200',
    headerBorder: 'border-t-cyan-700',
    icon: Stethoscope,
  },
  {
    id: 'BILLING',
    title: '4. Cashier & Billing',
    badgeColor: 'bg-purple-100 text-purple-800 border border-purple-200',
    headerBorder: 'border-t-purple-600',
    icon: Receipt,
  },
  {
    id: 'DISCHARGED',
    title: '5. Discharged',
    badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    headerBorder: 'border-t-emerald-600',
    icon: CheckCircle2,
  },
];

export function QueueView({ branch, onOpenPatientChart, onNewAdmission }: QueueViewProps) {
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [branchQueues, setBranchQueues] = useState<Record<string, QueuePatientItem[]>>(INITIAL_BRANCH_QUEUES);
  const [filterDoc, setFilterDoc] = useState<string>('ALL');
  const [mobileStageFilter, setMobileStageFilter] = useState<QueueStage | 'ALL'>('ALL');

  // Active queue items for this specific branch only
  const currentQueue = branchQueues[branch.id] || [];

  // Filtered by doctor if applicable
  const displayedQueue = filterDoc === 'ALL'
    ? currentQueue
    : currentQueue.filter((p) => p.doctor.toLowerCase().includes(filterDoc.toLowerCase()));

  // Queue KPI summaries
  const totalInQueue = currentQueue.filter((p) => p.stage !== 'DISCHARGED').length;
  const inTriage = currentQueue.filter((p) => p.stage === 'TRIAGE').length;
  const inConsult = currentQueue.filter((p) => p.stage === 'CONSULT').length;
  const inBilling = currentQueue.filter((p) => p.stage === 'BILLING').length;
  const dischargedToday = currentQueue.filter((p) => p.stage === 'DISCHARGED').length;
  const priorityCount = currentQueue.filter((p) => p.senior || p.pwd).length;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded border border-slate-200 bg-white px-3 py-2 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 leading-none">
                Today's Patient Queue
              </h2>
              <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.2 text-[10px] font-bold font-mono text-slate-700">
                {branch.code}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              {branch.name} &bull; {currentQueue.length} Registered Encounters Today
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Doctor Quick Filter */}
          <select
            value={filterDoc}
            onChange={(e) => setFilterDoc(e.target.value)}
            className="h-7 rounded border border-slate-200 bg-slate-50 px-2 text-xs text-slate-700 focus:border-cyan-700 focus:outline-hidden"
          >
            <option value="ALL">All Attending Clinicians</option>
            <option value="Espinosa">Dr. Florence Espinosa</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 p-0.5 rounded text-xs">
            <button
              type="button"
              onClick={() => setViewMode('KANBAN')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold transition ${
                viewMode === 'KANBAN'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Columns className="h-3 w-3" />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold transition ${
                viewMode === 'TABLE'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
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
              className="flex items-center gap-1 rounded bg-cyan-700 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-cyan-800 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Check-In Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Clinical Queue KPI Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="rounded border border-slate-200 bg-white p-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
            <span>In Clinic Queue</span>
            <ClipboardList className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">{totalInQueue}</span>
            <span className="text-[10px] text-slate-400">waiting</span>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
            <span>Triage Station</span>
            <Activity className="h-3.5 w-3.5 text-teal-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">{inTriage}</span>
            <span className="text-[10px] text-teal-700 font-medium">for vitals</span>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
            <span>Consultation</span>
            <Stethoscope className="h-3.5 w-3.5 text-cyan-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">{inConsult}</span>
            <span className="text-[10px] text-cyan-700 font-medium">with MD</span>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
            <span>Cashier / Billing</span>
            <Receipt className="h-3.5 w-3.5 text-purple-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">{inBilling}</span>
            <span className="text-[10px] text-purple-700 font-medium">to pay/settle</span>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
            <span>Discharged Today</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">{dischargedToday}</span>
            <span className="text-[10px] text-emerald-700 font-medium">completed</span>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-2 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[10px] font-semibold uppercase tracking-wider">
            <span>Statutory Priority</span>
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-slate-900">{priorityCount}</span>
            <span className="text-[10px] text-amber-700 font-medium">SC / PWD</span>
          </div>
        </div>
      </div>

      {/* 3. Primary Kanban Board View */}
      {viewMode === 'KANBAN' && (
        <div className="space-y-2.5">
          {/* Mobile Stage Filter Tabs (< md) */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setMobileStageFilter('ALL')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold min-h-[38px] transition ${
                mobileStageFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              All ({displayedQueue.length})
            </button>
            {KANBAN_COLUMNS.map((col) => {
              const count = displayedQueue.filter((p) => p.stage === col.id).length;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setMobileStageFilter(col.id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold min-h-[38px] transition ${
                    mobileStageFilter === col.id
                      ? 'bg-cyan-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {col.title.replace(/^\d+\.\s*/, '')} ({count})
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5 items-start overflow-x-auto pb-1">
            {KANBAN_COLUMNS.map((col) => {
              const colPatients = displayedQueue.filter((p) => p.stage === col.id);
              const Icon = col.icon;
              const isVisibleOnMobile = mobileStageFilter === 'ALL' || mobileStageFilter === col.id;

              return (
                <div
                  key={col.id}
                  className={`${
                    isVisibleOnMobile ? 'flex' : 'hidden md:flex'
                  } flex-col rounded border border-slate-200 bg-slate-50/80 shadow-2xs border-t-2 ${col.headerBorder} min-h-[190px]`}
                >
                {/* Column Header */}
                <div className="p-2 border-b border-slate-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5 text-slate-600" />
                    <span className="font-bold text-xs text-slate-800 truncate">
                      {col.title}
                    </span>
                  </div>
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${col.badgeColor}`}>
                    {colPatients.length}
                  </span>
                </div>

                {/* Patient Cards List */}
                <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto">
                  {colPatients.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-400 italic">
                      No patients in this stage
                    </div>
                  ) : (
                    colPatients.map((patient) => (
                      <div
                        key={patient.id}
                        onClick={() => onOpenPatientChart(patient.id, patient.targetTab)}
                        className="group relative rounded border border-slate-200 bg-white p-2.5 shadow-2xs hover:border-cyan-700 hover:shadow-xs transition cursor-pointer"
                      >
                        {/* Top: Name & Priority Tag */}
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-slate-900 group-hover:text-cyan-800 transition truncate">
                              {patient.name}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {patient.gender}, {patient.age}y &bull; DOB: {patient.dob}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-0.5 shrink-0">
                            {patient.senior && (
                              <span className="rounded bg-amber-50 px-1 py-0.2 text-[9px] font-bold text-amber-800 border border-amber-200">
                                SC RA 9994
                              </span>
                            )}
                            {patient.pwd && (
                              <span className="rounded bg-purple-50 px-1 py-0.2 text-[9px] font-bold text-purple-800 border border-purple-200">
                                PWD RA 10754
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Complaint / Note */}
                        <p className="mt-1 text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {patient.chiefComplaint}
                        </p>

                        {/* Metadata: Wait time & Doctor */}
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="h-3 w-3 text-slate-400" />
                            {patient.time} ({patient.waitMinutes})
                          </span>
                          <span className="truncate max-w-[110px] text-right font-medium text-slate-700">
                            {patient.doctor.split(',')[0]}
                          </span>
                        </div>

                        {/* Stage Progression Action Buttons */}
                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPatientChart(patient.id, patient.targetTab);
                            }}
                            className="text-[10px] font-semibold text-cyan-700 hover:text-cyan-900 transition flex items-center gap-0.5"
                          >
                            <span>Chart</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                          </button>

                          {/* Quick Stage Progression */}
                          {patient.stage === 'CHECKIN' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAdvanceStage(patient.id, 'TRIAGE');
                              }}
                              className="rounded bg-slate-100 hover:bg-teal-50 hover:text-teal-800 hover:border-teal-300 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 transition"
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
                              className="rounded bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 hover:border-cyan-300 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 transition"
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
                              className="rounded bg-slate-100 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700 transition"
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
                              className="rounded bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 transition"
                            >
                              Discharge ✓
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
        </div>
      )}

      {/* 4. Secondary Dense Table View */}
      {viewMode === 'TABLE' && (
        <div className="rounded border border-slate-200 bg-white shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-3 py-2">Patient Record</th>
                <th className="px-3 py-2">Arrival Time</th>
                <th className="px-3 py-2">Clinical Station</th>
                <th className="px-3 py-2">Attending Clinician</th>
                <th className="px-3 py-2">Chief Complaint</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {displayedQueue.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onOpenPatientChart(p.id, p.targetTab)}
                  className="hover:bg-slate-50 cursor-pointer transition"
                >
                  <td className="px-3 py-2">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      {p.name}
                      {p.senior && (
                        <span className="rounded bg-amber-50 px-1 py-0.2 text-[9px] font-bold text-amber-800 border border-amber-200">
                          SC
                        </span>
                      )}
                      {p.pwd && (
                        <span className="rounded bg-purple-50 px-1 py-0.2 text-[9px] font-bold text-purple-800 border border-purple-200">
                          PWD
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {p.gender}, {p.age}y &bull; ID: {p.id}
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-700">
                    <div>{p.time}</div>
                    <div className="text-[10px] text-slate-400 font-sans">Wait: {p.waitMinutes}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800 border border-slate-200">
                      {p.stage}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-700 font-medium">
                    {p.doctor}
                  </td>
                  <td className="px-3 py-2 text-slate-600 max-w-xs truncate">
                    {p.chiefComplaint}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.stage === 'CHECKIN' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdvanceStage(p.id, 'TRIAGE');
                          }}
                          className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Triage &rarr;
                        </button>
                      )}
                      {p.stage === 'TRIAGE' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdvanceStage(p.id, 'CONSULT');
                          }}
                          className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Consult &rarr;
                        </button>
                      )}
                      {p.stage === 'CONSULT' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdvanceStage(p.id, 'BILLING');
                          }}
                          className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Billing &rarr;
                        </button>
                      )}
                      {p.stage === 'BILLING' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdvanceStage(p.id, 'DISCHARGED');
                          }}
                          className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-100"
                        >
                          Discharge ✓
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPatientChart(p.id, p.targetTab);
                        }}
                        className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-cyan-800 hover:bg-slate-50 shadow-2xs"
                      >
                        <span>Chart</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Lower Queue Operations & Clinical Floor Log */}
      <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-cyan-700" />
            <span className="text-xs font-bold text-slate-900">
              Live Clinical Queue Flow & Facility Floor Status
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Synced with FHIR R4 Encounter &bull; Auto-refreshing
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded border border-slate-100 bg-slate-50 p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Active Consultation Room
            </div>
            <div className="text-xs font-bold text-slate-800">
              Room 204 &bull; Ob-Gyn Specialist Clinic
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Attending: Dr. Florence Espinosa, MD (In encounter with Maria Angelica Santos)
            </div>
          </div>

          <div className="rounded border border-slate-100 bg-slate-50 p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Triage & Vital Signs Bay
            </div>
            <div className="text-xs font-bold text-slate-800">
              Nurse Station 1 &bull; Active Intake
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Lead Nurse: Nurse Joy Reyes, RN (Recording LOINC vital signs for Kristine Joy Bernardo)
            </div>
          </div>

          <div className="rounded border border-slate-100 bg-slate-50 p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              PhilHealth Konsulta Outpatient Desk
            </div>
            <div className="text-xs font-bold text-slate-800">
              Window 2 &bull; Direct Claims Verification
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Cashier: Maria Gomez &bull; 3 PhilHealth eClaims queued for batch transmittal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
