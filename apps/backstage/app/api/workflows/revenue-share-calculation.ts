/**
 * Revenue Share Calculation & Distribution Workflow
 * Calculate and distribute revenue shares to merchants, affiliates, and platform
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  createWorkflowStep,
  withStepBulkhead,
  withStepMonitoring,
  withStepTimeout,
} from '@repo/orchestration';

// Input schemas
const RevenueShareInput = z.object({
  calculationConfig: z.object({
    currency: z.string().default('USD'),
    exchangeRateDate: z.string().datetime().optional(),
    includeAdjustments: z.boolean().default(true),
    includeRefunds: z.boolean().default(true),
    includeTax: z.boolean().default(false),
    mode: z.enum(['standard', 'promotional', 'custom']).default('standard'),
  }),
  payoutConfig: z.object({
    fee: z.object({
      fixed: z.number().default(0),
      percentage: z.number().default(0.025), // 2.5%
    }),
    holdDays: z.number().default(7),
    method: z.enum(['bank_transfer', 'paypal', 'stripe', 'check', 'hold']).default('bank_transfer'),
    minimumPayout: z.number().default(50.0),
    schedule: z.enum(['immediate', 'weekly', 'monthly', 'quarterly']).default('monthly'),
  }),
  period: z.object({
    type: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).default('monthly'),
    end: z.string().datetime(),
    start: z.string().datetime(),
  }),
  reportingConfig: z.object({
    auditTrail: z.boolean().default(true),
    detailedBreakdown: z.boolean().default(true),
    generateInvoices: z.boolean().default(true),
    sendNotifications: z.boolean().default(true),
  }),
  scope: z.object({
    affiliates: z.array(z.string()).optional(),
    all: z.boolean().default(false),
    channels: z.array(z.string()).optional(),
    merchants: z.array(z.string()).optional(),
  }),
});

// Revenue share model schema
const RevenueShareModel = z.object({
  conditions: z
    .array(
      z.object({
        type: z.enum(['volume', 'performance', 'quality', 'retention']),
        adjustment: z.number(),
        operator: z.enum(['gte', 'lte', 'eq', 'between']),
        value: z.union([z.number(), z.array(z.number())]),
      }),
    )
    .optional(),
  entityId: z.string(),
  entityType: z.enum(['merchant', 'affiliate', 'platform', 'partner']),
  maximumShare: z.number().optional(),
  minimumShare: z.number().optional(),
  shareType: z.enum(['percentage', 'fixed', 'tiered', 'performance']),
  shareValue: z.number(),
  tiers: z
    .array(
      z.object({
        rate: z.number(),
        threshold: z.number(),
      }),
    )
    .optional(),
});

// Transaction schema
const RevenueTransaction = z.object({
  affiliateId: z.string().optional(),
  amount: z.object({
    fees: z.number(),
    gross: z.number(),
    net: z.number(),
    shipping: z.number(),
    tax: z.number(),
  }),
  channelId: z.string(),
  commission: z.object({
    affiliate: z.number().optional(),
    merchant: z.number(),
    platform: z.number(),
  }),
  merchantId: z.string(),
  metadata: z.record(z.any()),
  orderId: z.string(),
  productId: z.string(),
  status: z.enum(['completed', 'refunded', 'disputed', 'cancelled']),
  timestamp: z.string().datetime(),
  transactionId: z.string(),
});

// Step factory for revenue calculations
const revenueCalculatorFactory = createWorkflowStep(
  {
    name: 'Revenue Calculator',
    category: 'finance',
    tags: ['revenue', 'calculation', 'commission'],
    version: '1.0.0',
  },
  async (context) => {
    const { config, shareModels, transactions } = context.input;
    const calculations = [];

    for (const transaction of transactions) {
      const calculation = await calculateTransactionRevenue(transaction, shareModels, config);
      calculations.push(calculation);
    }

    return calculations;
  },
);

// Mock revenue calculation
async function calculateTransactionRevenue(
  transaction: any,
  shareModels: any[],
  config: any,
): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 5));

  const netAmount = transaction.amount.gross - transaction.amount.tax - transaction.amount.shipping;
  const calculations = {
    adjustments: [],
    netAmount,
    shares: {},
    total: 0,
    transactionId: transaction.transactionId,
  };

  // Calculate merchant share
  const merchantModel = shareModels.find(
    (m) => m.entityId === transaction.merchantId && m.entityType === 'merchant',
  );
  if (merchantModel) {
    const merchantShare = calculateShare(netAmount, merchantModel, transaction);
    calculations.shares.merchant = {
      adjustments: merchantShare.adjustments,
      amount: merchantShare.amount,
      baseAmount: netAmount,
      entityId: transaction.merchantId,
      shareRate: merchantModel.shareValue,
    };
    calculations.total += merchantShare.amount;
  }

  // Calculate affiliate share
  if (transaction.affiliateId) {
    const affiliateModel = shareModels.find(
      (m) => m.entityId === transaction.affiliateId && m.entityType === 'affiliate',
    );
    if (affiliateModel) {
      const affiliateShare = calculateShare(netAmount, affiliateModel, transaction);
      calculations.shares.affiliate = {
        adjustments: affiliateShare.adjustments,
        amount: affiliateShare.amount,
        baseAmount: netAmount,
        entityId: transaction.affiliateId,
        shareRate: affiliateModel.shareValue,
      };
      calculations.total += affiliateShare.amount;
    }
  }

  // Platform share (remainder)
  const platformShare = netAmount - calculations.total;
  calculations.shares.platform = {
    amount: platformShare,
    entityId: 'platform',
    percentage: (platformShare / netAmount) * 100,
  };

  return calculations;
}

function calculateShare(baseAmount: number, model: any, transaction: any): any {
  let amount = 0;
  const adjustments = [];

  switch (model.shareType) {
    case 'percentage':
      amount = baseAmount * (model.shareValue / 100);
      break;
    case 'fixed':
      amount = model.shareValue;
      break;
    case 'tiered':
      amount = calculateTieredShare(baseAmount, model.tiers);
      break;
    case 'performance':
      amount = calculatePerformanceShare(baseAmount, model, transaction);
      break;
  }

  // Apply conditions and adjustments
  if (model.conditions) {
    for (const condition of model.conditions) {
      const adjustment = evaluateCondition(condition, transaction);
      if (adjustment !== 0) {
        adjustments.push({
          type: condition.type,
          adjustment,
          reason: `Performance adjustment based on ${condition.type}`,
        });
        amount += adjustment;
      }
    }
  }

  // Apply min/max limits
  if (model.minimumShare) {
    amount = Math.max(amount, model.minimumShare);
  }
  if (model.maximumShare) {
    amount = Math.min(amount, model.maximumShare);
  }

  return { adjustments, amount };
}

function calculateTieredShare(amount: number, tiers: any[]): number {
  let totalShare = 0;
  let remainingAmount = amount;

  for (const tier of tiers) {
    const tierAmount = Math.min(remainingAmount, tier.threshold);
    totalShare += tierAmount * (tier.rate / 100);
    remainingAmount -= tierAmount;

    if (remainingAmount <= 0) break;
  }

  return totalShare;
}

function calculatePerformanceShare(amount: number, model: any, transaction: any): number {
  // Simulate performance-based calculation
  const performanceScore = 0.8 + Math.random() * 0.2; // 80-100%
  return amount * (model.shareValue / 100) * performanceScore;
}

function evaluateCondition(condition: any, transaction: any): number {
  // Mock condition evaluation
  const value = Math.random() * 100;
  let meets = false;

  switch (condition.operator) {
    case 'gte':
      meets = value >= condition.value;
      break;
    case 'lte':
      meets = value <= condition.value;
      break;
    case 'eq':
      meets = Math.abs(value - condition.value) < 0.1;
      break;
    case 'between':
      meets = value >= condition.value[0] && value <= condition.value[1];
      break;
  }

  return meets ? condition.adjustment : 0;
}

// Step 1: Collect revenue transactions
export const collectRevenueTransactionsStep = compose(
  createStepWithValidation(
    'collect-transactions',
    async (input: z.infer<typeof RevenueShareInput>) => {
      const { period, scope } = input;

      let transactions = [];

      // Fetch transactions based on scope
      if (scope.all) {
        transactions = await fetchAllTransactions(period);
      } else {
        if (scope.merchants) {
          const merchantTxs = await fetchTransactionsByMerchants(scope.merchants, period);
          transactions.push(...merchantTxs);
        }
        if (scope.affiliates) {
          const affiliateTxs = await fetchTransactionsByAffiliates(scope.affiliates, period);
          transactions.push(...affiliateTxs);
        }
        if (scope.channels) {
          const channelTxs = await fetchTransactionsByChannels(scope.channels, period);
          transactions.push(...channelTxs);
        }
      }

      // Remove duplicates
      const uniqueTransactions = Array.from(
        new Map(transactions.map((t) => [t.transactionId, t])).values(),
      );

      return {
        ...input,
        collectionStarted: new Date().toISOString(),
        periodSummary: {
          days: Math.ceil(
            (new Date(period.end).getTime() - new Date(period.start).getTime()) /
              (24 * 60 * 60 * 1000),
          ),
          end: period.end,
          start: period.start,
        },
        totalTransactions: uniqueTransactions.length,
        transactions: uniqueTransactions,
      };
    },
    (input) => !!input.period.start && !!input.period.end,
    (output) => output.transactions.length > 0,
  ),
  (step) => withStepTimeout(step, { execution: 180000 }), // 3 minutes
  (step) =>
    withStepMonitoring(step, {
      enableDetailedLogging: true,
      metricsToTrack: ['periodDays'],
    }),
);

// Mock transaction fetching functions
async function fetchAllTransactions(period: any): Promise<any[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const count = 5000 + Math.floor(Math.random() * 5000);
  return generateMockTransactions(count, period);
}

async function fetchTransactionsByMerchants(merchantIds: string[], period: any): Promise<any[]> {
  const transactions = await fetchAllTransactions(period);
  return transactions.filter((t) => merchantIds.includes(t.merchantId));
}

async function fetchTransactionsByAffiliates(affiliateIds: string[], period: any): Promise<any[]> {
  const transactions = await fetchAllTransactions(period);
  return transactions.filter((t) => t.affiliateId && affiliateIds.includes(t.affiliateId));
}

async function fetchTransactionsByChannels(channelIds: string[], period: any): Promise<any[]> {
  const transactions = await fetchAllTransactions(period);
  return transactions.filter((t) => channelIds.includes(t.channelId));
}

function generateMockTransactions(count: number, period: any): any[] {
  const startTime = new Date(period.start).getTime();
  const endTime = new Date(period.end).getTime();

  return Array.from({ length: count }, (_, i) => {
    const grossAmount = 10 + Math.random() * 990;
    const tax = grossAmount * 0.08;
    const shipping = Math.random() > 0.7 ? 5 + Math.random() * 15 : 0;
    const fees = grossAmount * 0.03;
    const net = grossAmount - tax - shipping - fees;

    return {
      affiliateId: Math.random() > 0.4 ? `affiliate_${Math.floor(Math.random() * 100)}` : undefined,
      amount: {
        fees,
        gross: grossAmount,
        net,
        shipping,
        tax,
      },
      channelId: ['web', 'mobile', 'app', 'social'][Math.floor(Math.random() * 4)],
      commission: {
        affiliate: net * 0.1,
        merchant: net * 0.7,
        platform: net * 0.2,
      },
      merchantId: `merchant_${Math.floor(Math.random() * 50)}`,
      metadata: {
        country: ['US', 'UK', 'DE', 'FR', 'CA'][Math.floor(Math.random() * 5)],
        device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
      },
      orderId: `ord_${Math.floor(i / 2)}`,
      productId: `prod_${Math.floor(Math.random() * 1000)}`,
      status:
        Math.random() > 0.05
          ? 'completed'
          : ['refunded', 'disputed', 'cancelled'][Math.floor(Math.random() * 3)],
      timestamp: new Date(startTime + Math.random() * (endTime - startTime)).toISOString(),
      transactionId: `txn_${i}`,
    };
  });
}

// Step 2: Load revenue share models
export const loadRevenueShareModelsStep = createStep('load-share-models', async (data: any) => {
  const { transactions } = data;

  // Extract unique entities
  const merchants = new Set(transactions.map((t: any) => t.merchantId));
  const affiliates = new Set(transactions.map((t: any) => t.affiliateId).filter(Boolean));

  // Load share models for all entities
  const shareModels = [];

  // Merchant models
  for (const merchantId of merchants) {
    const model = (await loadMerchantShareModel(merchantId)) as any;
    shareModels.push(model);
  }

  // Affiliate models
  for (const affiliateId of affiliates) {
    const model = (await loadAffiliateShareModel(affiliateId)) as any;
    shareModels.push(model);
  }

  // Platform model
  const platformModel = await loadPlatformShareModel();
  shareModels.push(platformModel);

  return {
    ...data,
    entityCounts: {
      affiliates: affiliates.size,
      merchants: merchants.size,
      totalModels: shareModels.length,
    },
    shareModels,
  };
});

async function loadMerchantShareModel(merchantId: string): Promise<any> {
  // Mock model loading
  await new Promise((resolve) => setTimeout(resolve, 10));

  return {
    conditions: [
      {
        type: 'volume',
        adjustment: 5, // +$5 bonus for high volume
        operator: 'gte',
        value: 10000,
      },
    ],
    entityId: merchantId,
    entityType: 'merchant',
    minimumShare: 50,
    shareType: 'percentage',
    shareValue: 70 + Math.random() * 20, // 70-90%
  };
}

async function loadAffiliateShareModel(affiliateId: string): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 10));

  const shareTypes = ['percentage', 'tiered', 'performance'];
  const shareType = shareTypes[Math.floor(Math.random() * shareTypes.length)];

  const model: any = {
    entityId: affiliateId,
    entityType: 'affiliate',
    shareType,
  };

  switch (shareType) {
    case 'percentage':
      model.shareValue = 5 + Math.random() * 10; // 5-15%
      break;
    case 'tiered':
      model.tiers = [
        { rate: 8, threshold: 1000 },
        { rate: 10, threshold: 5000 },
        { rate: 12, threshold: Infinity },
      ];
      break;
    case 'performance':
      model.shareValue = 8 + Math.random() * 7; // 8-15% based on performance
      break;
  }

  return model;
}

async function loadPlatformShareModel(): Promise<any> {
  return {
    entityId: 'platform',
    entityType: 'platform',
    shareType: 'percentage',
    shareValue: 100, // Takes remainder
  };
}

// Step 3: Calculate revenue shares
export const calculateRevenueSharesStep = compose(
  createStep('calculate-shares', async (data: any) => {
    const { calculationConfig, shareModels, transactions } = data;

    // Filter transactions based on configuration
    let eligibleTransactions = transactions;

    if (!calculationConfig.includeRefunds) {
      eligibleTransactions = eligibleTransactions.filter((t: any) => t.status !== 'refunded');
    }

    // Process transactions in batches
    const batchSize = 1000;
    const allCalculations = [];

    for (let i = 0; i < eligibleTransactions.length; i += batchSize) {
      const batch = eligibleTransactions.slice(i, i + batchSize);

      const batchCalculations = await revenueCalculatorFactory.handler({
        input: {
          config: calculationConfig,
          shareModels,
          transactions: batch,
        },
      });

      allCalculations.push(...batchCalculations);

      console.log(
        `Calculated revenue shares for ${Math.min(i + batchSize, eligibleTransactions.length)}/${eligibleTransactions.length} transactions`,
      );
    }

    // Aggregate by entity
    const aggregatedShares = aggregateShares(allCalculations);

    return {
      ...data,
      aggregatedShares,
      calculationStats: {
        totalRevenue: allCalculations.reduce((sum: number, calc: any) => sum + calc.netAmount, 0),
        totalShares: Object.values(aggregatedShares).reduce(
          (sum: number, share: any) => sum + share.totalAmount,
          0,
        ),
        totalTransactions: eligibleTransactions.length,
      },
      revenueCalculations: allCalculations,
    };
  }),
  (step) =>
    withStepBulkhead(step, {
      maxConcurrent: 10,
      maxQueued: 50,
    }),
);

function aggregateShares(calculations: any[]): Record<string, any> {
  const aggregated: Record<string, any> = {};

  calculations.forEach((calc) => {
    Object.entries(calc.shares).forEach(([type, share]: [string, any]) => {
      if (!share.entityId) return;

      const key = `${type}_${share.entityId}`;
      if (!aggregated[key]) {
        aggregated[key] = {
          adjustments: [],
          averageShare: 0,
          entityId: share.entityId,
          entityType: type,
          totalAmount: 0,
          transactionCount: 0,
        };
      }

      aggregated[key].totalAmount += share.amount;
      aggregated[key].transactionCount += 1;
      if (share.adjustments) {
        aggregated[key].adjustments.push(...share.adjustments);
      }
    });
  });

  // Calculate averages
  Object.values(aggregated).forEach((share: any) => {
    share.averageShare = share.totalAmount / share.transactionCount;
  });

  return aggregated;
}

// Step 4: Apply adjustments and reconciliations
export const applyAdjustmentsStep = createStep('apply-adjustments', async (data: any) => {
  const { aggregatedShares, calculationConfig } = data;
  const adjustedShares = { ...aggregatedShares };
  const appliedAdjustments = [];

  if (calculationConfig.includeAdjustments) {
    // Apply manual adjustments
    const manualAdjustments = await fetchManualAdjustments(data.period);

    for (const adjustment of manualAdjustments) {
      const shareKey = `${adjustment.entityType}_${adjustment.entityId}`;
      if (adjustedShares[shareKey]) {
        adjustedShares[shareKey].totalAmount += adjustment.amount;
        appliedAdjustments.push({
          ...adjustment,
          applied: true,
          appliedAt: new Date().toISOString(),
        });
      }
    }

    // Apply promotional bonuses
    const promotionalBonuses = calculatePromotionalBonuses(adjustedShares);
    for (const bonus of promotionalBonuses) {
      const shareKey = `${bonus.entityType}_${bonus.entityId}`;
      if (adjustedShares[shareKey]) {
        adjustedShares[shareKey].totalAmount += bonus.amount;
        appliedAdjustments.push(bonus);
      }
    }
  }

  return {
    ...data,
    adjustedShares,
    adjustmentStats: {
      manualAdjustments: appliedAdjustments.filter((a) => a.type === 'manual').length,
      promotionalBonuses: appliedAdjustments.filter((a) => a.type === 'promotional').length,
      totalAdjustmentAmount: appliedAdjustments.reduce((sum, adj) => sum + adj.amount, 0),
    },
    appliedAdjustments,
  };
});

async function fetchManualAdjustments(period: any): Promise<any[]> {
  // Mock manual adjustments
  return [
    {
      type: 'manual',
      adjustmentId: 'adj_1',
      amount: 500,
      approvedBy: 'admin_user',
      entityId: 'merchant_1',
      entityType: 'merchant',
      reason: 'Quality bonus for exceptional performance',
    },
    {
      type: 'manual',
      adjustmentId: 'adj_2',
      amount: -100,
      approvedBy: 'finance_team',
      entityId: 'affiliate_5',
      entityType: 'affiliate',
      reason: 'Chargeback penalty',
    },
  ];
}

function calculatePromotionalBonuses(shares: Record<string, any>): any[] {
  const bonuses: any[] = [];

  // High volume bonus
  Object.values(shares).forEach((share: any) => {
    if (share.entityType === 'merchant' && share.totalAmount > 50000) {
      bonuses.push({
        type: 'promotional',
        amount: share.totalAmount * 0.02, // 2% bonus
        bonusId: `promo_${share.entityId}`,
        entityId: share.entityId,
        entityType: 'merchant',
        reason: 'High volume bonus',
      });
    }
  });

  return bonuses;
}

// Step 5: Calculate payout amounts
export const calculatePayoutAmountsStep = createStep('calculate-payouts', async (data: any) => {
  const { adjustedShares, payoutConfig } = data;
  const payouts = [];
  const heldPayouts = [];

  for (const share of Object.values(adjustedShares)) {
    const payout = calculatePayout(share as any, payoutConfig);

    if (payout.amount >= payoutConfig.minimumPayout && payout.status === 'eligible') {
      payouts.push(payout);
    } else {
      heldPayouts.push({
        ...payout,
        status: payout.amount < payoutConfig.minimumPayout ? 'below_minimum' : payout.status,
      });
    }
  }

  return {
    ...data,
    heldPayouts,
    payouts,
    payoutSummary: {
      heldAmount: heldPayouts.reduce((sum: number, p: any) => sum + p.grossAmount, 0),
      totalAmount: payouts.reduce((sum: number, p: any) => sum + p.amount, 0),
      totalFees: payouts.reduce((sum: number, p: any) => sum + p.fee, 0),
      totalPayouts: payouts.length,
    },
  };
});

function calculatePayout(share: any, config: any): any {
  const grossAmount = share.totalAmount;
  const fixedFee = config.fee.fixed;
  const percentageFee = grossAmount * config.fee.percentage;
  const totalFee = fixedFee + percentageFee;
  const netAmount = grossAmount - totalFee;

  // Check hold conditions
  const holdUntil = new Date();
  holdUntil.setDate(holdUntil.getDate() + config.holdDays);

  return {
    amount: netAmount,
    createdAt: new Date().toISOString(),
    currency: 'USD',
    entityId: share.entityId,
    entityType: share.entityType,
    fee: totalFee,
    grossAmount,
    holdUntil: holdUntil.toISOString(),
    method: config.method,
    payoutId: `payout_${share.entityId}_${Date.now()}`,
    periodCovered: {
      end: new Date().toISOString(),
      start: new Date().toISOString(),
    },
    status: netAmount >= config.minimumPayout ? 'eligible' : 'held',
    transactionCount: share.transactionCount,
  };
}

// Step 6: Process payout instructions
export const processPayoutInstructionsStep = createStep('process-payouts', async (data: any) => {
  const { payoutConfig, payouts } = data;
  const processedPayouts = [];
  const failedPayouts = [];

  for (const payout of payouts) {
    try {
      const processed = await processPayoutInstruction(payout, payoutConfig);
      processedPayouts.push(processed);
    } catch (error) {
      failedPayouts.push({
        ...payout,
        error: (error as Error).message,
        failedAt: new Date().toISOString(),
      });
    }
  }

  return {
    ...data,
    failedPayouts,
    processedPayouts,
    processingStats: {
      failed: failedPayouts.length,
      successful: processedPayouts.length,
      successRate: processedPayouts.length / payouts.length,
    },
  };
});

async function processPayoutInstruction(payout: any, config: any): Promise<any> {
  // Simulate payout processing
  await new Promise((resolve) => setTimeout(resolve, 100));

  const success = Math.random() > 0.02; // 98% success rate

  if (!success) {
    throw new Error('Payment processing failed');
  }

  return {
    ...payout,
    estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
    paymentMethod: {
      type: config.method,
      details: generatePaymentDetails(config.method),
    },
    processedAt: new Date().toISOString(),
    status: 'processed',
    transactionId: `pay_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
}

function generatePaymentDetails(method: string): any {
  switch (method) {
    case 'bank_transfer':
      return {
        accountNumber: '****1234',
        bankName: 'Example Bank',
        routingNumber: '****5678',
      };
    case 'paypal':
      return {
        email: 'example@paypal.com',
      };
    case 'stripe':
      return {
        accountId: 'acct_1234567890',
      };
    default:
      return {};
  }
}

// Step 7: Generate invoices and statements
export const generateInvoicesStep = createStep('generate-invoices', async (data: any) => {
  const { period, processedPayouts, reportingConfig } = data;

  if (!reportingConfig.generateInvoices) {
    return {
      ...data,
      invoiceGenerationSkipped: true,
    };
  }

  const invoices = [];
  const statements = [];

  for (const payout of processedPayouts) {
    // Generate invoice
    const invoice = await generateInvoice(payout, period);
    invoices.push(invoice);

    // Generate statement
    if (reportingConfig.detailedBreakdown) {
      const statement = await generateDetailedStatement(payout, data);
      statements.push(statement);
    }
  }

  return {
    ...data,
    documentStats: {
      invoicesGenerated: invoices.length,
      statementsGenerated: statements.length,
    },
    invoices,
    statements,
  };
});

async function generateInvoice(payout: any, period: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  return {
    currency: payout.currency,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    entityId: payout.entityId,
    entityType: payout.entityType,
    fees: payout.fee,
    generatedAt: new Date().toISOString(),
    invoiceId: `inv_${payout.payoutId}`,
    lineItems: [
      {
        amount: payout.grossAmount,
        description: 'Revenue share commission',
        quantity: payout.transactionCount,
        unitPrice: payout.grossAmount / payout.transactionCount,
      },
    ],
    period: {
      end: period.end,
      start: period.start,
    },
    status: 'generated',
    subtotal: payout.grossAmount,
    total: payout.amount,
  };
}

async function generateDetailedStatement(payout: any, data: any): Promise<any> {
  return {
    breakdown: {
      adjustments:
        data.appliedAdjustments?.filter((adj: any) => adj.entityId === payout.entityId) || [],
      byChannel: generateChannelBreakdown(),
      byProduct: generateProductBreakdown(),
    },
    entityId: payout.entityId,
    generatedAt: new Date().toISOString(),
    statementId: `stmt_${payout.payoutId}`,
    summary: {
      fees: payout.fee,
      grossRevenue: payout.grossAmount,
      netPayout: payout.amount,
      totalTransactions: payout.transactionCount,
    },
  };
}

function generateChannelBreakdown(): any[] {
  return [
    { channel: 'web', revenue: 15000, transactions: 150 },
    { channel: 'mobile', revenue: 8000, transactions: 100 },
    { channel: 'app', revenue: 6000, transactions: 75 },
  ];
}

function generateProductBreakdown(): any[] {
  return [
    { productId: 'prod_1', revenue: 8000, transactions: 50 },
    { productId: 'prod_2', revenue: 12000, transactions: 75 },
    { productId: 'prod_3', revenue: 9000, transactions: 100 },
  ];
}

// Step 8: Send notifications
export const sendNotificationsStep = createStep('send-notifications', async (data: any) => {
  const { failedPayouts, processedPayouts, reportingConfig } = data;

  if (!reportingConfig.sendNotifications) {
    return {
      ...data,
      notificationsSkipped: true,
    };
  }

  const notifications = [];

  // Notify successful payouts
  for (const payout of processedPayouts) {
    const notification = await sendPayoutNotification(payout, 'success');
    notifications.push(notification);
  }

  // Notify failed payouts
  for (const payout of failedPayouts) {
    const notification = await sendPayoutNotification(payout, 'failed');
    notifications.push(notification);
  }

  // Send summary to finance team
  const summaryNotification = await sendSummaryNotification(data);
  notifications.push(summaryNotification);

  return {
    ...data,
    notifications,
    notificationStats: {
      failed: notifications.filter((n) => !n.sent).length,
      sent: notifications.filter((n) => n.sent).length,
    },
  };
});

async function sendPayoutNotification(payout: any, type: 'success' | 'failed'): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  const sent = Math.random() > 0.05; // 95% success rate

  return {
    type: `payout_${type}`,
    channel: 'email',
    content: {
      amount: payout.amount,
      payoutId: payout.payoutId,
      subject: type === 'success' ? 'Payout Processed' : 'Payout Failed',
    },
    entityId: payout.entityId,
    notificationId: `notif_${payout.payoutId}`,
    sent,
    sentAt: sent ? new Date().toISOString() : undefined,
  };
}

async function sendSummaryNotification(data: any): Promise<any> {
  return {
    type: 'payout_summary',
    channel: 'email',
    content: {
      failures: data.failedPayouts?.length || 0,
      subject: 'Revenue Share Payout Summary',
      totalAmount: data.payoutSummary?.totalAmount || 0,
      totalPayouts: data.processedPayouts?.length || 0,
    },
    notificationId: `summary_${Date.now()}`,
    recipient: 'finance_team',
    sent: true,
    sentAt: new Date().toISOString(),
  };
}

// Step 9: Create audit trail
export const createAuditTrailStep = createStep('create-audit-trail', async (data: any) => {
  const { reportingConfig } = data;

  if (!reportingConfig.auditTrail) {
    return {
      ...data,
      auditTrailSkipped: true,
    };
  }

  const auditEntries = [];

  // Audit calculation process
  auditEntries.push({
    action: 'revenue_calculation',
    details: {
      sharesCalculated: Object.keys(data.aggregatedShares || {}).length,
      totalRevenue: data.calculationStats?.totalRevenue,
      transactionsProcessed: data.totalTransactions,
    },
    entryId: `audit_calc_${Date.now()}`,
    timestamp: new Date().toISOString(),
  });

  // Audit payout processing
  auditEntries.push({
    action: 'payout_processing',
    details: {
      totalPaidOut: data.payoutSummary?.totalAmount || 0,
      payoutsFailed: data.failedPayouts?.length || 0,
      payoutsProcessed: data.processedPayouts?.length || 0,
    },
    entryId: `audit_payout_${Date.now()}`,
    timestamp: new Date().toISOString(),
  });

  // Audit adjustments
  if (data.appliedAdjustments?.length > 0) {
    auditEntries.push({
      action: 'adjustments_applied',
      details: {
        adjustmentCount: data.appliedAdjustments.length,
        totalAdjustment: data.adjustmentStats?.totalAdjustmentAmount,
      },
      entryId: `audit_adj_${Date.now()}`,
      timestamp: new Date().toISOString(),
    });
  }

  return {
    ...data,
    auditComplete: true,
    auditTrail: auditEntries,
  };
});

// Step 10: Generate revenue share report
export const generateRevenueShareReportStep = createStep('generate-report', async (data: any) => {
  const {
    adjustmentStats,
    calculationStats,
    payoutSummary,
    period,
    processingStats,
    totalTransactions,
  } = data;

  const report = {
    adjustments: {
      applied: adjustmentStats?.manualAdjustments || 0,
      bonuses: adjustmentStats?.promotionalBonuses || 0,
      totalAmount: adjustmentStats?.totalAdjustmentAmount || 0,
    },
    distributions: {
      byEntityType: calculateDistributionByType(data.aggregatedShares || {}),
      payoutMethods: analyzePayoutMethods(data.processedPayouts || []),
      topRecipients: getTopRecipients(data.aggregatedShares || {}),
    },
    performance: {
      averageProcessingTime: calculateAverageProcessingTime(data),
      complianceScore: calculateComplianceScore(data),
      errorRate: calculateErrorRate(data),
    },
    period: {
      type: period.type,
      end: period.end,
      start: period.start,
    },
    recommendations: generateRevenueRecommendations(data),
    reportId: `revenue_share_${Date.now()}`,
    summary: {
      processingSuccessRate: processingStats?.successRate || 0,
      totalFees: payoutSummary?.totalFees || 0,
      totalPayoutAmount: payoutSummary?.totalAmount || 0,
      totalPayouts: payoutSummary?.totalPayouts || 0,
      totalRevenue: calculationStats?.totalRevenue || 0,
      totalShares: calculationStats?.totalShares || 0,
      transactionsProcessed: totalTransactions,
    },
    timestamp: new Date().toISOString(),
  };

  return {
    ...data,
    report,
    revenueShareComplete: true,
  };
});

function calculateDistributionByType(shares: Record<string, any>): any {
  const distribution = { affiliate: 0, merchant: 0, platform: 0 };

  Object.values(shares).forEach((share: any) => {
    distribution[share.entityType as any] += share.totalAmount;
  });

  const total = Object.values(distribution).reduce((sum, amount) => sum + amount, 0);

  return {
    amounts: distribution,
    percentages: {
      affiliate: (distribution.affiliate / total) * 100,
      merchant: (distribution.merchant / total) * 100,
      platform: (distribution.platform / total) * 100,
    },
  };
}

function getTopRecipients(shares: Record<string, any>): any[] {
  return Object.values(shares)
    .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
    .slice(0, 10)
    .map((share: any) => ({
      amount: share.totalAmount,
      entityId: share.entityId,
      entityType: share.entityType,
      transactionCount: share.transactionCount,
    }));
}

function analyzePayoutMethods(payouts: any[]): any {
  const methods = { bank_transfer: 0, check: 0, paypal: 0, stripe: 0 };

  payouts.forEach((payout) => {
    methods[payout.method as any as any] = (methods[payout.method] || 0) + 1;
  });

  return methods;
}

function calculateAverageProcessingTime(data: any): number {
  // Mock calculation
  return 150 + Math.random() * 100; // 150-250ms average
}

function calculateErrorRate(data: any): number {
  const total = (data.processedPayouts?.length || 0) + (data.failedPayouts?.length || 0);
  return total > 0 ? (data.failedPayouts?.length || 0) / total : 0;
}

function calculateComplianceScore(data: any): number {
  // Mock compliance scoring
  let score = 100;

  // Deduct for failed payouts
  if (data.processingStats?.successRate < 0.98) {
    score -= (1 - data.processingStats.successRate) * 50;
  }

  // Deduct for notification failures
  if (data.notificationStats?.failed > 0) {
    score -=
      (data.notificationStats.failed /
        (data.notificationStats.sent + data.notificationStats.failed)) *
      10;
  }

  return Math.max(score, 0);
}

function generateRevenueRecommendations(data: any): any[] {
  const recommendations = [];

  // High failure rate
  if (data.processingStats?.successRate < 0.95) {
    recommendations.push({
      type: 'high_failure_rate',
      action: 'review_payment_providers',
      message: `Payout success rate of ${(data.processingStats.successRate * 100).toFixed(1)}% is below target`,
      priority: 'high',
    });
  }

  // Many held payouts
  if (data.heldPayouts?.length > data.payouts?.length * 0.2) {
    recommendations.push({
      type: 'high_held_payouts',
      action: 'consider_lowering_minimum_payout',
      message: 'High number of payouts below minimum threshold',
      priority: 'medium',
    });
  }

  // Fee optimization
  const totalFees = data.payoutSummary?.totalFees || 0;
  const totalAmount = data.payoutSummary?.totalAmount || 0;
  if (totalFees / totalAmount > 0.05) {
    recommendations.push({
      type: 'high_fee_ratio',
      action: 'negotiate_better_payment_rates',
      message: 'Payout fees are high relative to payout amounts',
      priority: 'low',
    });
  }

  return recommendations;
}

// Main workflow definition
export const revenueShareCalculationWorkflow = {
  id: 'revenue-share-calculation',
  name: 'Revenue Share Calculation & Distribution',
  config: {
    concurrency: {
      max: 3, // Limit concurrent revenue jobs
    },
    maxDuration: 3600000, // 1 hour
    schedule: {
      cron: '0 2 1 * *', // Monthly on 1st at 2 AM
      timezone: 'UTC',
    },
  },
  description: 'Calculate and distribute revenue shares to merchants, affiliates, and platform',
  features: {
    auditTrail: true,
    automatedPayouts: true,
    invoiceGeneration: true,
    multiEntitySupport: true,
    tieredCommissions: true,
  },
  steps: [
    collectRevenueTransactionsStep,
    loadRevenueShareModelsStep,
    calculateRevenueSharesStep,
    applyAdjustmentsStep,
    calculatePayoutAmountsStep,
    processPayoutInstructionsStep,
    generateInvoicesStep,
    sendNotificationsStep,
    createAuditTrailStep,
    generateRevenueShareReportStep,
  ],
  version: '1.0.0',
};
