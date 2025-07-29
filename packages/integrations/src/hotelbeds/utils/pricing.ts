// Pricing utilities for Disney hotel bookings
import { Rate } from '../types/hotels';

export interface PriceBreakdown {
  description: string;
  amount: number;
  type: 'Room' | 'Tax' | 'Resort Fee' | 'Supplement' | 'Discount';
  date?: string;
  details?: {
    baseAmount?: number;
    discountAmount?: number;
    taxAmount?: number;
    promotionCode?: string;
  };
}

export function calculateTotalPrice(
  rates: Rate[],
  _addOns: {
    parkTickets?: {
      type: 'Base' | 'ParkHopper' | 'ParkHopperPlus';
      geniePlus: boolean;
    };
    dining?: {
      plan: boolean;
      character: boolean;
    };
    memoryMaker?: boolean;
    specialEvents?: string[];
  },
) {
  let total = 0;

  // Base room rate with taxes and surcharges
  rates.forEach(rate => {
    // Base rate
    total += rate.net;

    // Add taxes if not included
    if (rate.taxes && !rate.taxes.allIncluded) {
      rate.taxes.tax.forEach(tax => {
        if (!tax.included) {
          total += tax.amount || 0;
        }
      });
    }

    // Apply any rate discounts
    if (rate.rateBreakDown?.rateDiscount) {
      rate.rateBreakDown.rateDiscount.forEach(discount => {
        total -= discount.amount;
      });
    }

    // Add any rate supplements
    if (rate.rateBreakDown?.rateSupplement) {
      rate.rateBreakDown.rateSupplement.forEach(supplement => {
        total += supplement.amount;
      });
    }
  });

  return total;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateDailyRates(rate: Rate): PriceBreakdown[] {
  const breakdown: PriceBreakdown[] = [];

  if (rate.dailyRates) {
    rate.dailyRates.forEach((dailyRate, index) => {
      breakdown.push({
        description: `Room rate for day ${index + 1}`,
        amount: dailyRate.dailyNet,
        type: 'Room',
        details: {
          baseAmount: dailyRate.dailySellingRate,
          discountAmount: dailyRate.dailySellingRate - dailyRate.dailyNet,
        },
      });
    });
  } else {
    // Fallback to single rate
    breakdown.push({
      description: 'Room rate',
      amount: rate.net,
      type: 'Room',
      details: {
        baseAmount: rate.sellingRate,
        discountAmount: rate.sellingRate - rate.net,
      },
    });
  }

  return breakdown;
}

export function calculateTaxesAndFees(rate: Rate): PriceBreakdown[] {
  const breakdown: PriceBreakdown[] = [];

  if (rate.taxes && !rate.taxes.allIncluded) {
    rate.taxes.tax.forEach(tax => {
      if (!tax.included && tax.amount) {
        breakdown.push({
          description: tax.type,
          amount: tax.amount,
          type: 'Tax',
          details: {
            taxAmount: tax.amount,
          },
        });
      }
    });
  }

  return breakdown;
}

export function calculateDiscounts(rate: Rate): PriceBreakdown[] {
  const breakdown: PriceBreakdown[] = [];

  if (rate.rateBreakDown?.rateDiscount) {
    rate.rateBreakDown.rateDiscount.forEach(discount => {
      breakdown.push({
        description: discount.name || 'Discount',
        amount: -discount.amount, // Negative amount for discounts
        type: 'Discount',
        details: {
          discountAmount: discount.amount,
          promotionCode: discount.code,
        },
      });
    });
  }

  return breakdown;
}
