'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { BranchLocation } from '@/lib/ph-constants';
import { Search, UserPlus, FileText, ChevronRight, User, ShieldCheck } from 'lucide-react';

interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  philhealth: string;
  seniorId?: string;
  pwdId?: string;
  branchRegistered: string;
  lastVisit: string;
  primaryCondition: string;
}

interface PatientDirectoryViewProps {
  currentBranch: BranchLocation;
  onOpenPatientChart: (patientId: string) => void;
  onNewAdmission: () => void;
}

export function PatientDirectoryView({
  currentBranch,
  onOpenPatientChart,
  onNewAdmission,
}: PatientDirectoryViewProps) {
  const [query, setQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<'ALL' | 'CURRENT'>('ALL');

  const patients: PatientRecord[] = [
    {
      id: 'pat-101',
      name: 'Juan Dela Cruz',
      age: 67,
      gender: 'Male',
      dob: '1959-04-12',
      philhealth: '12-345678901-2',
      seniorId: 'OSCA-MKT-2021-9982',
      branchRegistered: 'Dr. Florence Espinosa Ob-Gyn Clinic',
      lastVisit: 'Today (Oct 04, 2026)',
      primaryCondition: 'Prenatal Routine Care / Gravida 2 Para 1',
    },
    {
      id: 'pat-102',
      name: 'Maria Angelica Santos',
      age: 34,
      gender: 'Female',
      dob: '1992-08-25',
      philhealth: '09-876543210-9',
      branchRegistered: 'Dr. Florence Espinosa Ob-Gyn Clinic',
      lastVisit: 'Aug 12, 2026',
      primaryCondition: 'Antenatal Routine Checkup (28 wks)',
    },
    {
      id: 'pat-103',
      name: 'Benjamin Alcantara',
      age: 72,
      gender: 'Male',
      dob: '1954-11-03',
      philhealth: '01-234567890-1',
      seniorId: 'OSCA-OLG-2018-4421',
      branchRegistered: 'Ulticare Medical Center',
      lastVisit: 'Sep 19, 2026',
      primaryCondition: 'Essential Hypertension routine review',
    },
    {
      id: 'pat-104',
      name: 'Kristine Joy Bernardo',
      age: 28,
      gender: 'Female',
      dob: '1998-02-14',
      philhealth: '15-987654321-0',
      pwdId: 'PWD-SBF-2023-1102',
      branchRegistered: 'Allied Care Experts (ACE) Medical Center - Baypointe',
      lastVisit: 'Today (Oct 04, 2026)',
      primaryCondition: 'High-Risk Pregnancy / Gestational Diabetes',
    },
    {
      id: 'pat-105',
      name: 'Clarisse Valenzuela',
      age: 31,
      gender: 'Female',
      dob: '1995-06-30',
      philhealth: '18-123498765-4',
      branchRegistered: 'Dr. Florence Espinosa Ob-Gyn Clinic',
      lastVisit: 'Jul 28, 2026',
      primaryCondition: 'Cervical Cancer Screening (Pap Smear)',
    },
  ];

  const filteredPatients = patients.filter((p) => {
    if (selectedBranchFilter === 'CURRENT' && p.branchRegistered !== currentBranch.name) {
      return false;
    }
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.philhealth.includes(q) ||
      (p.seniorId && p.seniorId.toLowerCase().includes(q)) ||
      (p.pwdId && p.pwdId.toLowerCase().includes(q)) ||
      p.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-2.5">
      {/* Top Header & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-cyan-700" />
            Master Patient Index (MPI)
          </h2>
          <p className="text-[11px] text-slate-500">
            Centralized Patient Registry &middot; East Tapinac, Barretto, and Subic Bay Freeport
          </p>
        </div>

        <button
          type="button"
          onClick={onNewAdmission}
          className="flex items-center gap-1 rounded bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 transition"
        >
          <UserPlus className="h-3 w-3" />
          <span>New Patient Registration</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2 h-3 w-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, PIN, Senior ID, PWD ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded border border-slate-200 bg-white pl-7 pr-2.5 py-1 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 h-7"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded dark:bg-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setSelectedBranchFilter('ALL')}
              className={`px-2.5 py-0.5 font-medium rounded text-xs transition ${
                selectedBranchFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Clinics ({patients.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedBranchFilter('CURRENT')}
              className={`px-2.5 py-0.5 font-medium rounded text-xs transition ${
                selectedBranchFilter === 'CURRENT'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              This Branch ({patients.filter((p) => p.branchRegistered === currentBranch.name).length})
            </button>
          </div>
        </div>
      </div>

      {/* Patient Registry Table */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:border-slate-700">
            <tr>
              <th className="px-3 py-1.5">Patient Record</th>
              <th className="px-3 py-1.5">DOB / Age</th>
              <th className="px-3 py-1.5">PhilHealth / Statutory ID</th>
              <th className="px-3 py-1.5">Registered Facility</th>
              <th className="px-3 py-1.5">Last Visit</th>
              <th className="px-3 py-1.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
            {filteredPatients.map((p) => (
              <tr
                key={p.id}
                onClick={() => onOpenPatientChart(p.id)}
                className="hover:bg-slate-50 cursor-pointer dark:hover:bg-slate-800/50 transition"
              >
                <td className="px-3 py-1.5">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {p.name}
                    {p.seniorId && (
                      <span className="rounded bg-amber-50 px-1 py-0.2 text-[9px] font-bold text-amber-700 border border-amber-200">
                        Senior (RA 9994)
                      </span>
                    )}
                    {p.pwdId && (
                      <span className="rounded bg-purple-50 px-1 py-0.2 text-[9px] font-bold text-purple-700 border border-purple-200">
                        PWD (RA 10754)
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500">{p.primaryCondition}</div>
                </td>
                <td className="px-3 py-1.5">
                  <div className="text-slate-800 dark:text-slate-200">{p.dob}</div>
                  <div className="text-[10px] text-slate-400">{p.age} yrs &middot; {p.gender}</div>
                </td>
                <td className="px-3 py-1.5 font-mono text-[10px]">
                  <div>PIN: <span className="font-medium text-slate-800 dark:text-slate-200">{p.philhealth}</span></div>
                  {p.seniorId && <div className="text-[9px] text-slate-500">SC: {p.seniorId}</div>}
                  {p.pwdId && <div className="text-[9px] text-slate-500">PWD: {p.pwdId}</div>}
                </td>
                <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400 text-xs">
                  {p.branchRegistered}
                </td>
                <td className="px-3 py-1.5 text-slate-600 dark:text-slate-400 text-xs">
                  {p.lastVisit}
                </td>
                <td className="px-3 py-1.5 text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPatientChart(p.id);
                    }}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-cyan-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-cyan-300 shadow-2xs"
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
    </div>
  );
}
