'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import {
  Users,
  Calendar,
  ClipboardList,
  Activity,
  Stethoscope,
  FileText,
  Receipt,
  Building2,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  HelpCircle,
  UserCheck,
  ChevronDown,
  User,
  History,
} from 'lucide-react';
import { BranchLocation } from '@/lib/ph-constants';
import { StaffUser, formatBranchAccessLabel } from '@/lib/user-management-store';

export type NavItem =
  | 'queue'
  | 'patients'
  | 'schedule'
  | 'admit'
  | 'triage'
  | 'consult'
  | 'billing'
  | 'claims'
  | 'branches'
  | 'chart'
  | 'users'
  | 'audit';

interface SidebarProps {
  currentNav: NavItem;
  onNavigate: (item: NavItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentBranch: BranchLocation;
  currentUser: StaffUser;
  staffList: StaffUser[];
  onSwitchUser: (user: StaffUser) => void;
}

export function Sidebar({
  currentNav,
  onNavigate,
  collapsed,
  onToggleCollapse,
  currentBranch,
  currentUser,
  staffList,
  onSwitchUser,
}: SidebarProps) {
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);

  const navSections = [
    {
      title: 'Operations',
      items: [
        { id: 'queue' as NavItem, label: "Today's Queue", icon: ClipboardList },
        { id: 'schedule' as NavItem, label: 'Appointment Book', icon: Calendar },
        { id: 'patients' as NavItem, label: 'Patient Directory', icon: Users },
        { id: 'admit' as NavItem, label: 'New Admission', icon: UserPlus },
      ],
    },
    {
      title: 'Clinical Care',
      items: [
        { id: 'triage' as NavItem, label: 'Nurse Triage Unit', icon: Activity },
        { id: 'consult' as NavItem, label: 'Doctor Consultations', icon: Stethoscope },
      ],
    },
    {
      title: 'Financial & Claims',
      items: [
        { id: 'billing' as NavItem, label: 'Cashier & Billing', icon: Receipt },
        { id: 'claims' as NavItem, label: 'PhilHealth eClaims', icon: ShieldCheck },
      ],
    },
    {
      title: 'Facility',
      items: [{ id: 'branches' as NavItem, label: 'Clinic Branches', icon: Building2 }],
    },
    // Administration: ONLY visible to Main Doctor / Medical Director
    ...(currentUser?.role === 'MAIN_DOCTOR'
      ? [
          {
            title: 'Administration',
            items: [
              {
                id: 'users' as NavItem,
                label: 'User & Access Control',
                icon: ShieldCheck,
              },
              {
                id: 'audit' as NavItem,
                label: 'Activity & Audit Trail',
                icon: History,
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 bg-white transition-all duration-200 ease-in-out dark:border-slate-800 dark:bg-slate-900 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-sm">
              MH
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                Metro Health <span className="text-cyan-700 dark:text-cyan-400">PH</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">EHR Clinical System</span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm">
            M
          </div>
        )}

        {/* Collapse Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Active Clinic Facility Card */}
      {!collapsed && (
        <div className="mx-2.5 mt-2.5 p-2 rounded border border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-start gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-200/70 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {currentBranch.name.replace('Metro Health - ', '')}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {currentBranch.address.city}, {currentBranch.address.province}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3.5">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-0.5">
            {!collapsed && (
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`group flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? 'bg-slate-100 font-semibold text-slate-900 dark:bg-slate-800 dark:text-white border-l-2 border-cyan-800'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isActive ? 'text-cyan-800 dark:text-cyan-400' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  {!collapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom User / Session Context & Persona Switcher */}
      <div className="relative border-t border-slate-200 p-2.5 dark:border-slate-800">
        {!collapsed ? (
          <div>
            <div
              onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
              className="flex items-center gap-2.5 rounded-lg p-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 cursor-pointer transition"
              title="Click to simulate switching active clinic staff account"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200 text-xs font-bold">
                {currentUser?.name
                  ? currentUser.name
                      .split(' ')
                      .filter((w) => !w.startsWith('Dr.'))
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('') || 'MD'
                  : 'MD'}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate text-xs font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{(currentUser?.name || 'Dr. Florence Espinosa').split(',')[0]}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </div>
                <div className="truncate text-[10px] text-slate-500 font-medium">
                  {currentUser?.role || 'MAIN_DOCTOR'} &middot; {currentUser?.branchAccess === 'ALL' ? 'All Branches' : 'Single Branch'}
                </div>
              </div>
            </div>

            {/* Persona Switcher Dropdown */}
            {personaDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setPersonaDropdownOpen(false)}
                />
                <div className="absolute bottom-16 left-2 right-2 z-40 rounded-lg border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-1 mb-1">
                    Simulate Logged-in Staff Role
                  </div>
                  <div className="space-y-1 max-h-56 overflow-y-auto">
                    {staffList.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          onSwitchUser(user);
                          setPersonaDropdownOpen(false);
                        }}
                        className={`w-full text-left p-1.5 rounded text-xs transition flex items-center justify-between ${
                          user.id === currentUser.id
                            ? 'bg-slate-100 font-bold text-slate-900 dark:bg-slate-700 dark:text-white'
                            : 'hover:bg-slate-50 text-slate-600 dark:hover:bg-slate-700/50 dark:text-slate-300'
                        }`}
                      >
                        <div className="min-w-0 truncate">
                          <div className="font-semibold truncate">{user.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {user.role} ({user.branchAccess === 'ALL' ? 'All Branches' : 'Assigned'})
                          </div>
                        </div>
                        {user.id === currentUser.id && (
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-700 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div
            onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
            className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200 cursor-pointer"
            title={currentUser.name}
          >
            MD
          </div>
        )}
      </div>
    </aside>
  );
}
