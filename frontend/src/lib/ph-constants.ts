// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

export interface BranchScheduleItem {
  day: string;
  hours: string;
  type: 'Walk-in' | 'By Appointment' | 'Surgery / Hospital Round';
}

export interface BranchLocation {
  id: string;
  name: string;
  code: string;
  address: {
    line: string;
    barangay: string;
    city: string;
    province: string;
    region: string;
    postalCode: string;
  };
  phone: string;
  operatingHours: string;
  schedules?: BranchScheduleItem[];
}

export const CLINIC_BRANCHES: BranchLocation[] = [
  {
    id: 'branch-espinosa',
    name: 'Dr. Florence Espinosa Ob-Gyn Clinic',
    code: 'EOC',
    address: {
      line: 'Rm 102 ASM Bldg 108 Fendler Street East Tapinac',
      barangay: '',
      city: 'Olongapo City',
      province: 'Zambales',
      region: 'Region III (Central Luzon)',
      postalCode: '2200',
    },
    phone: '+63 (047) 222-3108',
    operatingHours: 'Mon-Wed, Fri: 1:00 PM - 6:00 PM | Thu: 4:00 PM - 6:00 PM | Sat: 1:00 PM - 4:00 PM (Walk-in)',
    schedules: [
      { day: 'Monday', hours: '01:00 PM - 06:00 PM', type: 'Walk-in' },
      { day: 'Tuesday', hours: '01:00 PM - 06:00 PM', type: 'Walk-in' },
      { day: 'Wednesday', hours: '01:00 PM - 06:00 PM', type: 'Walk-in' },
      { day: 'Thursday', hours: '04:00 PM - 06:00 PM', type: 'Walk-in' },
      { day: 'Friday', hours: '01:00 PM - 06:00 PM', type: 'Walk-in' },
      { day: 'Saturday', hours: '01:00 PM - 04:00 PM', type: 'Walk-in' },
    ],
  },
  {
    id: 'branch-ulticare',
    name: 'Ulticare Medical Center',
    code: 'UMC',
    address: {
      line: 'Rm 12 2 National Hwy. Brgy. Barretto',
      barangay: '',
      city: 'Olongapo City',
      province: 'Zambales',
      region: 'Region III (Central Luzon)',
      postalCode: '2200',
    },
    phone: '639982108521',
    operatingHours: 'No schedule available',
    schedules: [],
  },
  {
    id: 'branch-ace',
    name: 'Allied Care Experts (ACE) Medical Center - Baypointe',
    code: 'ACE',
    address: {
      line: 'CBD Area, Subic Bay Freeport Zone',
      barangay: '',
      city: 'Olongapo City',
      province: 'Zambales',
      region: 'Region III (Central Luzon)',
      postalCode: '2222',
    },
    phone: '+63 (047) 250-6000',
    operatingHours: 'Monday: 10:00 AM - 12:00 PM (Walk-in)',
    schedules: [
      { day: 'Monday', hours: '10:00 AM - 12:00 PM', type: 'Walk-in' },
    ],
  },
];

/**
 * Philippine Statutory Discount Calculator
 * Compliant with:
 * - RA 9994 (Expanded Senior Citizens Act of 2010)
 * - RA 10754 (An Act Expanding the Benefits and Privileges of Persons with Disability)
 *
 * Rule:
 * 1. Remove 12% Value Added Tax (VAT) from VAT-inclusive gross amount:
 *    VAT-Exempt Base = Gross / 1.12
 * 2. Deduct 20% statutory discount:
 *    Net Amount = Base * 0.80
 */
export function calculatePhilippineDiscount(
  grossAmountPhp: number,
  discountType: 'NONE' | 'SENIOR' | 'PWD' | 'DIPLOMAT' = 'NONE',
  isVatInclusive: boolean = true
): {
  grossAmount: number;
  vatAmount: number;
  vatExemptBase: number;
  discountRate: number;
  discountAmount: number;
  netPayablePhp: number;
} {
  const vatRate = 0.12;
  const seniorDiscountRate = 0.20;

  if (discountType === 'NONE') {
    const vatAmount = isVatInclusive
      ? grossAmountPhp - grossAmountPhp / (1 + vatRate)
      : grossAmountPhp * vatRate;
    return {
      grossAmount: grossAmountPhp,
      vatAmount: parseFloat(vatAmount.toFixed(2)),
      vatExemptBase: grossAmountPhp,
      discountRate: 0,
      discountAmount: 0,
      netPayablePhp: parseFloat(grossAmountPhp.toFixed(2)),
    };
  }

  // Exempt from VAT (RA 9994 Sec. 4 / RA 10754)
  const vatExemptBase = isVatInclusive
    ? grossAmountPhp / (1 + vatRate)
    : grossAmountPhp;
  const vatAmountSaved = grossAmountPhp - vatExemptBase;

  // 20% Special Discount
  const discountAmount = vatExemptBase * seniorDiscountRate;
  const netPayablePhp = vatExemptBase - discountAmount;

  return {
    grossAmount: parseFloat(grossAmountPhp.toFixed(2)),
    vatAmount: parseFloat(vatAmountSaved.toFixed(2)),
    vatExemptBase: parseFloat(vatExemptBase.toFixed(2)),
    discountRate: seniorDiscountRate,
    discountAmount: parseFloat(discountAmount.toFixed(2)),
    netPayablePhp: parseFloat(netPayablePhp.toFixed(2)),
  };
}

export function formatPhp(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
}
