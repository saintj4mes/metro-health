'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { BranchLocation } from '@/lib/ph-constants';
import { FhirService } from '@/lib/fhir-service';
import { UserPlus, Calendar, Clock, CheckCircle2, Search, Loader2 } from 'lucide-react';

interface ReceptionViewProps {
  branch: BranchLocation;
}

export function ReceptionView({ branch }: ReceptionViewProps) {
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ patientId: string; encounterId: string } | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    gender: 'male',
    contact: '+63 9',
    barangay: '',
    city: branch.address.city,
    province: branch.address.province,
    philhealth: '',
    seniorOrPwd: '',
    serviceType: 'General Consultation',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await FhirService.admitPatient({
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dob: formData.dob,
        gender: formData.gender as any,
        contact: formData.contact,
        barangay: formData.barangay,
        city: formData.city,
        province: formData.province,
        philhealth: formData.philhealth,
        seniorOrPwd: formData.seniorOrPwd,
        branch,
      });
      setCreatedInfo({ patientId: res.patient.id || '', encounterId: res.encounter.id || '' });
      setRegistered(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
      {/* Patient Registration Form (Philippine Format) */}
      <div className="lg:col-span-8 space-y-2.5">
        <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-cyan-800" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Patient Admission & Demographics
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Facility: {branch.name}</span>
          </div>

          {registered ? (
            <div className="my-3 rounded border border-emerald-200 bg-emerald-50 p-3 text-emerald-950 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200 text-center space-y-2">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-xs">Patient Admitted Successfully</h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Patient registered to <strong>{branch.name}</strong> and queued for Nurse Triage.
              </p>
              {createdInfo && (
                <div className="font-mono text-[10px] text-emerald-800 dark:text-emerald-300">
                  Record ID: {createdInfo.patientId} &middot; Encounter: {createdInfo.encounterId}
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => setRegistered(false)}
                  className="rounded bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition"
                >
                  Admit Another Patient
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="mt-2.5 space-y-2.5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">First Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Juan"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-8 w-full rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">Middle Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Protacio"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="h-8 w-full rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">Last Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Mercado"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="h-8 w-full rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Philippine Address Hierarchy */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Philippine Residential Address</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">Barangay *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Brgy. San Lorenzo"
                      value={formData.barangay}
                      onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                      className="h-8 w-full rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">City / Municipality *</label>
                    <input
                      required
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="h-8 w-full rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">Province *</label>
                    <input
                      required
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="h-8 w-full rounded border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Philippine IDs: PhilHealth & Senior/PWD */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Government Health Identifiers</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">PhilHealth PIN (12 Digits)</label>
                    <input
                      type="text"
                      placeholder="12-XXXXXXXXX-X"
                      value={formData.philhealth}
                      onChange={(e) => setFormData({ ...formData, philhealth: e.target.value })}
                      className="h-8 w-full rounded border border-slate-300 bg-white px-2.5 font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">Senior Citizen or PWD ID No.</label>
                    <input
                      type="text"
                      placeholder="e.g. OSCA-2024-XXXX"
                      value={formData.seniorOrPwd}
                      onChange={(e) => setFormData({ ...formData, seniorOrPwd: e.target.value })}
                      className="h-8 w-full rounded border border-slate-300 bg-white px-2.5 font-mono text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded bg-slate-900 h-8 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Register & Admit Patient</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Column: Today's Branch Schedule & Queue Status */}
      <div className="lg:col-span-4 space-y-2.5">
        <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Calendar className="h-3.5 w-3.5 text-cyan-800" />
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Today's Admissions
            </h3>
          </div>
          <div className="mt-2.5 space-y-1.5 text-xs">
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <span className="font-semibold block text-slate-900 dark:text-white text-xs">Total Checked In:</span>
                <span className="text-[10px] text-slate-400">All providers today</span>
              </div>
              <span className="text-base font-bold font-mono text-slate-900 dark:text-white">18</span>
            </div>
            <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <span className="font-semibold block text-slate-900 dark:text-white text-xs">Awaiting Triage:</span>
                <span className="text-[10px] text-slate-400">In waiting lounge</span>
              </div>
              <span className="text-base font-bold font-mono text-cyan-900 dark:text-cyan-300">4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
