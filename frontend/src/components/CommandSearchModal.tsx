'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState, useEffect } from 'react';
import { Search, User, X, ArrowRight, Building2, Tag } from 'lucide-react';
import { BranchLocation } from '@/lib/ph-constants';

interface PatientSearchResult {
  id: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  philhealth: string;
  seniorOrPwd?: string;
  lastVisitBranch: string;
  status: string;
}

const SAMPLE_PATIENTS: PatientSearchResult[] = [
  {
    id: 'pat-101',
    name: 'Juan Dela Cruz',
    age: 67,
    gender: 'Male',
    dob: '1959-04-12',
    philhealth: '12-345678901-2',
    seniorOrPwd: 'Senior Citizen (OSCA-MKT-2021-9982)',
    lastVisitBranch: 'Dr. Florence Espinosa Ob-Gyn Clinic',
    status: 'In Consultation',
  },
  {
    id: 'pat-102',
    name: 'Maria Angelica Santos',
    age: 34,
    gender: 'Female',
    dob: '1992-08-23',
    philhealth: '18-992384712-0',
    lastVisitBranch: 'Dr. Florence Espinosa Ob-Gyn Clinic',
    status: 'Vitals Done',
  },
  {
    id: 'pat-103',
    name: 'Benjamin Alcantara',
    age: 72,
    gender: 'Male',
    dob: '1954-11-03',
    philhealth: '14-112233445-6',
    seniorOrPwd: 'Senior Citizen (OSCA-OLG-2019-4412)',
    lastVisitBranch: 'Ulticare Medical Center',
    status: 'Waiting in Triage',
  },
  {
    id: 'pat-104',
    name: 'Kristine Joy Bernardo',
    age: 28,
    gender: 'Female',
    dob: '1998-02-14',
    philhealth: '21-556677889-1',
    seniorOrPwd: 'PWD Cardholder (PWD-SBF-2023-1102)',
    lastVisitBranch: 'Allied Care Experts (ACE) Medical Center - Baypointe',
    status: 'Discharged',
  },
];

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patient: PatientSearchResult) => void;
}

export function CommandSearchModal({ isOpen, onClose, onSelectPatient }: CommandSearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = SAMPLE_PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.philhealth.includes(query) ||
      p.id.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/60 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-slate-200 px-3.5 py-2 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400 mr-2.5" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient by Name, PhilHealth PIN, or ID..."
            className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-100"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block rounded border border-slate-200 bg-slate-100 px-1 py-0.2 text-[9px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-1.5 divide-y divide-slate-100 dark:divide-slate-800/60">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching patient records found.
            </div>
          ) : (
            filtered.map((patient) => (
              <div
                key={patient.id}
                onClick={() => {
                  onSelectPatient(patient);
                  onClose();
                }}
                className="group flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-bold text-[10px]">
                    {patient.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-cyan-700 dark:group-hover:text-cyan-400">
                        {patient.name}
                      </span>
                      <span className="text-[11px] text-slate-400">({patient.gender}, {patient.age}y)</span>
                      {patient.seniorOrPwd && (
                        <span className="rounded bg-amber-50 px-1 py-0.1 text-[9px] font-semibold text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                          {patient.seniorOrPwd.includes('Senior') ? 'Senior' : 'PWD'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>PIN: <strong className="font-mono text-slate-700 dark:text-slate-300">{patient.philhealth}</strong></span>
                      <span>&middot;</span>
                      <span className="flex items-center gap-0.5 text-slate-400">
                        <Building2 className="h-2.5 w-2.5" />
                        {patient.lastVisitBranch}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {patient.status}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-cyan-600 transition" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-1.5 text-[10px] text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
          <span>Multi-branch patient record lookup</span>
          <span>Press <strong>Enter</strong> to open Chart</span>
        </div>
      </div>
    </div>
  );
}
