'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React from 'react';
import { BranchLocation, formatPhp } from '@/lib/ph-constants';
import { Printer, X, Receipt, Building2 } from 'lucide-react';

export interface BillingLineItem {
  id: string;
  description: string;
  category: 'Consultation' | 'Diagnostic / Lab' | 'Pharmacy' | 'Procedure';
  qty: number;
  unitPrice: number;
  amount: number;
}

interface PrintableBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: BranchLocation;
  statementNo: string;
  statementDate?: string;
  patient: {
    name: string;
    age: number;
    gender: string;
    address: string;
    philhealth?: string;
    discountType: 'SENIOR' | 'PWD' | 'NONE';
    discountId?: string;
  };
  items: BillingLineItem[];
  philhealthCredit?: number;
  paymentMethod?: string;
  cashierName?: string;
}

export function PrintableBillingModal({
  isOpen,
  onClose,
  branch,
  statementNo,
  statementDate = 'October 04, 2026',
  patient,
  items,
  philhealthCredit = 0,
  paymentMethod = 'Cash Payment',
  cashierName = 'Anna Reyes, RMT (Cashier)',
}: PrintableBillingModalProps) {
  if (!isOpen) return null;

  // Compute breakdown according to Philippine statutory rules
  const grossSubtotal = items.reduce((acc, item) => acc + item.amount, 0);
  const isExempt = patient.discountType === 'SENIOR' || patient.discountType === 'PWD';

  // Under Philippine tax law for Senior/PWD:
  // Gross price is assumed VAT inclusive (12%).
  // Step 1: VAT-Exempt Base = Gross / 1.12
  // Step 2: VAT Amount = Gross - VAT-Exempt Base
  // Step 3: 20% Statutory Discount = VAT-Exempt Base * 0.20
  // Step 4: Net Payable = VAT-Exempt Base - Discount - PhilHealth Credit
  const vatRate = 0.12;
  const vatExemptBase = isExempt ? grossSubtotal / (1 + vatRate) : grossSubtotal;
  const vatAmount = isExempt ? 0 : grossSubtotal * (vatRate / (1 + vatRate));
  const vatExemptionSaved = isExempt ? grossSubtotal - vatExemptBase : 0;
  const statutoryDiscount = isExempt ? vatExemptBase * 0.20 : 0;
  const netDue = Math.max(0, (isExempt ? vatExemptBase - statutoryDiscount : grossSubtotal) - philhealthCredit);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:p-0 backdrop-blur-xs">
      {/* Modal Card */}
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col rounded-lg border border-slate-300 bg-white text-slate-900 shadow-2xl print:max-h-none print:w-full print:border-none print:shadow-none">
        
        {/* Modal Toolbar (hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-cyan-800" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Official Clinic Statement of Account & Billing Slip
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 transition"
            >
              <Printer className="h-3.5 w-3.5 text-slate-600" />
              <span>Print Statement</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Statement Sheet */}
        <div className="overflow-y-auto p-4 sm:p-5 print:p-4 print:overflow-visible font-sans text-xs">
          
          {/* Clinic Header */}
          <div className="border-b-2 border-slate-800 pb-2.5">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-base sm:text-lg font-bold uppercase tracking-tight text-slate-900">
                  Dr. Florence Espinosa Ob-Gyn Practice
                </h1>
                <p className="text-xs font-semibold text-slate-700">
                  {branch.name} &middot; TIN: 009-876-543-000 VAT
                </p>
                <p className="text-[11px] text-slate-600">
                  {branch.address.line}, {branch.address.barangay}, {branch.address.city}, {branch.address.province}
                </p>
                <p className="text-[11px] text-slate-600">
                  Tel: {branch.phone} &middot; Accreditation: DOH / PhilHealth
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block rounded border border-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                  Statement of Account
                </span>
                <div className="mt-1 font-mono font-bold text-slate-900 text-sm">
                  #{statementNo}
                </div>
                <div className="text-[11px] text-slate-600">{statementDate}</div>
              </div>
            </div>
          </div>

          {/* Patient Details & Discount Eligibility */}
          <div className="mt-3 grid grid-cols-12 gap-1.5 border-b border-slate-200 pb-2.5">
            <div className="col-span-8">
              <span className="text-slate-500 font-medium">Billed To: </span>
              <strong className="text-slate-900 font-bold uppercase">{patient.name}</strong>
              <div className="text-slate-600 text-[11px]">{patient.address}</div>
            </div>
            <div className="col-span-4 text-right">
              <div className="text-slate-500 font-medium">Age / Sex: {patient.age}y / {patient.gender}</div>
              <div className="text-slate-700 font-mono text-[11px]">
                PIN: {patient.philhealth || 'None'}
              </div>
            </div>

            {/* Statutory Privileges Callout */}
            <div className="col-span-12 mt-1 rounded bg-slate-50 px-2.5 py-1 border border-slate-200 flex items-center justify-between text-[11px]">
              <div>
                <span className="font-semibold text-slate-700">Statutory Privilege: </span>
                {patient.discountType === 'SENIOR' && (
                  <strong className="text-slate-900">Senior Citizen (RA 9994) &middot; ID: {patient.discountId || 'N/A'}</strong>
                )}
                {patient.discountType === 'PWD' && (
                  <strong className="text-slate-900">Person with Disability (RA 10754) &middot; ID: {patient.discountId || 'N/A'}</strong>
                )}
                {patient.discountType === 'NONE' && (
                  <span className="text-slate-600">Standard Healthcare Consumer</span>
                )}
              </div>
              {isExempt && (
                <span className="font-bold text-emerald-700 text-[10px] uppercase">
                  12% VAT Exempt + 20% Discount Applied
                </span>
              )}
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div className="mt-3">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-300 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-1.5">Item Description</th>
                  <th className="py-1.5">Department / Category</th>
                  <th className="py-1.5 text-center">Qty</th>
                  <th className="py-1.5 text-right">Unit Price</th>
                  <th className="py-1.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1.5 font-sans font-medium text-slate-900">{item.description}</td>
                    <td className="py-1.5 font-sans text-slate-500">{item.category}</td>
                    <td className="py-1.5 text-center">{item.qty}</td>
                    <td className="py-1.5 text-right">{formatPhp(item.unitPrice)}</td>
                    <td className="py-1.5 text-right font-bold text-slate-900">{formatPhp(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal & Statutory Calculation Breakdown */}
          <div className="mt-3 border-t border-slate-300 pt-2.5 flex justify-end">
            <div className="w-72 sm:w-80 space-y-1 font-mono text-[11px]">
              <div className="flex justify-between font-sans text-slate-600">
                <span>Gross Medical Charges:</span>
                <span className="font-mono font-medium text-slate-900">{formatPhp(grossSubtotal)}</span>
              </div>

              {isExempt ? (
                <>
                  <div className="flex justify-between font-sans text-slate-600">
                    <span>Less: 12% VAT Exemption (RA 9994/10754):</span>
                    <span className="font-mono font-medium text-emerald-700">
                      - {formatPhp(vatExemptionSaved)}
                    </span>
                  </div>
                  <div className="flex justify-between font-sans text-slate-600">
                    <span>VAT-Exempt Net Base:</span>
                    <span className="font-mono font-medium text-slate-900">{formatPhp(vatExemptBase)}</span>
                  </div>
                  <div className="flex justify-between font-sans text-emerald-800 font-semibold">
                    <span>Less: 20% Statutory Discount:</span>
                    <span className="font-mono">- {formatPhp(statutoryDiscount)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between font-sans text-slate-600">
                  <span>Included 12% VAT:</span>
                  <span className="font-mono font-medium text-slate-900">{formatPhp(vatAmount)}</span>
                </div>
              )}

              {philhealthCredit > 0 && (
                <div className="flex justify-between font-sans text-blue-800 font-semibold">
                  <span>Less: PhilHealth Benefit Credit:</span>
                  <span className="font-mono">- {formatPhp(philhealthCredit)}</span>
                </div>
              )}

              <div className="border-t-2 border-slate-800 pt-1.5 flex justify-between items-baseline font-sans">
                <span className="font-bold uppercase text-slate-900 text-xs">
                  Net Amount Payable:
                </span>
                <span className="font-mono font-bold text-base text-slate-900">
                  {formatPhp(netDue)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment & Cashier Acknowledgment */}
          <div className="mt-4 grid grid-cols-2 gap-6 border-t border-dashed border-slate-300 pt-3">
            <div>
              <div className="text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800">Payment Tendered: </span>
                {paymentMethod}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                <span className="font-semibold text-slate-800">Processed By: </span>
                {cashierName}
              </div>
              <div className="mt-2 text-[10px] text-slate-400">
                Official Clinic Billing Statement. Official Receipt (OR) issued upon electronic payment clearance.
              </div>
            </div>

            <div className="text-center flex flex-col justify-end">
              <div className="border-b border-slate-800 pb-1">
                <div className="text-slate-400 text-[10px] pb-2">[Patient / Representative Signature]</div>
                <div className="font-semibold uppercase text-[11px] text-slate-800">{patient.name}</div>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Patient / Authorized Payor Acknowledgment</div>
            </div>
          </div>
        </div>

        {/* Modal Footer (hidden when printing) */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs text-slate-500 print:hidden">
          <span className="font-mono text-[11px]">BIR Reg. O.R. Series No. 2026-0810</span>
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
