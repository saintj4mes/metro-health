'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { BranchLocation } from '@/lib/ph-constants';
import { Printer, X, ShieldCheck } from 'lucide-react';

export interface PrescriptionItem {
  genericName: string;
  brandName?: string;
  dosage: string;
  route: string;
  frequency: string;
  duration: string;
  dispenseQty: string;
  instructions: string;
}

interface PrintablePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: BranchLocation;
  patient: {
    name: string;
    age: number;
    gender: string;
    address: string;
    philhealth?: string;
    seniorId?: string;
  };
  prescriptions: PrescriptionItem[];
  physician: {
    name: string;
    title: string;
    prcNo: string;
    ptrNo: string;
    s2No: string;
  };
  encounterDate?: string;
}

export function PrintablePrescriptionModal({
  isOpen,
  onClose,
  branch,
  patient,
  prescriptions,
  physician,
  encounterDate = 'October 04, 2026',
}: PrintablePrescriptionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 print:p-0 backdrop-blur-xs">
      {/* Modal Card */}
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-t-2xl sm:rounded-lg border border-slate-300 bg-white text-slate-900 shadow-2xl print:max-h-none print:w-full print:border-none print:shadow-none overflow-hidden">
        
        {/* Modal Toolbar (hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-800" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 truncate max-w-[200px] sm:max-w-none">
              Official e-Prescription (RA 6675)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 transition min-h-[44px]"
            >
              <Printer className="h-3.5 w-3.5 text-slate-600" />
              <span>Print Rx</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition min-h-[44px] min-w-[44px]"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="overflow-y-auto p-4 sm:p-5 print:p-4 print:overflow-visible font-sans">
          {/* Clinic Letterhead */}
          <div className="border-b-2 border-slate-800 pb-2.5 text-center">
            <h1 className="text-lg font-bold uppercase tracking-tight text-slate-900">
              Dr. Florence Espinosa Ob-Gyn Practice
            </h1>
            <p className="text-xs font-semibold text-slate-700 uppercase">
              {branch.name} &middot; Branch Code: {branch.code}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {branch.address.line}, {branch.address.barangay}, {branch.address.city}, {branch.address.province}
            </p>
            <p className="text-[11px] text-slate-600">
              Tel: {branch.phone} &middot; PhilHealth Accredited Health Care Facility
            </p>
          </div>

          {/* Patient Demographics Bar */}
          <div className="mt-3 grid grid-cols-12 gap-1.5 border-b border-slate-300 pb-2.5 text-xs">
            <div className="col-span-8">
              <span className="text-slate-500 font-medium">Patient Name: </span>
              <strong className="font-bold text-slate-900 uppercase">{patient.name}</strong>
            </div>
            <div className="col-span-4 text-right">
              <span className="text-slate-500 font-medium">Date: </span>
              <strong className="text-slate-900 font-semibold">{encounterDate}</strong>
            </div>
            <div className="col-span-4">
              <span className="text-slate-500 font-medium">Age / Sex: </span>
              <strong className="text-slate-900">{patient.age}y / {patient.gender}</strong>
            </div>
            <div className="col-span-4">
              <span className="text-slate-500 font-medium">PhilHealth PIN: </span>
              <span className="font-mono font-medium text-slate-800">{patient.philhealth || 'N/A'}</span>
            </div>
            <div className="col-span-4 text-right">
              {patient.seniorId && (
                <span className="font-bold text-slate-800">OSCA / PWD ID: {patient.seniorId}</span>
              )}
            </div>
            <div className="col-span-12">
              <span className="text-slate-500 font-medium">Address: </span>
              <span className="text-slate-800">{patient.address}</span>
            </div>
          </div>

          {/* Rx Symbol & Medication Body */}
          <div className="my-3 min-h-[140px]">
            <div className="mb-2 text-2xl font-serif font-black italic text-slate-900">
              ℞
            </div>

            <div className="space-y-3 pl-3">
              {prescriptions.map((rx, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-xs sm:text-sm tracking-wide">
                        {rx.genericName}
                      </span>
                      {rx.brandName && (
                        <span className="text-xs text-slate-600 font-normal italic">
                          {' '}(Brand reference: {rx.brandName})
                        </span>
                      )}
                      <span className="font-mono text-xs font-semibold ml-2 text-slate-800">
                        {rx.dosage}
                      </span>
                    </div>
                    <div className="font-mono text-xs font-bold text-slate-900">
                      # {rx.dispenseQty}
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 pl-3 border-l-2 border-slate-200">
                    <div>
                      <strong className="text-slate-600 font-serif italic text-xs">Sig: </strong>
                      {rx.instructions} ({rx.frequency}) for {rx.duration}
                    </div>
                    <div className="text-[10px] text-slate-500">Route of Admin: {rx.route}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generics Act Statutory Notice */}
          <div className="border-t border-dashed border-slate-300 pt-1.5 text-[10px] text-slate-500 text-center italic">
            Prescribed in accordance with RA 6675 (The Generics Act of 1988). Pharmacists are instructed to offer generic equivalents.
          </div>

          {/* Physician Sign-Off & Credentials Block */}
          <div className="mt-4 flex justify-end">
            <div className="w-56 text-right">
              {/* Signature Line */}
              <div className="border-b border-slate-800 pb-1">
                <span className="font-serif italic text-[11px] text-slate-400 block pb-2 text-center">
                  [Digitally Certified by Attending Physician]
                </span>
                <div className="text-center font-bold text-slate-900 text-xs sm:text-sm">
                  {physician.name}
                </div>
                <div className="text-center text-[10px] text-slate-600 font-medium">
                  {physician.title}
                </div>
              </div>

              {/* Statutory Numbers */}
              <div className="mt-1 space-y-0.5 text-[10px] text-slate-600 font-mono text-right">
                <div>PRC Lic. No.: <strong>{physician.prcNo}</strong></div>
                <div>PTR No.: <strong>{physician.ptrNo}</strong></div>
                <div>S2 Lic. No.: <strong>{physician.s2No}</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (hidden when printing) */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-500 print:hidden">
          <span className="font-mono text-[11px]">Doc Ref: RX-2026-0923</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
