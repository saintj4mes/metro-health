'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState, useMemo } from 'react';
import {
  AuditLogEntry,
  INITIAL_AUDIT_LOGS,
  downloadAuditCsv,
} from '@/lib/audit-trail-store';
import { BranchLocation, CLINIC_BRANCHES } from '@/lib/ph-constants';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Eye,
  X,
  Building2,
  Calendar,
  Layers,
  Lock,
} from 'lucide-react';

interface AuditTrailViewProps {
  currentBranch: BranchLocation;
}

export function AuditTrailView({ currentBranch }: AuditTrailViewProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedLogForJson, setSelectedLogForJson] = useState<AuditLogEntry | null>(null);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Branch filter
      if (selectedBranchId !== 'ALL' && log.branchId !== selectedBranchId) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'ALL' && log.securityCategory !== selectedCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchActor = log.actor.name.toLowerCase().includes(q) || log.actor.role.toLowerCase().includes(q);
        const matchPatient = log.patient?.name.toLowerCase().includes(q) || log.patient?.philhealth?.toLowerCase().includes(q);
        const matchAction = log.actionLabel.toLowerCase().includes(q);
        const matchTerminal = log.actor.terminal.toLowerCase().includes(q) || log.actor.ipAddress.includes(q);
        const matchFhir = log.fhirResourceId.toLowerCase().includes(q);
        const matchDetails = log.details.toLowerCase().includes(q);
        if (!matchActor && !matchPatient && !matchAction && !matchTerminal && !matchFhir && !matchDetails) {
          return false;
        }
      }
      return true;
    });
  }, [logs, selectedBranchId, selectedCategory, searchQuery]);

  // Metrics
  const stats = useMemo(() => {
    const total = logs.length;
    const privacy = logs.filter((l) => l.securityCategory === 'PRIVACY_READ').length;
    const clinical = logs.filter((l) => l.securityCategory === 'CLINICAL_MODIFICATION').length;
    const financial = logs.filter((l) => l.securityCategory === 'FINANCIAL_TRANSACTION').length;
    const security = logs.filter((l) => l.securityCategory === 'RBAC_SECURITY').length;
    return { total, privacy, clinical, financial, security };
  }, [logs]);

  // Construct FHIR R4 AuditEvent resource representation
  const generateFhirAuditEventJson = (log: AuditLogEntry) => {
    return {
      resourceType: 'AuditEvent',
      id: log.id,
      meta: {
        versionId: '1',
        lastUpdated: log.timestamp,
        security: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-Confidentiality',
            code: 'R',
            display: 'Restricted - RA 10173 DPA Compliant',
          },
        ],
      },
      type: {
        system: 'http://dicom.nema.org/resources/ontology/DCM',
        code: log.actionType,
        display: log.actionLabel,
      },
      action: log.actionType.startsWith('CHART') ? 'R' : 'C',
      recorded: log.timestamp,
      outcome: '0',
      outcomeDesc: log.outcome,
      agent: [
        {
          type: {
            text: log.actor.role,
          },
          who: {
            identifier: {
              system: 'https://prc.gov.ph/license',
              value: log.actor.prcLicense || 'UNLICENSED_STAFF',
            },
            display: log.actor.name,
          },
          requestor: true,
          network: {
            address: log.actor.ipAddress,
            type: '2', // IP Address
          },
        },
      ],
      source: {
        site: log.branchName,
        observer: {
          display: log.actor.terminal,
        },
        type: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/security-source-type',
            code: '3',
            display: 'Web Server EHR Application',
          },
        ],
      },
      entity: log.patient
        ? [
            {
              what: {
                reference: `Patient/${log.patient.id}`,
                display: log.patient.name,
              },
              type: {
                system: 'http://terminology.hl7.org/CodeSystem/audit-entity-type',
                code: '1',
                display: 'Person',
              },
              role: {
                system: 'http://terminology.hl7.org/CodeSystem/object-role',
                code: '1',
                display: 'Patient',
              },
              detail: [
                {
                  type: 'PhilHealthPIN',
                  valueString: log.patient.philhealth || 'NONE',
                },
                {
                  type: 'TargetResource',
                  valueString: log.fhirResourceId,
                },
              ],
            },
          ]
        : [
            {
              what: {
                reference: log.fhirResourceId,
              },
              type: {
                system: 'http://terminology.hl7.org/CodeSystem/audit-entity-type',
                code: '2',
                display: 'System Object',
              },
            },
          ],
    };
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'PRIVACY_READ':
        return 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
      case 'CLINICAL_MODIFICATION':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
      case 'FINANCIAL_TRANSACTION':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800';
      case 'RBAC_SECURITY':
        return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-2.5">
      {/* 1. Header Bar */}
      <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-cyan-800 dark:text-cyan-400" />
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Compliance Audit Trail & Activity Logs
              </h1>
              <span className="rounded bg-cyan-100 px-1.5 py-0.2 text-[10px] font-semibold text-cyan-800 border border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800">
                RA 10173 DPA & FHIR R4
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Electronic ledger tracking patient record accesses, diagnostic notes, electronic prescriptions, and billing transactions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadAuditCsv(filteredLogs, selectedBranchId === 'ALL' ? 'All_Branches' : selectedBranchId)}
              className="inline-flex items-center gap-1.5 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition shadow-2xs"
            >
              <Download className="h-3 w-3 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Regulatory Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="rounded border border-slate-200 bg-white p-2 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-semibold text-slate-500 block">Total Entries</span>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <strong className="text-sm sm:text-base font-bold font-mono text-slate-900 dark:text-white">{stats.total}</strong>
            <span className="text-[9px] text-slate-400">Events</span>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-2 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-semibold text-sky-700 dark:text-sky-400 block">Privacy Reads</span>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <strong className="text-sm sm:text-base font-bold font-mono text-sky-800 dark:text-sky-300">{stats.privacy}</strong>
            <span className="text-[9px] text-slate-400">Chart views</span>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-2 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 block">Clinical Updates</span>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <strong className="text-sm sm:text-base font-bold font-mono text-emerald-800 dark:text-emerald-300">{stats.clinical}</strong>
            <span className="text-[9px] text-slate-400">SOAP, Rx</span>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-2 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 block">Financial & Billing</span>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <strong className="text-sm sm:text-base font-bold font-mono text-indigo-800 dark:text-indigo-300">{stats.financial}</strong>
            <span className="text-[9px] text-slate-400">Invoices</span>
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-white p-2 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 block">RBAC & Security</span>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <strong className="text-sm sm:text-base font-bold font-mono text-amber-800 dark:text-amber-300">{stats.security}</strong>
            <span className="text-[9px] text-slate-400">Permissions</span>
          </div>
        </div>
      </div>

      {/* 3. Filters & Search Strip */}
      <div className="rounded-lg border border-slate-200 bg-white p-2 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search actor, patient, PIN, IP, or FHIR ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-7 rounded border border-slate-300 bg-white pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-cyan-700 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="h-7 rounded border border-slate-300 bg-white px-2 text-xs text-slate-800 focus:border-cyan-700 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Network Branches (3)</option>
              {CLINIC_BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-7 rounded border border-slate-300 bg-white px-2 text-xs text-slate-800 focus:border-cyan-700 focus:outline-hidden dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Categories</option>
              <option value="PRIVACY_READ">Privacy Read (Chart)</option>
              <option value="CLINICAL_MODIFICATION">Clinical Modification</option>
              <option value="FINANCIAL_TRANSACTION">Financial & Billing</option>
              <option value="RBAC_SECURITY">RBAC & Security</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Tabular Audit Log Stream */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800 dark:border-slate-700">
              <tr>
                <th className="px-3 py-1.5">Timestamp</th>
                <th className="px-3 py-1.5">Action & Event</th>
                <th className="px-3 py-1.5">Actor</th>
                <th className="px-3 py-1.5">Patient Record</th>
                <th className="px-3 py-1.5">Branch</th>
                <th className="px-3 py-1.5">FHIR Target</th>
                <th className="px-3 py-1.5 text-right">Raw FHIR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500">
                    No audit records found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    {/* Timestamp */}
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      <div className="font-mono font-medium text-slate-800 dark:text-slate-200">
                        {log.formattedTime}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        {log.timestamp}
                      </div>
                    </td>

                    {/* Action & Category */}
                    <td className="px-3 py-1.5">
                      <div className="font-semibold text-slate-900 dark:text-white text-xs">
                        {log.actionLabel}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-block rounded px-1 py-0.1 text-[9px] font-semibold border ${getCategoryBadgeClass(log.securityCategory)}`}>
                          {log.securityCategory.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate max-w-xs block">
                          {log.details}
                        </span>
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="px-3 py-1.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {log.actor.name}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {log.actor.role}
                        {log.actor.prcLicense && (
                          <span className="ml-1 text-[9px] font-mono text-cyan-800 dark:text-cyan-400">
                            (PRC: {log.actor.prcLicense})
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        {log.actor.terminal} • {log.actor.ipAddress}
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="px-3 py-1.5">
                      {log.patient ? (
                        <>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {log.patient.name}
                          </div>
                          {log.patient.philhealth && (
                            <div className="text-[9px] font-mono text-slate-500">
                              PIN: {log.patient.philhealth}
                            </div>
                          )}
                          {log.patient.seniorOrPwd && (
                            <div className="text-[9px] font-medium text-amber-700 dark:text-amber-400">
                              {log.patient.seniorOrPwd}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 text-xs italic">System / Network</span>
                      )}
                    </td>

                    {/* Branch */}
                    <td className="px-3 py-1.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {log.branchName}
                      </span>
                    </td>

                    {/* FHIR Target & Outcome */}
                    <td className="px-3 py-1.5 whitespace-nowrap">
                      <div className="font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                        {log.fhirResourceId}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400">
                          {log.outcome}
                        </span>
                      </div>
                    </td>

                    {/* Action: View Raw FHIR */}
                    <td className="px-3 py-1.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedLogForJson(log)}
                        className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
                      >
                        <FileCode className="h-3 w-3 text-cyan-800 dark:text-cyan-400" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Raw FHIR AuditEvent JSON Inspector Modal */}
      {selectedLogForJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-lg border border-slate-300 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-3.5 py-2 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="h-3.5 w-3.5 text-cyan-800 dark:text-cyan-400" />
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  AuditEvent Resource Payload
                </h3>
                <span className="font-mono text-[10px] text-slate-500">
                  [{selectedLogForJson.id}]
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogForJson(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3 max-h-[65vh] overflow-y-auto">
              <div className="mb-1 text-[10px] text-slate-500 flex items-center justify-between">
                <span>HL7 FHIR R4 AuditEvent</span>
                <span className="font-mono text-[10px]">application/fhir+json</span>
              </div>
              <pre className="rounded bg-slate-950 p-2.5 text-[10px] font-mono text-cyan-300 overflow-x-auto leading-relaxed border border-slate-800">
                {JSON.stringify(generateFhirAuditEventJson(selectedLogForJson), null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3.5 py-2 dark:border-slate-800 dark:bg-slate-900">
              <span className="text-[10px] text-slate-500">
                Philippine DPA (RA 10173 Section 12/13 Compliant)
              </span>
              <button
                type="button"
                onClick={() => setSelectedLogForJson(null)}
                className="rounded bg-slate-800 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-900 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
