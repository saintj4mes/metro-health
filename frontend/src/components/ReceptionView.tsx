'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { BranchLocation } from '@/lib/ph-constants';
import { FhirService } from '@/lib/fhir-service';
import {
  UserPlus,
  Calendar,
  Clock,
  CheckCircle2,
  Search,
  Loader2,
  ShieldCheck,
  Printer,
  Ticket,
  Users,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

interface ReceptionViewProps {
  branch: BranchLocation;
  onOpenQueue?: () => void;
}

export function ReceptionView({ branch, onOpenQueue }: ReceptionViewProps) {
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ patientId: string; encounterId: string; queueNo: string } | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '1990-05-15',
    gender: 'female',
    civilStatus: 'Single',
    contact: '+63 917 555 0192',
    street: '12 Rizal Avenue',
    barangay: 'Barretto',
    city: branch.address.city,
    province: branch.address.province,
    philhealth: '12-345678901-2',
    seniorOrPwd: '',
    isSenior: false,
    isPwd: false,
    memberType: 'Konsulta Registered Beneficiary',
    chiefComplaint: 'Routine prenatal follow-up and pelvic ultrasound examination.',
    attendingDoctor: 'Dr. Florence Espinosa, MD (Ob-Gyn)',
    priority: 'Standard',
  });

  const recentAdmissions = [
    { queue: 'Q-042', name: 'Maria Angelica Santos', time: '09:40 AM', doctor: 'Dr. Florence Espinosa', status: 'At Nurse Triage' },
    { queue: 'Q-041', name: 'Juan Dela Cruz', time: '09:15 AM', doctor: 'Dr. Florence Espinosa', status: 'In Consultation' },
    { queue: 'Q-040', name: 'Carmela Ramos', time: '08:50 AM', doctor: 'Dr. Florence Espinosa', status: 'Payment Cleared' },
    { queue: 'Q-039', name: 'Kristine Joy Bernardo', time: '08:30 AM', doctor: 'Dr. Florence Espinosa', status: 'In Consultation' },
    { queue: 'Q-038', name: 'Beatrice Mendoza', time: '08:10 AM', doctor: 'Dr. Florence Espinosa', status: 'Discharged' },
  ];

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
      const generatedQueue = `Q-0${Math.floor(Math.random() * 50) + 43}`;
      setCreatedInfo({
        patientId: res.patient.id || 'pat-new',
        encounterId: res.encounter.id || 'enc-new',
        queueNo: generatedQueue,
      });
      setRegistered(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
      {/* Patient Registration Form (Philippine Format) */}
      <div className="lg:col-span-8 space-y-2.5">
        <div className="rounded border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-cyan-50 text-cyan-800 border border-cyan-200">
                <UserPlus className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 leading-none">
                  Outpatient Registration & Demographics
                </h2>
                <span className="text-[11px] text-slate-500">
                  Philippine Clinical Intake & Medplum FHIR R4 Patient Demographics
                </span>
              </div>
            </div>
            <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {branch.name}
            </span>
          </div>

          {registered && createdInfo ? (
            <div className="my-3 rounded border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-950 text-center space-y-2.5">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <div>
                <span className="inline-block rounded-full bg-emerald-200 text-emerald-900 font-mono font-bold text-xs px-2.5 py-0.5">
                  Queue Ticket: {createdInfo.queueNo}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">Patient Admitted Successfully</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-0.5">
                  {formData.firstName} {formData.lastName} has been queued for Nurse Triage at <strong>{branch.name}</strong>.
                </p>
              </div>

              <div className="font-mono text-[10px] text-emerald-800 bg-white/80 p-1.5 rounded border border-emerald-200 max-w-sm mx-auto">
                Patient FHIR ID: {createdInfo.patientId} &bull; Encounter: {createdInfo.encounterId}
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setRegistered(false);
                    setFormData({
                      ...formData,
                      firstName: '',
                      middleName: '',
                      lastName: '',
                      philhealth: '',
                      seniorOrPwd: '',
                    });
                  }}
                  className="rounded bg-cyan-700 px-3.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-cyan-800 transition"
                >
                  Admit Another Patient
                </button>
                {onOpenQueue && (
                  <button
                    type="button"
                    onClick={onOpenQueue}
                    className="rounded border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    View in Queue Board
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="mt-3 space-y-3">
              {/* Section 1: Personal Demographics */}
              <div>
                <span className="block text-[10px] font-bold text-cyan-800 uppercase tracking-wider mb-1.5">
                  1. Patient Identity & Demographics
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">First Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Maria"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Middle Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Santos"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Last Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Cruz"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Date of Birth *</label>
                    <input
                      required
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Sex / Gender *</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Civil Status</label>
                    <select
                      value={formData.civilStatus}
                      onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700"
                    >
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Widowed">Widowed</option>
                      <option value="Separated">Separated</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Mobile Contact *</label>
                    <input
                      required
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Residential Address */}
              <div className="pt-2 border-t border-slate-100">
                <span className="block text-[10px] font-bold text-cyan-800 uppercase tracking-wider mb-1.5">
                  2. Philippine Residential Address
                </span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Street Address / House No.</label>
                    <input
                      type="text"
                      placeholder="e.g. Blk 4 Lot 12 Mabini St"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Barangay *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Barretto"
                      value={formData.barangay}
                      onChange={(e) => setFormData({ ...formData, barangay: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">City / Municipality *</label>
                    <input
                      required
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Government Health Identifiers & Statutory Privilege */}
              <div className="pt-2 border-t border-slate-100">
                <span className="block text-[10px] font-bold text-cyan-800 uppercase tracking-wider mb-1.5">
                  3. Statutory Privileges & Health Benefits
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">PhilHealth PIN (12 Digits)</label>
                    <input
                      type="text"
                      placeholder="12-XXXXXXXXX-X"
                      value={formData.philhealth}
                      onChange={(e) => setFormData({ ...formData, philhealth: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 font-mono text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">PhilHealth Benefit Package</label>
                    <select
                      value={formData.memberType}
                      onChange={(e) => setFormData({ ...formData, memberType: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700"
                    >
                      <option value="Konsulta Registered Beneficiary">PhilHealth Konsulta Outpatient</option>
                      <option value="Direct Contributor (Employed)">Direct Contributor (Employed)</option>
                      <option value="Indigent / NHTS-PR">Indigent / NHTS-PR Subsidized</option>
                      <option value="Non-PhilHealth / Self-Pay">Self-Pay / Non-PhilHealth</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Senior / PWD ID (if applicable)</label>
                    <input
                      type="text"
                      placeholder="e.g. OSCA-2024-XXXX"
                      value={formData.seniorOrPwd}
                      onChange={(e) => setFormData({ ...formData, seniorOrPwd: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 font-mono text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Encounter Details */}
              <div className="pt-2 border-t border-slate-100">
                <span className="block text-[10px] font-bold text-cyan-800 uppercase tracking-wider mb-1.5">
                  4. Clinical Encounter Reason & Attending Physician
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Chief Complaint / Visit Purpose *</label>
                    <input
                      required
                      type="text"
                      value={formData.chiefComplaint}
                      onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Assigned Clinician</label>
                    <select
                      value={formData.attendingDoctor}
                      onChange={(e) => setFormData({ ...formData, attendingDoctor: e.target.value })}
                      className="h-8 w-full rounded border border-slate-200 bg-white px-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-700 font-medium"
                    >
                      <option value="Dr. Florence Espinosa, MD (Ob-Gyn)">Dr. Florence Espinosa, MD (Ob-Gyn)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded bg-cyan-700 h-9 text-xs font-semibold text-white shadow-2xs hover:bg-cyan-800 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <UserPlus className="h-4 w-4" />
                  <span>Admit Patient & Route to Nurse Triage</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Column: Front Desk Live Queue & Admissions Activity */}
      <div className="lg:col-span-4 space-y-2.5">
        {/* Today's Admission Metrics */}
        <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <Calendar className="h-3.5 w-3.5 text-cyan-800" />
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Front Desk Metrics Today
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2.5">
            <div className="p-2 rounded bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Checked In</span>
              <span className="text-xl font-bold font-mono text-slate-900">18</span>
              <span className="text-[9px] text-slate-400 block">Total admitted</span>
            </div>
            <div className="p-2 rounded bg-teal-50 border border-teal-100">
              <span className="text-[10px] text-teal-700 block uppercase font-medium">In Triage Bay</span>
              <span className="text-xl font-bold font-mono text-teal-800">4</span>
              <span className="text-[9px] text-teal-600 block">Awaiting vitals</span>
            </div>
            <div className="p-2 rounded bg-cyan-50 border border-cyan-100">
              <span className="text-[10px] text-cyan-700 block uppercase font-medium">In Consult</span>
              <span className="text-xl font-bold font-mono text-cyan-800">1</span>
              <span className="text-[9px] text-cyan-600 block">Room 204</span>
            </div>
            <div className="p-2 rounded bg-amber-50 border border-amber-100">
              <span className="text-[10px] text-amber-700 block uppercase font-medium">Senior / PWD</span>
              <span className="text-xl font-bold font-mono text-amber-800">5</span>
              <span className="text-[9px] text-amber-600 block">Priority queue</span>
            </div>
          </div>
        </div>

        {/* Recent Check-Ins Live Stream */}
        <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-cyan-800" />
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Recent Check-Ins
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Live feed</span>
          </div>

          <div className="mt-2 space-y-1.5">
            {recentAdmissions.map((adm, i) => (
              <div
                key={i}
                className="p-2 rounded border border-slate-100 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-cyan-800 bg-cyan-50 px-1 py-0.2 rounded border border-cyan-200">
                      {adm.queue}
                    </span>
                    <span className="font-semibold text-slate-900">{adm.name}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {adm.time} &bull; {adm.status}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {adm.doctor.split(' ')[1]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PhilHealth Online Verification Gateway Status */}
        <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>PhilHealth Konsulta Live Verification API</span>
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            Facility Accreditation: <strong className="text-slate-800">ACR-ZAM-2026-0812</strong>. Real-time eligibility checking active for Outpatient Comprehensive Benefits.
          </p>
        </div>
      </div>
    </div>
  );
}
