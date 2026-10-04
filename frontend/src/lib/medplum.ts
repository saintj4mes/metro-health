// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MedplumClient } from '@medplum/core';

const MEDPLUM_BASE_URL =
  process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL || process.env.MEDPLUM_BASE_URL || 'http://localhost:8103/';

/**
 * Singleton client instance for the browser context
 */
let clientInstance: MedplumClient | undefined;

export function getMedplumClient(): MedplumClient {
  if (typeof window === 'undefined') {
    // In server environment (Server Components / Route Handlers), create a fresh instance
    return new MedplumClient({
      baseUrl: MEDPLUM_BASE_URL,
    });
  }

  // In browser, retain singleton
  if (!clientInstance) {
    clientInstance = new MedplumClient({
      baseUrl: MEDPLUM_BASE_URL,
    });
  }

  return clientInstance;
}

export { MedplumClient };
