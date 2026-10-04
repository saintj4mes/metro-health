'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { BranchLocation, calculatePhilippineDiscount, formatPhp } from '@/lib/ph-constants';
import { FhirService } from '@/lib/fhir-service';
import {
  CreditCard,
  Receipt,
  Tag,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Printer,
  Plus,
  Trash2,
  ShieldCheck,
  Banknote,
  QrCode,
  FileCheck,
} from 'lucide-react';
import { PrintableBillingModal, BillingLineItem } from './PrintableBillingModal';

interface BillingViewProps {
  branch: BranchLocation;
  onClearQueue?: () => void;
}

export function BillingView({ branch, onClearQueue }: BillingViewProps) {
  const [patientType, setPatientType] = useState<'SENIOR' | 'PWD' | 'NONE'>('SENIOR');
  const [philHealthDeduction, setPhilHealthDeduction] = useState(500); // Konsulta benefit credit
  const [paymentDone, setPaymentDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'GCASH' | 'CARD'>('CASH');
  const [amountTendered, setAmountTendered] = useState<number>(2000);

  const [billingItems, setBillingItems] = useState<BillingLineItem[]>([
    { id: '1', description: 'Obstetrics & Gynecology Specialist Consultation', category: 'Consultation', qty: 1, unitPrice: 1000, amount: 1000 },
    { id: '2', description: 'Pelvic & Transvaginal Diagnostic Ultrasound', category: 'Diagnostic / Lab', qty: 1, unitPrice: 1200, amount: 1200 },
    { id: '3', description: 'Prescribed Oral Antibiotics & Prenatal Vitamins Course', category: 'Pharmacy', qty: 1, unitPrice: 850, amount: 850 },
  ]);

  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemAmount, setNewItemAmount] = useState<number>(0);
  const [newItemCategory, setNewItemCategory] = useState<BillingLineItem['category']>('Diagnostic / Lab');

  const grossTotal = billingItems.reduce((sum, item) => sum + item.amount, 0);
  const baseDiscountCalc = calculatePhilippineDiscount(grossTotal, patientType, true);
  const netPayable = Math.max(0, baseDiscountCalc.netPayablePhp - philHealthDeduction);
  const changeDue = Math.max(0, amountTendered - netPayable);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemDesc || newItemAmount <= 0) return;
    const newItem: BillingLineItem = {
      id: String(Date.now()),
      description: newItemDesc,
      category: newItemCategory,
      qty: 1,
      unitPrice: newItemAmount,
      amount: newItemAmount,
    };
    setBillingItems([...billingItems, newItem]);
    setNewItemDesc('');
    setNewItemAmount(0);
    setPaymentDone(false);
  };

  const handleRemoveItem = (id: string) => {
    setBillingItems(billingItems.filter((i) => i.id !== id));
    setPaymentDone(false);
  };

  const handleProcessPayment = async () => {
    setLoading(true);
    try {
      const invoice = await FhirService.recordPayment({
        patientId: 'pat-101',
        grossAmount: baseDiscountCalc.grossAmount,
        netPayable: netPayable,
        discountType: patientType,
        discountAmount: baseDiscountCalc.discountAmount + philHealthDeduction,
        receiptNumber: 'OR-2026-4482',
      });
      setInvoiceId(invoice.id || 'inv-2026-4482');
      setPaymentDone(true);
    } finally {
      setLoading(false);
    }
  };

  const todayTransactions = [
    { or: 'OR-2026-4481', name: 'Carmela Ramos', time: '09:50 AM', gross: 2400, net: 1714.28, mode: 'GCash' },
    { or: 'OR-2026-4480', name: 'Beatrice Mendoza', time: '09:12 AM', gross: 1800, net: 1800.00, mode: 'Cash' },
    { or: 'OR-2026-4479', name: 'Benjamin Alcantara', time: '08:45 AM', gross: 3200, net: 2285.71, mode: 'Maya' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
      {/* Left Column: Encounter Charges & PhilHealth Case Rate Integration */}
      <div className="lg:col-span-7 space-y-2.5">
        <div className="rounded border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-purple-50 text-purple-800 border border-purple-200">
                <Receipt className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 leading-none">
                  Cashier Checkout & Statutory Billing
                </h2>
                <span className="text-[11px] text-slate-500">
                  Philippine BIR VAT Exemption (RA 9994 / RA 10754) & PhilHealth Konsulta Claims
                </span>
              </div>
            </div>
            <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
              {branch.name}
            </span>
          </div>

          {/* Patient Header Details */}
          <div className="mt-2.5 p-2.5 rounded bg-slate-50 border border-slate-200">
            <div className="flex justify-between items-start text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">Juan Dela Cruz (67 y/o)</h4>
                  <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold text-amber-800 border border-amber-200">
                    Senior Citizen OSCA: MKT-2021-9982
                  </span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Encounter: <span className="font-mono text-slate-700">enc-2026-9923</span> &bull; Clinician: Dr. Florence Espinosa, MD (Ob-Gyn)
                </p>
              </div>
              <div className="text-right text-[11px]">
                <span className="block font-mono text-slate-700">PIN: 12-345678901-2</span>
                <span className="text-emerald-800 font-bold text-[10px] flex items-center justify-end gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Konsulta Eligible
                </span>
              </div>
            </div>

            {/* Philippine Statutory Privilege Selector */}
            <div className="mt-2.5 pt-2 border-t border-slate-200">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Statutory Privilege & Tax Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'SENIOR', label: 'Senior (RA 9994)', note: '20% Discount + 12% VAT Exempt' },
                  { id: 'PWD', label: 'PWD (RA 10754)', note: '20% Discount + 12% VAT Exempt' },
                  { id: 'NONE', label: 'Regular (Self-Pay)', note: 'Standard 12% VAT Applicable' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setPatientType(item.id as any);
                      setPaymentDone(false);
                    }}
                    className={`p-2 rounded border text-left transition ${
                      patientType === item.id
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-semibold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.note}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Itemized Clinical Charges Table */}
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-700">
                Itemized Clinical Services & Items
              </h4>
              <span className="text-[10px] text-slate-500">
                {billingItems.length} Billable Services
              </span>
            </div>

            <div className="rounded border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-2.5 py-1.5">Description</th>
                    <th className="px-2.5 py-1.5">Category</th>
                    <th className="px-2.5 py-1.5 text-right">Qty</th>
                    <th className="px-2.5 py-1.5 text-right">Price</th>
                    <th className="px-2.5 py-1.5 text-right">Total</th>
                    <th className="px-2 py-1.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {billingItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="px-2.5 py-2 font-medium text-slate-900">{item.description}</td>
                      <td className="px-2.5 py-2 text-[11px] text-slate-500">{item.category}</td>
                      <td className="px-2.5 py-2 text-right font-mono">{item.qty}</td>
                      <td className="px-2.5 py-2 text-right font-mono text-slate-600">{formatPhp(item.unitPrice)}</td>
                      <td className="px-2.5 py-2 text-right font-mono font-bold text-slate-900">{formatPhp(item.amount)}</td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Add Custom Billable Line Item */}
            <form onSubmit={handleAddItem} className="flex flex-wrap items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add service / medicine / lab item..."
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                className="flex-1 min-w-[180px] h-8 rounded border border-slate-200 bg-white px-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-purple-700"
              />
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                className="h-8 rounded border border-slate-200 bg-white px-2 text-xs text-slate-700"
              >
                <option value="Consultation">Consultation</option>
                <option value="Diagnostic / Lab">Diagnostic / Lab</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Procedure">Procedure</option>
                <option value="Supply">Supply / PPE</option>
              </select>
              <input
                type="number"
                placeholder="PHP"
                value={newItemAmount || ''}
                onChange={(e) => setNewItemAmount(Number(e.target.value))}
                className="w-24 h-8 rounded border border-slate-200 bg-white px-2 text-right font-mono text-xs text-slate-900"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded bg-slate-100 hover:bg-purple-50 hover:text-purple-800 hover:border-purple-300 border border-slate-200 px-3 h-8 text-xs font-semibold text-slate-700 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Charge</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column: Statutory Calculation Ledger & Settlement */}
      <div className="lg:col-span-5 space-y-2.5">
        <div className="rounded border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Statutory Tax & Settlement Ledger
            </h3>
            <button
              type="button"
              onClick={() => setShowBillingModal(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-800 hover:underline"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print SOA</span>
            </button>
          </div>

          <div className="mt-2.5 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-600">
              <span className="font-sans">Gross Total (VAT-Inclusive):</span>
              <span className="font-semibold text-slate-900">{formatPhp(baseDiscountCalc.grossAmount)}</span>
            </div>

            {patientType !== 'NONE' ? (
              <>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">Less 12% VAT Exemption:</span>
                  <span className="text-emerald-700 font-semibold">Exempted</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="font-sans">VAT-Exempt Base Amount:</span>
                  <span className="font-medium text-slate-800">{formatPhp(baseDiscountCalc.vatExemptBase)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span className="font-sans">Less 20% Statutory Privilege:</span>
                  <span>- {formatPhp(baseDiscountCalc.discountAmount)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between text-slate-600">
                <span className="font-sans">Value Added Tax (12% VAT):</span>
                <span>{formatPhp(baseDiscountCalc.vatAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-cyan-800 font-semibold pt-1 border-t border-dashed border-slate-200">
              <span className="font-sans">Less PhilHealth Konsulta Credit:</span>
              <span>- {formatPhp(philHealthDeduction)}</span>
            </div>

            <div className="pt-2 border-t-2 border-slate-200 flex justify-between items-baseline font-sans">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Net Amount Due:</span>
              <span className="text-xl font-bold font-mono text-purple-900">
                {formatPhp(netPayable)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Payment Method & Tender
            </label>
            <div className="grid grid-cols-3 gap-1.5 mb-2.5">
              {[
                { id: 'CASH', label: 'Cash Tender', icon: Banknote },
                { id: 'GCASH', label: 'GCash / Maya', icon: QrCode },
                { id: 'CARD', label: 'POS Debit/Credit', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 rounded border text-xs font-semibold transition ${
                      paymentMethod === m.id
                        ? 'border-purple-600 bg-purple-50 text-purple-900 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'CASH' && (
              <div className="grid grid-cols-2 gap-2 p-2 rounded bg-slate-50 border border-slate-200 text-xs mb-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Amount Tendered</label>
                  <input
                    type="number"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(Number(e.target.value))}
                    className="h-7 w-full rounded border border-slate-200 bg-white px-2 font-mono text-xs font-bold text-slate-900 mt-0.5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Change Due</label>
                  <div className="h-7 flex items-center font-mono font-bold text-sm text-emerald-800 mt-0.5">
                    {formatPhp(changeDue)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {paymentDone ? (
            <div className="mt-2.5 rounded bg-emerald-50 p-3 border border-emerald-200 text-emerald-950 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Payment Reconciled (Official Receipt: OR-2026-4482)</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                BIR Official Receipt issued. Medplum FHIR Account balance cleared. Patient is ready for discharge.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowBillingModal(true)}
                  className="rounded bg-emerald-700 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-800 transition"
                >
                  Print Official SOA / OR
                </button>
                {onClearQueue && (
                  <button
                    type="button"
                    onClick={onClearQueue}
                    className="rounded border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition"
                  >
                    Clear from Queue
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-2.5 space-y-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleProcessPayment}
                className="w-full h-9 flex items-center justify-center gap-1.5 rounded bg-purple-700 text-xs font-bold text-white shadow-2xs hover:bg-purple-800 transition disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <Receipt className="h-4 w-4" />
                <span>Accept Payment & Issue BIR OR ({formatPhp(netPayable)})</span>
              </button>
            </div>
          )}
        </div>

        {/* Daily Cashier Ledger Stream */}
        <div className="rounded border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
              Today's Reconciled Transactions
            </h4>
            <span className="text-[10px] font-mono text-emerald-800 font-bold">
              Total: ₱5,799.99
            </span>
          </div>
          <div className="mt-2 space-y-1.5 text-xs">
            {todayTransactions.map((tx, idx) => (
              <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{tx.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {tx.or} &bull; {tx.time} &bull; {tx.mode}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-slate-900">{formatPhp(tx.net)}</div>
                  <div className="text-[10px] text-slate-400 line-through">{formatPhp(tx.gross)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Printable Billing Modal */}
      <PrintableBillingModal
        isOpen={showBillingModal}
        onClose={() => setShowBillingModal(false)}
        branch={branch}
        statementNo="OR-2026-4482"
        statementDate="October 04, 2026"
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
        philhealthCredit={philHealthDeduction}
        paymentMethod={paymentMethod}
      />
    </div>
  );
}
