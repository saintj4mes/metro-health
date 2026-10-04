'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { BranchLocation, calculatePhilippineDiscount, formatPhp } from '@/lib/ph-constants';
import { FhirService } from '@/lib/fhir-service';
import { CreditCard, Receipt, Tag, CheckCircle2, ShieldAlert, Loader2, Printer } from 'lucide-react';
import { PrintableBillingModal, BillingLineItem } from './PrintableBillingModal';

interface BillingViewProps {
  branch: BranchLocation;
}

export function BillingView({ branch }: BillingViewProps) {
  const [patientType, setPatientType] = useState<'SENIOR' | 'PWD' | 'NONE'>('SENIOR');
  const [consultationFee, setConsultationFee] = useState(1000);
  const [labFee, setLabFee] = useState(1200);
  const [medsFee, setMedsFee] = useState(850);
  const [paymentDone, setPaymentDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  const grossTotal = consultationFee + labFee + medsFee;
  const discountCalculation = calculatePhilippineDiscount(grossTotal, patientType, true);

  const billingItems: BillingLineItem[] = [
    { id: '1', description: 'Internal Medicine Consultation', category: 'Consultation', qty: 1, unitPrice: consultationFee, amount: consultationFee },
    { id: '2', description: 'Chest X-Ray Digital Diagnostic & Interpretation', category: 'Diagnostic / Lab', qty: 1, unitPrice: labFee, amount: labFee },
    { id: '3', description: 'Prescribed Oral Antibiotics & Expectorant Course', category: 'Pharmacy', qty: 1, unitPrice: medsFee, amount: medsFee },
  ];

  const handleProcessPayment = async () => {
    setLoading(true);
    try {
      const invoice = await FhirService.recordPayment({
        patientId: 'pat-101',
        grossAmount: discountCalculation.grossAmount,
        netPayable: discountCalculation.netPayablePhp,
        discountType: patientType,
        discountAmount: discountCalculation.discountAmount,
        receiptNumber: 'OR-2026-4482',
      });
      setInvoiceId(invoice.id || '');
      setPaymentDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
      {/* Invoice & Order Summary */}
      <div className="lg:col-span-7 space-y-2.5">
        <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-cyan-800" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Cashier Checkout & Billing
              </h2>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">Station: {branch.name}</span>
          </div>

          {/* Patient Details */}
          <div className="mt-2.5 p-2 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <div className="flex justify-between items-start text-xs">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Juan Dela Cruz (67 y/o)</h4>
                <p className="text-slate-500 text-[10px] mt-0.5">Encounter: enc-2026-9923 &middot; Dr. Florence Espinosa</p>
              </div>
              <div className="text-right text-[11px]">
                <span className="block font-medium text-slate-700 dark:text-slate-300 font-mono">PIN: 12-345678901-2</span>
                <span className="text-emerald-700 font-semibold text-[10px]">Konsulta Eligible</span>
              </div>
            </div>

            {/* Statutory Discount Selector */}
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Philippine Statutory Privilege
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'SENIOR', label: 'Senior (RA 9994)', note: '20% + VAT Exempt' },
                  { id: 'PWD', label: 'PWD (RA 10754)', note: '20% + VAT Exempt' },
                  { id: 'NONE', label: 'Regular (No Discount)', note: 'VAT 12%' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPatientType(item.id as any);
                      setPaymentDone(false);
                    }}
                    className={`p-1.5 rounded border text-left transition text-xs ${
                      patientType === item.id
                        ? 'border-cyan-800 bg-cyan-50/60 font-semibold text-cyan-900 shadow-2xs dark:bg-cyan-950 dark:text-cyan-200'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-[11px]">{item.label}</div>
                    <div className="text-[9px] text-slate-400">{item.note}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Itemized Charge Inputs */}
          <div className="mt-2.5 space-y-1.5 text-xs">
            <h4 className="font-bold text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Itemized Clinical Charges (PHP)
            </h4>

            <div className="space-y-1">
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-50/80 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300 text-xs">Specialist Medical Consultation</span>
                <input
                  type="number"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(Number(e.target.value))}
                  className="h-7 w-24 rounded border border-slate-300 bg-white px-2 text-right font-mono text-xs focus:ring-1 focus:ring-cyan-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-slate-50/80 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300 text-xs">Diagnostic X-Ray & CBC Laboratory</span>
                <input
                  type="number"
                  value={labFee}
                  onChange={(e) => setLabFee(Number(e.target.value))}
                  className="h-7 w-24 rounded border border-slate-300 bg-white px-2 text-right font-mono text-xs focus:ring-1 focus:ring-cyan-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-between p-1.5 rounded bg-slate-50/80 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300 text-xs">Prescribed Pharmaceuticals (Antibiotics)</span>
                <input
                  type="number"
                  value={medsFee}
                  onChange={(e) => setMedsFee(Number(e.target.value))}
                  className="h-7 w-24 rounded border border-slate-300 bg-white px-2 text-right font-mono text-xs focus:ring-1 focus:ring-cyan-700 focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Statutory Calculation Ledger */}
      <div className="lg:col-span-5 space-y-2.5">
        <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Statutory Ledger & Tax Summary
            </h3>
            <button
              type="button"
              onClick={() => setShowBillingModal(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-800 hover:underline"
            >
              <Printer className="h-3 w-3" />
              <span>Print SOA</span>
            </button>
          </div>

          <div className="mt-2 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span className="font-sans">Gross Total (VAT-Inclusive):</span>
              <span className="font-semibold text-slate-900 dark:text-white">{formatPhp(discountCalculation.grossAmount)}</span>
            </div>

            {patientType !== 'NONE' ? (
              <>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="font-sans">Less 12% VAT Exemption:</span>
                  <span className="text-emerald-700 font-semibold">Exempted</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span className="font-sans">VAT-Exempt Base:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{formatPhp(discountCalculation.vatExemptBase)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span className="font-sans">Less 20% Statutory Discount:</span>
                  <span>- {formatPhp(discountCalculation.discountAmount)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span className="font-sans">Value Added Tax (12% VAT):</span>
                <span>{formatPhp(discountCalculation.vatAmount)}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline font-sans">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Net Payable (PHP):</span>
              <span className="text-lg font-bold font-mono text-cyan-900 dark:text-cyan-300">
                {formatPhp(discountCalculation.netPayablePhp)}
              </span>
            </div>
          </div>

          {paymentDone ? (
            <div className="mt-3 rounded bg-emerald-50 p-2.5 border border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Payment Received (OR #OR-2026-4482)
              </div>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                Payment reconciled and recorded to patient account.
              </p>
              {invoiceId && (
                <div className="font-mono text-[10px] text-emerald-800 dark:text-emerald-300">
                  Invoice ID: {invoiceId}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 space-y-1.5">
              <button
                type="button"
                disabled={loading}
                onClick={handleProcessPayment}
                className="w-full h-8 flex items-center justify-center gap-1.5 rounded bg-slate-900 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 transition disabled:opacity-60"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Accept Cash Payment ({formatPhp(discountCalculation.netPayablePhp)})
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleProcessPayment}
                className="w-full h-8 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-2xs"
              >
                GCash / Maya / Card POS
              </button>
            </div>
          )}

          <div className="mt-2.5 rounded bg-amber-50 p-2 border border-amber-200 text-[10px] text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200 flex items-start gap-1.5">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong>RA 9994 / RA 10754:</strong> Senior Citizen ID or PWD ID number must be recorded on the official receipt.
            </div>
          </div>
        </div>
      </div>

      {/* Printable Statement Modal */}
      <PrintableBillingModal
        isOpen={showBillingModal}
        onClose={() => setShowBillingModal(false)}
        branch={branch}
        statementNo="SOA-2026-4482"
        patient={{
          name: 'Juan Dela Cruz',
          age: 67,
          gender: 'Male',
          address: 'East Tapinac, Olongapo City, Zambales',
          philhealth: '12-345678901-2',
          discountType: patientType,
          discountId: 'OSCA-MKT-2021-9982',
        }}
        items={billingItems}
      />
    </div>
  );
}
