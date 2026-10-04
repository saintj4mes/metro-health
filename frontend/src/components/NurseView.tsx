'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { BranchLocation } from '@/lib/ph-constants';
import { FhirService } from '@/lib/fhir-service';
import {
  Activity,
  Heart,
  Thermometer,
  CheckCircle2,
  Loader2,
  Users,
  AlertTriangle,
  ArrowRight,
  Gauge,
  Baby,
} from 'lucide-react';

interface NurseViewProps {
  branch: BranchLocation;
  onNavigateToConsult?: () => void;
}

export function NurseView({ branch, onNavigateToConsult }: NurseViewProps) {
  const [vitalsSaved, setVitalsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [obsCount, setObsCount] = useState<number>(0);

  const [selectedPatient, setSelectedPatient] = useState({
    id: 'pat-102',
    name: 'Kristine Joy Bernardo',
    age: 28,
    gender: 'Female',
    dob: '1998-03-14',
    philhealth: '09-876543210-9',
    chiefComplaint: '1st Trimester Prenatal Routine Check & severe hyperemesis gravidarum',
    priority: 'Normal',
  });

  const waitingPatients = [
    { id: 'pat-102', name: 'Kristine Joy Bernardo', age: 28, gender: 'Female', time: '09:20 AM', complaint: '1st Trimester Prenatal Check', isPriority: false },
    { id: 'pat-104', name: 'Andrea Dizon', age: 42, gender: 'Female', time: '09:35 AM', complaint: 'Dysfunctional Uterine Bleeding workup', isPriority: true },
    { id: 'pat-105', name: 'Clarisse Villamor', age: 36, gender: 'Female', time: '09:50 AM', complaint: '36-Week Pre-Delivery Assessment', isPriority: false },
  ];

  const [vitals, setVitals] = useState({
    systolic: '110',
    diastolic: '70',
    pulse: '82',
    temp: '36.8',
    resp: '18',
    spo2: '99',
    heightCm: '160',
    weightKg: '58',
    fundicHeight: '14',
    fhr: '148',
    painScore: '2',
    notes: 'Patient alert and ambulatory. Mild nausea reported. Clear lung sounds.',
  });

  const heightM = Number(vitals.heightCm) / 100;
  const bmiVal = heightM > 0 ? Number((Number(vitals.weightKg) / (heightM * heightM)).toFixed(1)) : 0;

  const getBmiCategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    if (bmi < 24.9) return { label: 'Normal Weight', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    if (bmi < 29.9) return { label: 'Overweight', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    return { label: 'Obese Class I', color: 'text-rose-800 bg-rose-50 border-rose-200' };
  };

  const bmiCat = getBmiCategory(bmiVal);

  const handleSaveVitals = async () => {
    setLoading(true);
    try {
      const createdObs = await FhirService.recordVitals({
        patientId: selectedPatient.id,
        systolic: Number(vitals.systolic),
        diastolic: Number(vitals.diastolic),
        pulse: Number(vitals.pulse),
        temp: Number(vitals.temp),
        spo2: Number(vitals.spo2),
        heightCm: Number(vitals.heightCm),
        weightKg: Number(vitals.weightKg),
        bmi: bmiVal,
      });
      setObsCount(createdObs.length);
      setVitalsSaved(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
      {/* Left Column: Triage Waiting Queue */}
      <div className="lg:col-span-4 space-y-2.5">
        <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-teal-700" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                Awaiting Nurse Triage
              </h3>
            </div>
            <span className="rounded bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold px-1.5 py-0.2">
              {waitingPatients.length} Patients
            </span>
          </div>

          <div className="mt-2 space-y-1.5">
            {waitingPatients.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedPatient(p as any);
                  setVitalsSaved(false);
                }}
                className={`p-2.5 rounded border cursor-pointer transition text-xs ${
                  selectedPatient.id === p.id
                    ? 'border-teal-700 bg-teal-50/50 text-slate-900 font-medium shadow-2xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-900">{p.name} ({p.age}y {p.gender[0]})</span>
                  <span className="text-[10px] text-slate-500 font-mono">{p.time}</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{p.complaint}</p>
                {p.isPriority && (
                  <span className="inline-block mt-1 rounded bg-rose-50 border border-rose-200 px-1 py-0.2 text-[9px] font-bold text-rose-800">
                    Priority Triage
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Triage Protocol Guidelines */}
        <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs text-xs space-y-2">
          <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-700">
            <Activity className="h-3.5 w-3.5 text-teal-600" />
            <span>LOINC Standard Triage Thresholds</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-600">
            <div className="flex justify-between py-0.5 border-b border-slate-50">
              <span>Normal Adult BP:</span>
              <strong className="font-mono text-slate-800">90-120 / 60-80 mmHg</strong>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-50">
              <span>Resting Pulse:</span>
              <strong className="font-mono text-slate-800">60-100 bpm</strong>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-50">
              <span>Oral / Axillary Temp:</span>
              <strong className="font-mono text-slate-800">36.5 - 37.5 °C</strong>
            </div>
            <div className="flex justify-between py-0.5 border-b border-slate-50">
              <span>Normal Pulse Oximetry:</span>
              <strong className="font-mono text-slate-800">&ge; 95% on Room Air</strong>
            </div>
            <div className="flex justify-between py-0.5">
              <span>Fetal Heart Rate (FHR):</span>
              <strong className="font-mono text-slate-800">110-160 bpm</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Vitals Measurement Station */}
      <div className="lg:col-span-8 space-y-2.5">
        <div className="rounded border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-teal-50 text-teal-800 border border-teal-200">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 leading-none">
                  Vital Signs & Clinical Triage Intake
                </h2>
                <span className="text-[11px] text-slate-500">
                  Patient: <strong className="text-slate-800">{selectedPatient.name}</strong> ({selectedPatient.age}y &bull; PIN: {selectedPatient.philhealth})
                </span>
              </div>
            </div>
            <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              Station: {branch.name}
            </span>
          </div>

          {vitalsSaved ? (
            <div className="my-3 rounded border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-950 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
              <h3 className="font-bold text-sm text-slate-900">LOINC Vital Signs Synchronized</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {obsCount} FHIR Observation resources successfully linked to {selectedPatient.name}. Patient is now queued for Doctor Consultation.
              </p>
              <div className="flex items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setVitalsSaved(false)}
                  className="rounded bg-slate-900 px-3.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition"
                >
                  Edit Vitals
                </button>
                {onNavigateToConsult && (
                  <button
                    type="button"
                    onClick={onNavigateToConsult}
                    className="rounded bg-cyan-700 px-3.5 py-1 text-xs font-semibold text-white hover:bg-cyan-800 transition"
                  >
                    Go to Doctor Consultation &rarr;
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {/* Vital Signs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={vitals.systolic}
                    onChange={(e) => setVitals({ ...vitals, systolic: e.target.value })}
                    className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 font-mono text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={vitals.diastolic}
                    onChange={(e) => setVitals({ ...vitals, diastolic: e.target.value })}
                    className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 font-mono text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Pulse Rate (bpm)</label>
                  <input
                    type="number"
                    value={vitals.pulse}
                    onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                    className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 font-mono text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Temperature (°C)</label>
                  <input
                    type="text"
                    value={vitals.temp}
                    onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                    className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 font-mono text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Resp Rate (cpm)</label>
                  <input
                    type="number"
                    value={vitals.resp}
                    onChange={(e) => setVitals({ ...vitals, resp: e.target.value })}
                    className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 font-mono text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Oxygen Sat (SpO2 %)</label>
                  <input
                    type="number"
                    value={vitals.spo2}
                    onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                    className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 font-mono text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Height (cm)</label>
                  <input
                    type="number"
                    value={vitals.heightCm}
                    onChange={(e) => setVitals({ ...vitals, heightCm: e.target.value })}
                    className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 font-mono text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5">Weight (kg)</label>
                  <input
                    type="number"
                    value={vitals.weightKg}
                    onChange={(e) => setVitals({ ...vitals, weightKg: e.target.value })}
                    className="h-8 w-full rounded border border-slate-200 bg-white px-2.5 font-mono text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                  />
                </div>
              </div>

              {/* BMI Computed & Ob-Gyn Specific Section */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div className="p-2.5 rounded border border-slate-200 bg-slate-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Computed BMI</span>
                    <span className="text-base font-bold font-mono text-slate-900">{bmiVal} kg/m²</span>
                  </div>
                  <span className={`rounded border px-2 py-0.5 text-[10px] font-bold ${bmiCat.color}`}>
                    {bmiCat.label}
                  </span>
                </div>

                <div className="p-2 rounded border border-slate-200 bg-slate-50">
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5 flex items-center gap-1">
                    <Baby className="h-3 w-3 text-cyan-700" />
                    <span>Fundic Height (cm)</span>
                  </label>
                  <input
                    type="number"
                    value={vitals.fundicHeight}
                    onChange={(e) => setVitals({ ...vitals, fundicHeight: e.target.value })}
                    className="h-7 w-full rounded border border-slate-200 bg-white px-2 font-mono text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="p-2 rounded border border-slate-200 bg-slate-50">
                  <label className="block text-[10px] font-bold uppercase text-slate-600 mb-0.5 flex items-center gap-1">
                    <Heart className="h-3 w-3 text-rose-600" />
                    <span>Fetal Heart Rate (bpm)</span>
                  </label>
                  <input
                    type="number"
                    value={vitals.fhr}
                    onChange={(e) => setVitals({ ...vitals, fhr: e.target.value })}
                    className="h-7 w-full rounded border border-slate-200 bg-white px-2 font-mono text-xs font-semibold text-slate-900"
                  />
                </div>
              </div>

              {/* Triage Nurse Assessment Note */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-600 mb-1">
                  Nurse Clinical Triage Impressions & Observations
                </label>
                <textarea
                  rows={2}
                  value={vitals.notes}
                  onChange={(e) => setVitals({ ...vitals, notes: e.target.value })}
                  className="w-full rounded border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-teal-700"
                />
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSaveVitals}
                  className="w-full rounded bg-teal-700 h-9 text-xs font-semibold text-white shadow-2xs hover:bg-teal-800 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Activity className="h-4 w-4" />
                  <span>Synchronize Vitals (LOINC FHIR) & Route Patient to Doctor</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
