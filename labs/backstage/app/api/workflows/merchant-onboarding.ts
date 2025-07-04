/**
 * Merchant Onboarding & Verification Workflow
 * Automated merchant application processing, verification, and setup
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  createWorkflowStep,
  withStepMonitoring,
  withStepRetry,
  withStepTimeout,
} from '@repo/orchestration/server/next';

// Input schemas
const MerchantOnboardingInput = z.object({
  application: z.object({
    businessDetails: z.object({
      brands: z.array(z.string()).optional(),
      businessType: z.enum(['retailer', 'brand', 'distributor', 'marketplace']),
      categories: z.array(z.string()),
      fulfillmentMethods: z.array(z.enum(['direct', 'dropship', 'fba', '3pl'])),
      productCount: z.number(),
      shipsFrom: z.array(z.string()),
      shipsTo: z.array(z.string()),
    }),
    businessInfo: z.object({
      annualRevenue: z.enum(['<100k', '100k-1M', '1M-10M', '10M-50M', '50M+']),
      displayName: z.string(),
      employeeCount: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
      founded: z.string(),
      legalName: z.string(),
      registrationNumber: z.string(),
      taxId: z.string(),
      website: z.string().url(),
    }),
    compliance: z.object({
      acceptedDataProcessing: z.boolean(),
      acceptedPrivacyPolicy: z.boolean(),
      acceptedTerms: z.boolean(),
      hasPrivacyPolicy: z.boolean(),
      hasReturnPolicy: z.boolean(),
      hasTermsOfService: z.boolean(),
    }),
    contactInfo: z.object({
      address: z.object({
        city: z.string(),
        country: z.string(),
        postalCode: z.string(),
        state: z.string(),
        street1: z.string(),
        street2: z.string().optional(),
      }),
      primaryContact: z.object({
        email: z.string().email(),
        firstName: z.string(),
        lastName: z.string(),
        phone: z.string(),
        title: z.string(),
      }),
      technicalContact: z.object({
        email: z.string().email(),
        firstName: z.string(),
        lastName: z.string(),
        phone: z.string().optional(),
      }),
    }),
    integration: z.object({
      apiCapabilities: z.array(z.enum(['inventory', 'pricing', 'orders', 'tracking'])).optional(),
      feedType: z.enum(['api', 'xml', 'csv', 'manual']),
      feedUrl: z.string().url().optional(),
      updateFrequency: z.enum(['realtime', 'hourly', 'daily', 'weekly']),
    }),
  }),
  setupConfig: z.object({
    assignAccountManager: z.boolean().default(false),
    createApiKeys: z.boolean().default(true),
    enableSandbox: z.boolean().default(true),
    importInitialCatalog: z.boolean().default(true),
    setupWebhooks: z.boolean().default(true),
  }),
  verificationConfig: z.object({
    autoApprove: z.boolean().default(false),
    checks: z
      .array(
        z.enum([
          'business-registration',
          'tax-verification',
          'bank-verification',
          'address-verification',
          'website-verification',
          'compliance-check',
          'fraud-screening',
        ]),
      )
      .default(['business-registration', 'tax-verification']),
    level: z.enum(['basic', 'standard', 'enhanced']).default('standard'),
    riskThreshold: z.number().min(0).max(1).default(0.7),
  }),
});

// Verification result schema
const VerificationResult = z.object({
  checkType: z.string(),
  details: z.object({
    evidence: z.any(),
    findings: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  score: z.number().min(0).max(1),
  status: z.enum(['passed', 'failed', 'warning', 'manual_review']),
  timestamp: z.string().datetime(),
});

// Step factory for verification checks
const verificationCheckFactory = createWorkflowStep(
  {
    name: 'Verification Check',
    category: 'verification',
    tags: ['kyb', 'compliance', 'fraud-check'],
    version: '1.0.0',
  },
  async (context) => {
    const { businessInfo, checkType, config } = context.input;

    switch (checkType) {
      case 'business-registration':
        return verifyBusinessRegistration(businessInfo);
      case 'tax-verification':
        return verifyTaxId(businessInfo);
      case 'bank-verification':
        return verifyBankAccount(businessInfo);
      case 'website-verification':
        return verifyWebsite(businessInfo);
      case 'compliance-check':
        return checkCompliance(businessInfo);
      case 'fraud-screening':
        return screenForFraud(businessInfo);
      default:
        throw new Error(`Unknown verification type: ${checkType}`);
    }
  },
);

// Mock verification functions
async function verifyBusinessRegistration(businessInfo: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const score = 0.7 + Math.random() * 0.3;
  const passed = score > 0.7;

  return {
    checkType: 'business-registration',
    details: {
      evidence: {
        activeStatus: true,
        registryMatch: true,
        yearsInBusiness: new Date().getFullYear() - parseInt(businessInfo.founded),
      },
      findings: [
        `Business registered as: ${businessInfo.legalName}`,
        `Registration number verified: ${businessInfo.registrationNumber}`,
        `Active since: ${businessInfo.founded}`,
      ],
      recommendations: passed ? [] : ['Manual verification of registration documents required'],
    },
    score,
    status: passed ? 'passed' : 'manual_review',
    timestamp: new Date().toISOString(),
  };
}

async function verifyTaxId(businessInfo: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const score = 0.8 + Math.random() * 0.2;

  return {
    checkType: 'tax-verification',
    details: {
      evidence: {
        taxIdValid: true,
        nameMatch: true,
        taxStatus: 'current',
      },
      findings: [
        `Tax ID format valid: ${businessInfo.taxId.replace(/\d/g, 'X')}`,
        'Tax ID matches business name',
        'No outstanding tax issues found',
      ],
      recommendations: [],
    },
    score,
    status: 'passed',
    timestamp: new Date().toISOString(),
  };
}

async function verifyBankAccount(businessInfo: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    checkType: 'bank-verification',
    details: {
      evidence: {
        accountType: 'business',
        verificationMethod: 'micro-deposits',
      },
      findings: [
        'Bank account verification pending',
        'Micro-deposits will be sent within 1-2 business days',
      ],
      recommendations: ['Complete bank verification after micro-deposits received'],
    },
    score: 0.9,
    status: 'passed',
    timestamp: new Date().toISOString(),
  };
}

async function verifyWebsite(businessInfo: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const checks = {
    contactInfo: Math.random() > 0.1,
    privacyPolicy: Math.random() > 0.2,
    returnPolicy: Math.random() > 0.3,
    sslCertificate: Math.random() > 0.1,
    termsOfService: Math.random() > 0.2,
  };

  const score = Object.values(checks).filter((v) => v).length / Object.keys(checks).length;

  return {
    checkType: 'website-verification',
    details: {
      evidence: checks,
      findings: Object.entries(checks).map(
        ([check, passed]) => `${check}: ${passed ? 'Found' : 'Missing'}`,
      ),
      recommendations: Object.entries(checks)
        .filter(([_, passed]) => !passed)
        .map(([check]) => `Add ${check} to website`),
    },
    score,
    status: score > 0.8 ? 'passed' : score > 0.6 ? 'warning' : 'failed',
    timestamp: new Date().toISOString(),
  };
}

async function checkCompliance(businessInfo: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    checkType: 'compliance-check',
    details: {
      evidence: {
        allowedBusinessType: true,
        prohibitedCategories: [],
        restrictedCountries: [],
      },
      findings: [
        'No prohibited product categories detected',
        'Business type allowed',
        'Geographic restrictions: None',
      ],
      recommendations: [],
    },
    score: 0.95,
    status: 'passed',
    timestamp: new Date().toISOString(),
  };
}

async function screenForFraud(businessInfo: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const riskScore = Math.random() * 0.3; // Low risk for most

  return {
    checkType: 'fraud-screening',
    details: {
      evidence: {
        businessAge: 'established',
        fraudDatabaseMatches: 0,
        riskScore,
      },
      findings: [
        `Risk score: ${(riskScore * 100).toFixed(1)}%`,
        'No matches in fraud databases',
        'Business age: Established',
      ],
      recommendations: riskScore > 0.2 ? ['Enhanced monitoring recommended'] : [],
    },
    score: 1 - riskScore,
    status: riskScore < 0.2 ? 'passed' : 'warning',
    timestamp: new Date().toISOString(),
  };
}

// Step 1: Validate application
export const validateApplicationStep = compose(
  createStepWithValidation(
    'validate-application',
    async (input: z.infer<typeof MerchantOnboardingInput>) => {
      const { application } = input;

      // Additional validation beyond schema
      const validationIssues = [];

      // Check business age
      const foundedYear = parseInt(application.businessInfo.founded);
      const businessAge = new Date().getFullYear() - foundedYear;
      if (businessAge < 1) {
        validationIssues.push({
          field: 'founded',
          issue: 'Business must be at least 1 year old',
          severity: 'warning',
        });
      }

      // Check product count
      if (application.businessDetails.productCount < 10) {
        validationIssues.push({
          field: 'productCount',
          issue: 'Minimum 10 products required',
          severity: 'error',
        });
      }

      // Check compliance
      const complianceChecks = [
        application.compliance.acceptedTerms,
        application.compliance.acceptedPrivacyPolicy,
        application.compliance.acceptedDataProcessing,
      ];

      if (!complianceChecks.every((check) => check)) {
        validationIssues.push({
          field: 'compliance',
          issue: 'All compliance agreements must be accepted',
          severity: 'error',
        });
      }

      const hasErrors = validationIssues.some((issue) => issue.severity === 'error');

      return {
        ...input,
        applicationValid: !hasErrors,
        validationIssues,
        applicationId: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        submittedAt: new Date().toISOString(),
      };
    },
    (input) => !!input.application,
    (output) => output.applicationValid,
  ),
  (step: any) => withStepTimeout(step, 30000),
  (step: any) => withStepMonitoring(step),
);

// Step 2: Run business verification checks
export const runBusinessVerificationStep = compose(
  createStep('business-verification', async (data: any) => {
    const { application, verificationConfig } = data;
    const verificationResults: any[] = [];

    // Determine which checks to run
    let checksToRun = verificationConfig.checks;
    if (checksToRun.includes('all')) {
      checksToRun = [
        'business-registration',
        'tax-verification',
        'bank-verification',
        'website-verification',
        'compliance-check',
        'fraud-screening',
      ];
    }

    // Run checks in parallel
    const checkPromises = checksToRun.map((checkType: any) =>
      verificationCheckFactory.handler({
        input: {
          businessInfo: application.businessInfo,
          checkType,
          config: verificationConfig,
        },
      }),
    );

    const results = await Promise.allSettled(checkPromises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        verificationResults.push(result.value);
      } else {
        verificationResults.push({
          checkType: checksToRun[index],
          details: {
            evidence: { error: result.reason },
            findings: ['Verification check failed'],
            recommendations: ['Manual review required'],
          },
          score: 0,
          status: 'failed',
          timestamp: new Date().toISOString(),
        });
      }
    });

    // Calculate overall verification score
    const overallScore =
      verificationResults.reduce((sum, result) => sum + result.score, 0) /
      verificationResults.length;
    const overallStatus = verificationResults.some((r) => r.status === 'failed')
      ? 'failed'
      : verificationResults.some((r) => r.status === 'manual_review')
        ? 'manual_review'
        : verificationResults.some((r) => r.status === 'warning')
          ? 'warning'
          : 'passed';

    return {
      ...data,
      verificationComplete: true,
      verificationResults,
      verificationSummary: {
        checksPassed: verificationResults.filter((r) => r.status === 'passed').length,
        checksRequiringReview: verificationResults.filter((r) => r.status === 'manual_review')
          .length,
        checksRun: checksToRun.length,
        overallScore,
        overallStatus,
      },
    };
  }),
  (step: any) =>
    withStepRetry(step, {
      backoff: true,
      maxRetries: 3,
    }),
);

// Step 3: Perform risk assessment
export const performRiskAssessmentStep = createStep('risk-assessment', async (data: any) => {
  const { application, verificationResults, verificationSummary } = data;

  // Calculate risk factors
  const riskFactors = {
    businessAge: calculateBusinessAgeRisk(application.businessInfo.founded),
    businessSize: calculateBusinessSizeRisk(
      application.businessInfo.employeeCount,
      application.businessInfo.annualRevenue,
    ),
    fraudScreening: calculateFraudRisk(
      verificationResults.find((r: any) => r.checkType === 'fraud-screening'),
    ),
    geographicRisk: calculateGeographicRisk(application.contactInfo.address.country),
    verificationScore: 1 - verificationSummary.overallScore,
    websiteQuality: calculateWebsiteRisk(
      verificationResults.find((r: any) => r.checkType === 'website-verification'),
    ),
  };

  // Calculate weighted risk score
  const weights = {
    businessAge: 0.15,
    businessSize: 0.1,
    fraudScreening: 0.2,
    geographicRisk: 0.05,
    verificationScore: 0.3,
    websiteQuality: 0.2,
  };

  const riskScore = Object.entries(riskFactors).reduce(
    (sum, [factor, value]) => sum + value * weights[factor as keyof typeof weights],
    0,
  );

  const riskLevel =
    riskScore < 0.2 ? 'low' : riskScore < 0.5 ? 'medium' : riskScore < 0.7 ? 'high' : 'very_high';

  // Generate risk mitigation recommendations
  const mitigations = generateRiskMitigations(riskFactors, riskLevel);

  return {
    ...data,
    riskAssessment: {
      mitigations,
      recommendedTier: determinemerchantTier(riskScore, verificationSummary.overallScore),
      requiresManualReview: riskScore > data.verificationConfig.riskThreshold,
      riskFactors,
      riskLevel,
      riskScore,
    },
    riskAssessmentComplete: true,
  };
});

function calculateBusinessAgeRisk(founded: string): number {
  const age = new Date().getFullYear() - parseInt(founded);
  if (age >= 5) return 0;
  if (age >= 3) return 0.2;
  if (age >= 1) return 0.5;
  return 0.8;
}

function calculateBusinessSizeRisk(employeeCount: string, revenue: string): number {
  const sizeScore: Record<string, number> = {
    '1-10': 0.6,
    '11-50': 0.4,
    '51-200': 0.2,
    '201-500': 0.1,
    '500+': 0,
  };

  const revenueScore: Record<string, number> = {
    '1M-10M': 0.3,
    '10M-50M': 0.1,
    '50M+': 0,
    '100k-1M': 0.5,
    '<100k': 0.7,
  };

  return (sizeScore[employeeCount] + revenueScore[revenue]) / 2;
}

function calculateWebsiteRisk(websiteVerification: any): number {
  if (!websiteVerification) return 0.5;
  return 1 - websiteVerification.score;
}

function calculateFraudRisk(fraudScreening: any): number {
  if (!fraudScreening) return 0.5;
  return fraudScreening.details.evidence.riskScore || 0;
}

function calculateGeographicRisk(country: string): number {
  const highRiskCountries = ['XX', 'YY']; // Example blocked countries
  const mediumRiskCountries = ['ZZ'];

  if (highRiskCountries.includes(country)) return 1;
  if (mediumRiskCountries.includes(country)) return 0.5;
  return 0;
}

function generateRiskMitigations(riskFactors: any, riskLevel: string): any[] {
  const mitigations = [];

  if (riskFactors.businessAge > 0.5) {
    mitigations.push({
      factor: 'businessAge',
      priority: 'high',
      recommendation: 'Require additional financial documentation',
    });
  }

  if (riskFactors.websiteQuality > 0.5) {
    mitigations.push({
      factor: 'websiteQuality',
      priority: 'medium',
      recommendation: 'Website improvements required before approval',
    });
  }

  if (riskLevel === 'high' || riskLevel === 'very_high') {
    mitigations.push({
      factor: 'overall',
      priority: 'high',
      recommendation: 'Start with limited catalog and transaction limits',
    });
  }

  return mitigations;
}

function determinemerchantTier(riskScore: number, verificationScore: number): string {
  if (riskScore < 0.2 && verificationScore > 0.9) return 'premium';
  if (riskScore < 0.5 && verificationScore > 0.7) return 'standard';
  if (riskScore < 0.7 && verificationScore > 0.5) return 'basic';
  return 'probation';
}

// Step 4: Make approval decision
export const makeApprovalDecisionStep = createStep('approval-decision', async (data: any) => {
  const { riskAssessment, verificationConfig, verificationSummary } = data;

  let decision = 'pending';
  let reason = '';

  // Auto-approval logic
  if (
    verificationConfig.autoApprove &&
    verificationSummary.overallStatus === 'passed' &&
    riskAssessment.riskScore < verificationConfig.riskThreshold
  ) {
    decision = 'approved';
    reason = 'Auto-approved based on verification and risk assessment';
  }
  // Auto-rejection logic
  else if (
    verificationSummary.overallStatus === 'failed' ||
    riskAssessment.riskLevel === 'very_high'
  ) {
    decision = 'rejected';
    reason = 'Failed verification checks or high risk level';
  }
  // Manual review required
  else {
    decision = 'manual_review';
    reason = 'Manual review required based on verification results';
  }

  const approvalResult = {
    conditions: decision === 'approved' ? generateApprovalConditions(riskAssessment) : [],
    decision,
    merchantTier: riskAssessment.recommendedTier,
    nextSteps: generateNextSteps(decision),
    reason,
    reviewerId: decision === 'approved' ? 'system' : null,
    timestamp: new Date().toISOString(),
  };

  return {
    ...data,
    approvalDecisionMade: true,
    approvalResult,
  };
});

function generateApprovalConditions(riskAssessment: any): any[] {
  const conditions = [];

  if (riskAssessment.riskLevel !== 'low') {
    conditions.push({
      type: 'transaction_limit',
      description: 'Maximum $10,000 daily transaction volume for first 30 days',
      duration: '30_days',
    });
  }

  if (riskAssessment.riskFactors.websiteQuality > 0.3) {
    conditions.push({
      type: 'website_compliance',
      description: 'Complete website compliance requirements within 14 days',
      duration: '14_days',
    });
  }

  conditions.push({
    type: 'probation_period',
    description: '90-day probationary period with enhanced monitoring',
    duration: '90_days',
  });

  return conditions;
}

function generateNextSteps(decision: string): any[] {
  switch (decision) {
    case 'approved':
      return [
        { responsible: 'system', step: 'Send welcome email' },
        { responsible: 'system', step: 'Create merchant account' },
        { responsible: 'system', step: 'Generate API credentials' },
        { responsible: 'account_manager', step: 'Schedule onboarding call' },
      ];
    case 'manual_review':
      return [
        { responsible: 'system', step: 'Assign to review team' },
        { responsible: 'reviewer', step: 'Request additional documentation' },
        { responsible: 'reviewer', step: 'Schedule verification call' },
      ];
    case 'rejected':
      return [
        { responsible: 'system', step: 'Send rejection notification' },
        { responsible: 'system', step: 'Provide appeal process information' },
      ];
    default:
      return [];
  }
}

// Step 5: Create merchant account
export const createMerchantAccountStep = createStep('create-account', async (data: any) => {
  const { application, applicationId, approvalResult } = data;

  if (approvalResult.decision !== 'approved') {
    return {
      ...data,
      accountCreationSkipped: true,
      skipReason: 'Not approved',
    };
  }

  // Create merchant account
  const merchantAccount = {
    applicationId,
    businessInfo: {
      displayName: application.businessInfo.displayName,
      legalName: application.businessInfo.legalName,
      taxId: application.businessInfo.taxId,
    },
    contacts: {
      primary: application.contactInfo.primaryContact,
      technical: application.contactInfo.technicalContact,
    },
    createdAt: new Date().toISOString(),
    limits: generateAccountLimits(approvalResult.merchantTier),
    merchantId: `merchant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    settings: {
      categories: application.businessDetails.categories,
      feedType: application.integration.feedType,
      shippingDestinations: application.businessDetails.shipsTo,
      shippingOrigins: application.businessDetails.shipsFrom,
      updateFrequency: application.integration.updateFrequency,
    },
    status: 'active',
    tier: approvalResult.merchantTier,
  };

  return {
    ...data,
    accountCreated: true,
    merchantAccount,
  };
});

function generateAccountLimits(tier: string): any {
  const limits: Record<string, any> = {
    basic: {
      apiRateLimit: 10,
      concurrentConnections: 2,
      dailyTransactionLimit: 10000,
      maxProductCount: 10000,
    },
    premium: {
      apiRateLimit: 1000,
      concurrentConnections: 100,
      dailyTransactionLimit: 1000000,
      maxProductCount: 1000000,
    },
    probation: {
      apiRateLimit: 5,
      concurrentConnections: 1,
      dailyTransactionLimit: 1000,
      maxProductCount: 1000,
    },
    standard: {
      apiRateLimit: 100,
      concurrentConnections: 10,
      dailyTransactionLimit: 100000,
      maxProductCount: 100000,
    },
  };

  return limits[tier] || limits.basic;
}

// Step 6: Generate API credentials
export const generateAPICredentialsStep = createStep('generate-credentials', async (data: any) => {
  const { merchantAccount, setupConfig } = data;

  if (!merchantAccount || !setupConfig.createApiKeys) {
    return {
      ...data,
      credentialsSkipped: true,
    };
  }

  const credentials = {
    production: {
      apiKey: generateApiKey('prod'),
      apiSecret: generateApiSecret(),
      endpoints: {
        base: 'https://api.marketplace.com/v1',
        orders: 'https://api.marketplace.com/v1/orders',
        products: 'https://api.marketplace.com/v1/products',
        webhooks: 'https://api.marketplace.com/v1/webhooks',
      },
      environment: 'production',
      merchantId: merchantAccount.merchantId,
      rateLimit: merchantAccount.limits.apiRateLimit,
    },
    sandbox: setupConfig.enableSandbox
      ? {
          apiKey: generateApiKey('sandbox'),
          apiSecret: generateApiSecret(),
          endpoints: {
            base: 'https://sandbox-api.marketplace.com/v1',
            orders: 'https://sandbox-api.marketplace.com/v1/orders',
            products: 'https://sandbox-api.marketplace.com/v1/products',
            webhooks: 'https://sandbox-api.marketplace.com/v1/webhooks',
          },
          environment: 'sandbox',
          merchantId: `sandbox_${merchantAccount.merchantId}`,
          rateLimit: 1000,
        }
      : null,
  };

  return {
    ...data,
    apiCredentials: credentials,
    credentialsGenerated: true,
  };
});

function generateApiKey(env: string): string {
  return `${env}_${Buffer.from(Math.random().toString())
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substr(0, 32)}`;
}

function generateApiSecret(): string {
  return Buffer.from(Math.random().toString() + Date.now())
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substr(0, 48);
}

// Step 7: Setup webhooks
export const setupWebhooksStep = createStep('setup-webhooks', async (data: any) => {
  const { application, merchantAccount, setupConfig } = data;

  if (!merchantAccount || !setupConfig.setupWebhooks) {
    return {
      ...data,
      webhooksSkipped: true,
    };
  }

  const webhookEndpoints = [
    {
      id: `webhook_${Date.now()}_1`,
      url: `${application.businessInfo.website}/webhooks/marketplace`,
      events: ['order.created', 'order.updated', 'order.cancelled'],
      secret: generateWebhookSecret(),
      status: 'active',
    },
    {
      id: `webhook_${Date.now()}_2`,
      url: `${application.businessInfo.website}/webhooks/inventory`,
      events: ['inventory.low', 'inventory.out_of_stock'],
      secret: generateWebhookSecret(),
      status: 'active',
    },
  ];

  // Test webhook endpoints
  const webhookTests = await Promise.all(
    webhookEndpoints.map((endpoint) => testWebhookEndpoint(endpoint)),
  );

  return {
    ...data,
    webhookEndpoints,
    webhooksConfigured: true,
    webhookTests,
  };
});

function generateWebhookSecret(): string {
  return `whsec_${Buffer.from(Math.random().toString())
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substr(0, 32)}`;
}

async function testWebhookEndpoint(endpoint: any): Promise<any> {
  // Simulate webhook test
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    url: endpoint.url,
    endpointId: endpoint.id,
    httpStatus: Math.random() > 0.1 ? 200 : 500,
    responseTime: Math.floor(Math.random() * 500) + 100,
    testResult: Math.random() > 0.1 ? 'success' : 'failed',
  };
}

// Step 8: Import initial catalog
export const importInitialCatalogStep = createStep('import-catalog', async (data: any) => {
  const { application, merchantAccount, setupConfig } = data;

  if (!merchantAccount || !setupConfig.importInitialCatalog) {
    return {
      ...data,
      catalogImportSkipped: true,
    };
  }

  // Trigger catalog import workflow
  const importJob = {
    estimatedProducts: application.businessDetails.productCount,
    feedType: application.integration.feedType,
    feedUrl: application.integration.feedUrl,
    jobId: `import_${Date.now()}`,
    merchantId: merchantAccount.merchantId,
    scheduledAt: new Date().toISOString(),
    status: 'queued',
  };

  // Simulate initial validation
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const validationResult = {
    formatValid: true,
    estimatedDuration: Math.ceil(application.businessDetails.productCount / 1000) * 60, // seconds
    feedAccessible: true,
    sampleProducts: 10,
  };

  return {
    ...data,
    catalogValidation: validationResult,
    catalogImportInitiated: true,
    catalogImportJob: importJob,
  };
});

// Step 9: Send notifications
export const sendOnboardingNotificationsStep = createStep(
  'send-notifications',
  async (data: any) => {
    const { apiCredentials, application, approvalResult, merchantAccount } = data;
    const notifications = [];

    if (approvalResult.decision === 'approved' && merchantAccount) {
      // Welcome email
      notifications.push({
        type: 'email',
        data: {
          merchantId: merchantAccount.merchantId,
          merchantName: application.businessInfo.displayName,
          nextSteps: approvalResult.nextSteps,
          tier: merchantAccount.tier,
        },
        recipient: application.contactInfo.primaryContact.email,
        sent: true,
        template: 'merchant_welcome',
      });

      // Technical setup email
      if (apiCredentials) {
        notifications.push({
          type: 'email',
          data: {
            apiEndpoints: apiCredentials.production.endpoints,
            documentationUrl: 'https://docs.marketplace.com',
            sandboxAvailable: !!apiCredentials.sandbox,
          },
          recipient: application.contactInfo.technicalContact.email,
          sent: true,
          template: 'technical_setup',
        });
      }

      // Internal notification
      notifications.push({
        type: 'slack',
        channel: '#merchant-onboarding',
        message: `New merchant approved: ${application.businessInfo.displayName} (${merchantAccount.merchantId})`,
        sent: true,
      });
    } else if (approvalResult.decision === 'rejected') {
      // Rejection email
      notifications.push({
        type: 'email',
        data: {
          appealProcess: 'https://marketplace.com/appeal',
          businessName: application.businessInfo.displayName,
          reason: approvalResult.reason,
        },
        recipient: application.contactInfo.primaryContact.email,
        sent: true,
        template: 'application_rejected',
      });
    } else if (approvalResult.decision === 'manual_review') {
      // Review notification
      notifications.push({
        type: 'email',
        data: {
          additionalInfo: 'Our team will contact you if additional information is needed',
          businessName: application.businessInfo.displayName,
          estimatedTime: '2-3 business days',
        },
        recipient: application.contactInfo.primaryContact.email,
        sent: true,
        template: 'manual_review_required',
      });
    }

    return {
      ...data,
      notifications,
      notificationsSent: notifications.length,
    };
  },
);

// Step 10: Generate onboarding report
export const generateOnboardingReportStep = createStep('generate-report', async (data: any) => {
  const {
    apiCredentials,
    application,
    applicationId,
    approvalResult,
    catalogImportJob,
    merchantAccount,
    riskAssessment,
    verificationSummary,
    webhookEndpoints,
  } = data;

  const report = {
    application: {
      id: applicationId,
      businessName: application.businessInfo.displayName,
      submittedAt: data.submittedAt,
    },
    decision: {
      conditions: approvalResult.conditions,
      reason: approvalResult.reason,
      status: approvalResult.decision,
      tier: approvalResult.merchantTier,
    },
    reportId: `onboarding_${applicationId}`,
    risk: {
      factors: riskAssessment.riskFactors,
      level: riskAssessment.riskLevel,
      score: riskAssessment.riskScore,
    },
    setup: merchantAccount
      ? {
          apiKeysGenerated: !!apiCredentials,
          catalogImportStarted: data.catalogImportInitiated || false,
          merchantId: merchantAccount.merchantId,
          webhooksConfigured: data.webhooksConfigured || false,
        }
      : null,
    timeline: {
      accountCreated: data.accountCreated ? new Date().toISOString() : null,
      applicationReceived: data.submittedAt,
      decisionMade: data.approvalDecisionMade ? new Date().toISOString() : null,
      totalDuration: Date.now() - new Date(data.submittedAt).getTime(),
      verificationCompleted: data.verificationComplete ? new Date().toISOString() : null,
    },
    timestamp: new Date().toISOString(),
    verification: {
      checksPassed: verificationSummary.checksPassed,
      checksRun: verificationSummary.checksRun,
      details: data.verificationResults.map((r: any) => ({
        check: r.checkType,
        score: r.score,
        status: r.status,
      })),
      overallScore: verificationSummary.overallScore,
      overallStatus: verificationSummary.overallStatus,
    },
  };

  return {
    ...data,
    onboardingComplete: true,
    report,
  };
});

// Main workflow definition
export const merchantOnboardingWorkflow = {
  id: 'merchant-onboarding',
  name: 'Merchant Onboarding & Verification',
  config: {
    concurrency: {
      max: 20, // Handle multiple applications
    },
    maxDuration: 900000, // 15 minutes
  },
  description: 'Automated merchant application processing, verification, and setup',
  features: {
    apiProvisioning: true,
    autoApproval: true,
    catalogImport: true,
    riskAssessment: true,
    webhookSetup: true,
  },
  steps: [
    validateApplicationStep,
    runBusinessVerificationStep,
    performRiskAssessmentStep,
    makeApprovalDecisionStep,
    createMerchantAccountStep,
    generateAPICredentialsStep,
    setupWebhooksStep,
    importInitialCatalogStep,
    sendOnboardingNotificationsStep,
    generateOnboardingReportStep,
  ],
  version: '1.0.0',
};
