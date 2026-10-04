'use client';

// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useState } from 'react';
import { CLINIC_BRANCHES, BranchLocation } from '@/lib/ph-constants';
import { StaffUser, INITIAL_STAFF_USERS } from '@/lib/user-management-store';
import { UnifiedClinicalWorkbench } from '@/components/UnifiedClinicalWorkbench';

export default function ClinicalWorkbenchPage() {
  const [currentBranch, setCurrentBranch] = useState<BranchLocation>(CLINIC_BRANCHES[0]);
  const [currentUser, setCurrentUser] = useState<StaffUser>(INITIAL_STAFF_USERS[0]); // Default: Dr. Florence Espinosa

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white font-sans text-slate-900 antialiased">
      <UnifiedClinicalWorkbench
        currentBranch={currentBranch}
        currentUser={currentUser}
        staffList={INITIAL_STAFF_USERS}
        onSwitchBranch={setCurrentBranch}
        onSwitchUser={setCurrentUser}
        initialPatientId="pat-105"
        initialTab="Tasks"
        initialNav="patients"
      />
    </div>
  );
}
