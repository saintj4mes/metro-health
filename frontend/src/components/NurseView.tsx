'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { BranchLocation } from '@/lib/ph-constants';
import { FhirService } from '@/lib/fhir-service';
import { Activity, Heart, Thermometer, CheckCircle2, Loader2 } from 'lucide-react';

interface NurseViewProps {
  branch: BranchLocation;
}

export function NurseView({ branch }: NurseViewProps) {
  const [vitalsSaved, setVitalsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [obsCount, setObsCount] = useState<number>(0);
  const [vitals, setVitals] = useState({
    systolic: '120',
    diastolic: '80',
    pulse: '76',
    temp: '36.5',
    resp: '18',
    spo2: '99',
    heightCm: '165',
    weightKg: '64',
  });

  const heightM = Number(vitals.heightCm) / 100;
  const bmi = heightM > 0 ? (Number(vitals.weightKg) / (heightM * heightM)).toFixed(1) : '0';

  const handleSaveVitals = async () => {
    setLoading(true);
    try {
      const createdObs = await FhirService.recordVitals({
        patientId: 'pat-101',
        systolic: Number(vitals.systolic),
        diastolic: Number(vitals.diastolic),
        pulse: Number(vitals.pulse),
        temp: Number(vitals.temp),
        spo2: Number(vitals.spo2),
        heightCm: Number(vitals.heightCm),
        weightKg: Number(vitals.weightKg),
        bmi: Number(bmi),
      });
      setObsCount(createdObs.length);
      setVitalsSaved(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-800" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Nurse Triage & Clinical Vitals
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">Station: {branch.name}</span>
      </div>

      {vitalsSaved ? (
        <div className="my-3 rounded border border-emerald-200 bg-emerald-50 p-3 text-emerald-950 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200 text-center space-y-1.5">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-xs">Vitals Recorded Successfully</h3>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Observations synchronized to patient chart. Patient advanced to Doctor Consultation.
          </p>
          <button
            type="button"
            onClick={() => setVitalsSaved(false)}
            className="rounded bg-slate-900 text-white text-xs font-semibold px-3 py-1 hover:bg-slate-800 transition"
          >
            Record Next Patient
          </button>
        </div>
      ) : (
        <div className="mt-2.5 space-y-2.5">
          {/* Patient Quick Context */}
          <div className="rounded bg-slate-50 p-2 border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-500">Patient: </span>
              <strong className="text-slate-900 dark:text-white">Juan Dela Cruz (67 y/o Male)</strong>
              <span className="ml-2 font-mono text-slate-500 text-[11px]">PIN: 12-345678901-2</span>
            </div>
            <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 border border-amber-200">
              Senior Citizen Priority
            </span>
          </div>

          {/* Vitals Form Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Blood Pressure Systolic */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">
                Systolic BP (mmHg)
              </label>
              <input
                type="number"
                value={vitals.systolic}
                onChange={(e) => setVitals({ ...vitals, systolic: e.target.value })}
                className="h-8 w-full rounded border border-slate-300 bg-white px-2 font-mono text-xs focus:ring-1 focus:ring-cyan-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            {/* Diastolic */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">
                Diastolic BP (mmHg)
              </label>
              <input
                type="number"
                value={vitals.diastolic}
                onChange={(e) => setVitals({ ...vitals, diastolic: e.target.value })}
                className="h-8 w-full rounded border border-slate-300 bg-white px-2 font-mono text-xs focus:ring-1 focus:ring-cyan-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            {/* Pulse */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">
                Pulse Rate (bpm)
              </label>
              <input
                type="number"
                value={vitals.pulse}
                onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                className="h-8 w-full rounded border border-slate-300 bg-white px-2 font-mono text-xs focus:ring-1 focus:ring-cyan-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            {/* Temp */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">
                Temperature (°C)
              </label>
              <input
                type="text"
                value={vitals.temp}
                onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                className="h-8 w-full rounded border border-slate-300 bg-white px-2 font-mono text-xs focus:ring-1 focus:ring-cyan-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            {/* SpO2 */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">
                Oxygen Sat (SpO2 %)
              </label>
              <input
                type="number"
                value={vitals.spo2}
                onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                className="h-8 w-full rounded border border-slate-300 bg-white px-2 font-mono text-xs focus:ring-1 focus:ring-cyan-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            {/* Resp Rate */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">
                Resp Rate (/min)
              </label>
              <input
                type="number"
                value={vitals.resp}
                onChange={(e) => setVitals({ ...vitals, resp: e.target.value })}
                className="h-8 w-full rounded border border-slate-300 bg-white px-2 font-mono text-xs focus:ring-1 focus:ring-cyan-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">
                Height (cm)
              </label>
              <input
                type="number"
                value={vitals.heightCm}
                onChange={(e) => setVitals({ ...vitals, heightCm: e.target.value })}
                className="h-8 w-full rounded border border-slate-300 bg-white px-2 font-mono text-xs focus:ring-1 focus:ring-cyan-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-0.5">
                Weight (kg)
              </label>
              <input
                type="number"
                value={vitals.weightKg}
                onChange={(e) => setVitals({ ...vitals, weightKg: e.target.value })}
                className="h-8 w-full rounded border border-slate-300 bg-white px-2 font-mono text-xs focus:ring-1 focus:ring-cyan-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          {/* Computed BMI Banner */}
          <div className="flex items-center justify-between rounded bg-slate-50 px-2.5 py-1.5 border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">Computed BMI:</span>
            <span className="font-mono font-bold text-slate-900">{bmi} kg/m²</span>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleSaveVitals}
            className="flex items-center justify-center gap-1.5 rounded bg-slate-900 h-8 px-4 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />}
            <span>Record Triage Vitals</span>
          </button>
        </div>
      )}
    </div>
  );
}
