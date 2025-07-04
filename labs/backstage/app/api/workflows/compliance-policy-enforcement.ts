/**
 * Compliance & Policy Enforcement Workflow
 * Monitor and enforce marketplace policies, regulatory compliance, and content standards
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  createWorkflowStep,
  withStepCircuitBreaker,
  withStepMonitoring,
  withStepTimeout,
} from '@repo/orchestration/server/next';

// Input schemas
const ComplianceEnforcementInput = z.object({
  validationConfig: z.object({
    confidenceThreshold: z.number().min(0).max(1).default(0.7),
    batchSize: z.number().default(100),
    enableAI: z.boolean().default(true),
    humanReviewRequired: z.boolean().default(false),
  }),
  enforcementConfig: z.object({
    autoEnforce: z.boolean().default(true),
    escalationThreshold: z.number().default(0.8),
    gracePeriod: z.number().default(24), // hours
    notifyMerchants: z.boolean().default(true),
    strictMode: z.boolean().default(false),
  }),
  policyTypes: z
    .array(
      z.enum([
        'content-standards',
        'product-safety',
        'intellectual-property',
        'pricing-policies',
        'shipping-standards',
        'data-privacy',
        'age-restrictions',
        'geographic-restrictions',
        'advertising-standards',
        'return-policies',
        'tax-compliance',
        'regulatory-compliance',
      ]),
    )
    .default(['content-standards', 'product-safety']),
  reportingConfig: z.object({
    exportFormat: z.enum(['json', 'csv', 'pdf']).default('json'),
    generateReport: z.boolean().default(true),
    includeDetails: z.boolean().default(true),
    sendNotifications: z.boolean().default(true),
  }),
  scope: z.object({
    all: z.boolean().default(false),
    categories: z.array(z.string()).optional(),
    merchants: z.array(z.string()).optional(),
    newOnly: z.boolean().default(false), // Only check new items
    products: z.array(z.string()).optional(),
  }),
});

// Policy violation schema
const PolicyViolation = z.object({
  confidence: z.number().min(0).max(1),
  evidence: z.array(
    z.object({
      type: z.enum(['text', 'image', 'metadata', 'pattern']),
      content: z.string(),
      location: z.string().optional(),
    }),
  ),
  automaticAction: z.boolean(),
  description: z.string(),
  detectedAt: z.string().datetime(),
  entityId: z.string(),
  entityType: z.enum(['product', 'merchant', 'listing', 'content']),
  expiresAt: z.string().datetime().optional(),
  policyType: z.string(),
  recommendedAction: z.enum([
    'warn',
    'suspend',
    'remove',
    'delist',
    'fine',
    'require-modification',
    'escalate',
  ]),
  severity: z.number().min(0).max(1),
  violationId: z.string(),
  violationType: z.enum(['minor', 'major', 'critical']),
});

// Step factory for AI content analysis
const aiContentAnalyzerFactory = createWorkflowStep(
  {
    name: 'AI Content Analyzer',
    category: 'ai',
    tags: ['content-moderation', 'policy-enforcement', 'ml'],
    version: '1.0.0',
  },
  async (context) => {
    const { config, items, policies } = context.input;
    const violations = [];

    for (const item of items) {
      for (const policy of policies) {
        const violation = await analyzeForViolation(item, policy, config);
        if (violation) {
          violations.push(violation);
        }
      }
    }

    return violations;
  },
);

// Mock AI content analysis
async function analyzeForViolation(item: any, policy: string, config: any): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Simulate AI analysis
  const isViolation = Math.random() < 0.15; // 15% chance of violation

  if (!isViolation) return null;

  const violationType = Math.random() < 0.1 ? 'critical' : Math.random() < 0.3 ? 'major' : 'minor';

  const severity =
    violationType === 'critical'
      ? 0.8 + Math.random() * 0.2
      : violationType === 'major'
        ? 0.5 + Math.random() * 0.3
        : 0.2 + Math.random() * 0.3;

  const confidence = 0.6 + Math.random() * 0.4;

  // Skip if below confidence threshold
  if (confidence < config.confidenceThreshold) return null;

  return {
    confidence,
    evidence: generateEvidence(item, policy),
    automaticAction: violationType !== 'critical',
    description: generateViolationDescription(policy, violationType),
    detectedAt: new Date().toISOString(),
    entityId: item.id,
    entityType: item.type,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    policyType: policy,
    recommendedAction: determineRecommendedAction(violationType, severity),
    severity,
    violationId: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    violationType,
  };
}

function generateViolationDescription(policy: string, violationType: string): string {
  const descriptions = {
    'content-standards': {
      critical: 'Content contains prohibited material that must be removed immediately',
      major: 'Content violates community standards with offensive material',
      minor: 'Content may contain inappropriate language or formatting issues',
    },
    'intellectual-property': {
      critical: 'Counterfeit product identified - immediate removal required',
      major: 'Clear intellectual property violation detected',
      minor: 'Potential trademark or copyright concern requiring review',
    },
    'pricing-policies': {
      critical: 'Predatory pricing or price fixing scheme identified',
      major: 'Price manipulation or unfair pricing practices detected',
      minor: 'Pricing may not comply with fair pricing guidelines',
    },
    'product-safety': {
      critical: 'Product poses significant safety risk and must be recalled',
      major: 'Product has safety concerns that require manufacturer attention',
      minor: 'Product may not meet recommended safety guidelines',
    },
  };

  const policyDescriptions = descriptions[policy as keyof typeof descriptions];
  return (
    (policyDescriptions as any)?.[violationType] || `${violationType} ${policy} violation detected`
  );
}

function generateEvidence(item: any, policy: string): any[] {
  const evidence = [];

  // Text evidence
  if (item.title || item.description) {
    evidence.push({
      type: 'text',
      content: (item.title + ' ' + (item.description || '')).substring(0, 200),
      location: 'product_description',
    });
  }

  // Image evidence (mock)
  if (item.images && item.images.length > 0) {
    evidence.push({
      type: 'image',
      content: item.images[0],
      location: 'product_image',
    });
  }

  // Metadata evidence
  evidence.push({
    type: 'metadata',
    content: JSON.stringify({
      brand: item.brand,
      category: item.category,
      price: item.price,
    }),
    location: 'product_metadata',
  });

  return evidence;
}

function determineRecommendedAction(violationType: string, severity: number): string {
  if (violationType === 'critical') {
    return severity > 0.9 ? 'remove' : 'suspend';
  } else if (violationType === 'major') {
    return severity > 0.7 ? 'delist' : 'require-modification';
  } else {
    return severity > 0.5 ? 'warn' : 'require-modification';
  }
}

// Step 1: Collect entities for compliance check
export const collectEntitiesStep = compose(
  createStepWithValidation(
    'collect-entities',
    async (input: z.infer<typeof ComplianceEnforcementInput>) => {
      const { scope } = input;

      let entities = [];

      // Collect different entity types
      if (scope.all || scope.products) {
        const products = await fetchProductsForCompliance(scope);
        entities.push(...products.map((p) => ({ ...p, type: 'product' })));
      }

      if (scope.all || scope.merchants) {
        const merchants = await fetchMerchantsForCompliance(scope);
        entities.push(...merchants.map((m) => ({ ...m, type: 'merchant' })));
      }

      // Filter for new entities if specified
      if (scope.newOnly) {
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
        entities = entities.filter((e) => new Date(e.createdAt || e.updatedAt) > cutoff);
      }

      return {
        ...input,
        complianceCheckStarted: new Date().toISOString(),
        entities,
        entityBreakdown: {
          merchants: entities.filter((e) => e.type === 'merchant').length,
          products: entities.filter((e) => e.type === 'product').length,
        },
        totalEntities: entities.length,
      };
    },
    (input) =>
      input.scope.all || input.scope.products?.length > 0 || input.scope.merchants?.length > 0,
    (output) => output.entities.length > 0,
  ),
  (step: any) => withStepTimeout(step, 60000),
  (step: any) => withStepMonitoring(step),
);

// Mock data fetching
async function fetchProductsForCompliance(scope: any): Promise<any[]> {
  const count = scope.products?.length || 200;

  return Array.from({ length: count }, (_, i) => ({
    id: scope.products?.[i] || `prod_${i}`,
    ageRestricted: Math.random() < 0.1,
    brand: `Brand ${i % 10}`,
    category: ['Electronics', 'Clothing', 'Home', 'Health', 'Automotive'][i % 5],
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    description: generateMockProductDescription(i),
    images: [`https://example.com/product_${i}.jpg`],
    medicinal: Math.random() < 0.05,
    merchantId: `merchant_${i % 5}`,
    price: 10 + Math.random() * 1000,
    status: 'active',
    title: `Product ${i}`,
  }));
}

async function fetchMerchantsForCompliance(scope: any): Promise<any[]> {
  const count = scope.merchants?.length || 50;

  return Array.from({ length: count }, (_, i) => ({
    id: scope.merchants?.[i] || `merchant_${i}`,
    name: `Merchant ${i}`,
    businessLicense: Math.random() > 0.1,
    businessType: ['retailer', 'manufacturer', 'distributor'][i % 3],
    complianceScore: 0.5 + Math.random() * 0.5,
    country: ['US', 'UK', 'DE', 'FR', 'CA'][i % 5],
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastAudit: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    taxId: `TAX${i.toString().padStart(6, '0')}`,
    verified: Math.random() > 0.2,
  }));
}

function generateMockProductDescription(index: number): string {
  const descriptions = [
    'High-quality electronic device with advanced features and modern design.',
    'Premium clothing item made from sustainable materials.',
    'Essential home appliance for modern living.',
    'Natural health supplement with proven benefits.',
    'Automotive accessory for enhanced performance.',
    'Professional-grade tool for industrial use.',
    'Luxury item with exclusive design.',
    'Budget-friendly option without compromising quality.',
  ];

  // Add some potentially problematic content occasionally
  if (index % 20 === 0) {
    return descriptions[index % descriptions.length] + ' WARNING: Contains small parts.';
  }

  if (index % 25 === 0) {
    return descriptions[index % descriptions.length] + ' Not suitable for children under 18.';
  }

  return descriptions[index % descriptions.length];
}

// Step 2: Apply policy rules
export const applyPolicyRulesStep = createStep('apply-policies', async (data: any) => {
  const { entities, policyTypes } = data;
  const policyViolations = [];

  for (const entity of entities) {
    for (const policyType of policyTypes) {
      const violations = await checkPolicyCompliance(entity, policyType);
      policyViolations.push(...violations);
    }
  }

  return {
    ...data,
    policyCheckComplete: true,
    policyViolations,
    violationStats: {
      bySeverity: calculateViolationsBySeverity(policyViolations),
      byType: calculateViolationsByType(policyViolations),
      total: policyViolations.length,
    },
  };
});

async function checkPolicyCompliance(entity: any, policyType: string): Promise<any[]> {
  const violations = [];

  switch (policyType) {
    case 'content-standards':
      violations.push(...checkContentStandards(entity));
      break;
    case 'product-safety':
      violations.push(...checkProductSafety(entity));
      break;
    case 'intellectual-property':
      violations.push(...checkIntellectualProperty(entity));
      break;
    case 'age-restrictions':
      violations.push(...checkAgeRestrictions(entity));
      break;
    case 'geographic-restrictions':
      violations.push(...checkGeographicRestrictions(entity));
      break;
    case 'pricing-policies':
      violations.push(...checkPricingPolicies(entity));
      break;
    case 'tax-compliance':
      violations.push(...checkTaxCompliance(entity));
      break;
    case 'data-privacy':
      violations.push(...checkDataPrivacy(entity));
      break;
  }

  return violations.filter(Boolean);
}

function checkContentStandards(entity: any): any[] {
  const violations: any[] = [];

  // Check for inappropriate content
  const content = (entity.title + ' ' + (entity.description || '')).toLowerCase();
  const prohibitedWords = ['illegal', 'dangerous', 'explosive', 'weapon'];

  prohibitedWords.forEach((word) => {
    if (content.includes(word)) {
      violations.push({
        confidence: 0.9,
        evidence: [
          {
            type: 'text',
            content: content.substring(content.indexOf(word) - 20, content.indexOf(word) + 50),
            location: 'description',
          },
        ],
        automaticAction: true,
        description: `Content contains prohibited term: "${word}"`,
        detectedAt: new Date().toISOString(),
        entityId: entity.id,
        entityType: entity.type,
        policyType: 'content-standards',
        recommendedAction: 'require-modification',
        severity: 0.8,
        violationId: `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        violationType: 'major',
      });
    }
  });

  return violations;
}

function checkProductSafety(entity: any): any[] {
  const violations = [];

  if (entity.type === 'product') {
    // Check for safety-related categories
    const dangerousCategories = ['chemicals', 'electronics', 'automotive'];

    if (dangerousCategories.some((cat) => entity.category.toLowerCase().includes(cat))) {
      // Check for safety certifications (mock)
      if (!entity.safetyCertifications && Math.random() < 0.3) {
        violations.push({
          confidence: 0.8,
          evidence: [
            {
              type: 'metadata',
              content: `Category: ${entity.category}`,
              location: 'product_category',
            },
          ],
          automaticAction: false,
          description: 'Product in regulated category lacks required safety certifications',
          detectedAt: new Date().toISOString(),
          entityId: entity.id,
          entityType: 'product',
          policyType: 'product-safety',
          recommendedAction: 'require-modification',
          severity: 0.7,
          violationId: `ps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          violationType: 'major',
        });
      }
    }

    // Check for age restriction compliance
    if (entity.ageRestricted && !entity.ageVerificationRequired) {
      violations.push({
        confidence: 0.9,
        evidence: [
          {
            type: 'metadata',
            content: 'Age restricted: true, Age verification: false',
            location: 'product_settings',
          },
        ],
        automaticAction: true,
        description: 'Age-restricted product missing age verification requirement',
        detectedAt: new Date().toISOString(),
        entityId: entity.id,
        entityType: 'product',
        policyType: 'product-safety',
        recommendedAction: 'require-modification',
        severity: 0.5,
        violationId: `ps_age_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        violationType: 'minor',
      });
    }
  }

  return violations;
}

function checkIntellectualProperty(entity: any): any[] {
  const violations: any[] = [];

  if (entity.type === 'product') {
    // Check for potential trademark violations (mock)
    const protectedBrands = ['Apple', 'Nike', 'Disney', 'Microsoft', 'Google'];

    protectedBrands.forEach((brand) => {
      if (
        entity.title.toLowerCase().includes(brand.toLowerCase()) &&
        entity.brand.toLowerCase() !== brand.toLowerCase()
      ) {
        violations.push({
          confidence: 0.85,
          evidence: [
            {
              type: 'text',
              content: entity.title,
              location: 'product_title',
            },
          ],
          automaticAction: false,
          description: `Potential trademark violation for brand "${brand}"`,
          detectedAt: new Date().toISOString(),
          entityId: entity.id,
          entityType: 'product',
          policyType: 'intellectual-property',
          recommendedAction: 'remove',
          severity: 0.9,
          violationId: `ip_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          violationType: 'critical',
        });
      }
    });
  }

  return violations;
}

function checkAgeRestrictions(entity: any): any[] {
  const violations = [];

  if (entity.type === 'product') {
    // Check for age-restricted categories
    const restrictedCategories = ['alcohol', 'tobacco', 'adult', 'gambling'];
    const ageRestrictedKeywords = ['adult', '18+', 'mature', 'alcoholic'];

    const hasRestrictedCategory = restrictedCategories.some((cat) =>
      entity.category.toLowerCase().includes(cat),
    );

    const hasRestrictedKeywords = ageRestrictedKeywords.some(
      (keyword) =>
        entity.title.toLowerCase().includes(keyword) ||
        (entity.description && entity.description.toLowerCase().includes(keyword)),
    );

    if ((hasRestrictedCategory || hasRestrictedKeywords) && !entity.ageRestricted) {
      violations.push({
        confidence: 0.9,
        evidence: [
          {
            type: 'text',
            content:
              entity.title +
              (entity.description ? ` - ${entity.description.substring(0, 100)}` : ''),
            location: 'product_content',
          },
        ],
        automaticAction: true,
        description: 'Product requires age restriction but is not marked as age-restricted',
        detectedAt: new Date().toISOString(),
        entityId: entity.id,
        entityType: 'product',
        policyType: 'age-restrictions',
        recommendedAction: 'require-modification',
        severity: 0.8,
        violationId: `age_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        violationType: 'major',
      });
    }
  }

  return violations;
}

function checkGeographicRestrictions(entity: any): any[] {
  const violations = [];

  if (entity.type === 'merchant') {
    // Check for restricted countries (mock)
    const restrictedCountries = ['XX', 'YY']; // Example restricted countries

    if (restrictedCountries.includes(entity.country)) {
      violations.push({
        confidence: 1.0,
        evidence: [
          {
            type: 'metadata',
            content: `Country: ${entity.country}`,
            location: 'merchant_profile',
          },
        ],
        automaticAction: true,
        description: `Merchant from restricted country: ${entity.country}`,
        detectedAt: new Date().toISOString(),
        entityId: entity.id,
        entityType: 'merchant',
        policyType: 'geographic-restrictions',
        recommendedAction: 'suspend',
        severity: 1.0,
        violationId: `geo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        violationType: 'critical',
      });
    }
  }

  return violations;
}

function checkPricingPolicies(entity: any): any[] {
  const violations = [];

  if (entity.type === 'product' && entity.price) {
    // Check for suspicious pricing
    if (entity.price < 0.01) {
      violations.push({
        confidence: 1.0,
        evidence: [
          {
            type: 'metadata',
            content: `Price: $${entity.price}`,
            location: 'product_pricing',
          },
        ],
        automaticAction: true,
        description: 'Product price below minimum threshold',
        detectedAt: new Date().toISOString(),
        entityId: entity.id,
        entityType: 'product',
        policyType: 'pricing-policies',
        recommendedAction: 'require-modification',
        severity: 0.4,
        violationId: `price_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        violationType: 'minor',
      });
    }

    // Check for potentially fraudulent pricing
    if (entity.price > 100000) {
      violations.push({
        confidence: 0.7,
        evidence: [
          {
            type: 'metadata',
            content: `Price: $${entity.price}`,
            location: 'product_pricing',
          },
        ],
        automaticAction: false,
        description: 'Unusually high product price requires review',
        detectedAt: new Date().toISOString(),
        entityId: entity.id,
        entityType: 'product',
        policyType: 'pricing-policies',
        recommendedAction: 'escalate',
        severity: 0.6,
        violationId: `price_high_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        violationType: 'major',
      });
    }
  }

  return violations;
}

function checkTaxCompliance(entity: any): any[] {
  const violations = [];

  if (entity.type === 'merchant') {
    // Check for valid tax ID
    if (!entity.taxId) {
      violations.push({
        confidence: 1.0,
        evidence: [
          {
            type: 'metadata',
            content: 'Tax ID: null',
            location: 'merchant_profile',
          },
        ],
        automaticAction: false,
        description: 'Merchant missing required tax identification',
        detectedAt: new Date().toISOString(),
        entityId: entity.id,
        entityType: 'merchant',
        policyType: 'tax-compliance',
        recommendedAction: 'require-modification',
        severity: 0.7,
        violationId: `tax_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        violationType: 'major',
      });
    }

    // Check business license
    if (!entity.businessLicense) {
      violations.push({
        confidence: 0.8,
        evidence: [
          {
            type: 'metadata',
            content: 'Business license verified: false',
            location: 'merchant_verification',
          },
        ],
        automaticAction: true,
        description: 'Business license verification required',
        detectedAt: new Date().toISOString(),
        entityId: entity.id,
        entityType: 'merchant',
        policyType: 'tax-compliance',
        recommendedAction: 'warn',
        severity: 0.5,
        violationId: `license_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        violationType: 'minor',
      });
    }
  }

  return violations;
}

function checkDataPrivacy(entity: any): any[] {
  const violations = [];

  if (entity.type === 'merchant') {
    // Check GDPR compliance (mock)
    const euCountries = ['DE', 'FR', 'IT', 'ES', 'NL'];

    if (euCountries.includes(entity.country) && !entity.gdprCompliant) {
      violations.push({
        confidence: 0.9,
        evidence: [
          {
            type: 'metadata',
            content: `Country: ${entity.country}, GDPR compliant: false`,
            location: 'merchant_compliance',
          },
        ],
        automaticAction: false,
        description: 'EU-based merchant must comply with GDPR requirements',
        detectedAt: new Date().toISOString(),
        entityId: entity.id,
        entityType: 'merchant',
        policyType: 'data-privacy',
        recommendedAction: 'require-modification',
        severity: 0.8,
        violationId: `gdpr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        violationType: 'major',
      });
    }
  }

  return violations;
}

function calculateViolationsByType(violations: any[]): Record<string, number> {
  return violations.reduce((acc, violation) => {
    acc[violation.policyType] = (acc[violation.policyType] || 0) + 1;
    return acc;
  }, {});
}

function calculateViolationsBySeverity(violations: any[]): Record<string, number> {
  return violations.reduce((acc, violation) => {
    acc[violation.violationType] = (acc[violation.violationType] || 0) + 1;
    return acc;
  }, {});
}

// Step 3: Run AI content analysis
export const runAIContentAnalysisStep = compose(
  createStep('ai-analysis', async (data: any) => {
    const { validationConfig, entities, policyTypes } = data;

    if (!validationConfig.enableAI) {
      return {
        ...data,
        aiAnalysisSkipped: true,
        aiViolations: [],
      };
    }

    // Process in batches
    const aiViolations = [];
    const batchSize = validationConfig.batchSize;

    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize);

      const batchViolations = await aiContentAnalyzerFactory.handler({
        input: {
          config: validationConfig,
          items: batch,
          policies: policyTypes,
        },
      });

      aiViolations.push(...batchViolations);

      console.log(
        `AI analyzed ${Math.min(i + batchSize, entities.length)}/${entities.length} entities`,
      );
    }

    return {
      ...data,
      aiAnalysisComplete: true,
      aiViolations,
    };
  }),
  (step: any) =>
    withStepCircuitBreaker(step, {
      resetTimeout: 300000,
      threshold: 0.5,
      // timeout: 120000,
    }),
);

// Step 4: Consolidate violations
export const consolidateViolationsStep = createStep('consolidate-violations', async (data: any) => {
  const { aiViolations, policyViolations } = data;

  // Combine all violations
  const allViolations = [...(policyViolations || []), ...(aiViolations || [])];

  // Remove duplicates and merge similar violations
  const consolidatedViolations = deduplicateViolations(allViolations);

  // Sort by severity and confidence
  consolidatedViolations.sort((a: any, b: any) => {
    if (a.severity !== b.severity) {
      return b.severity - a.severity;
    }
    return b.confidence - a.confidence;
  });

  // Group by entity for easier processing
  const violationsByEntity = new Map();
  consolidatedViolations.forEach((violation) => {
    const key = `${violation.entityType}_${violation.entityId}`;
    if (!violationsByEntity.has(key)) {
      violationsByEntity.set(key, []);
    }
    violationsByEntity.get(key).push(violation);
  });

  return {
    ...data,
    consolidatedViolations,
    consolidationComplete: true,
    violationsByEntity: Array.from(violationsByEntity.entries()).map(([key, violations]) => ({
      criticalCount: violations.filter((v: any) => v.violationType === 'critical').length,
      entityKey: key,
      highestSeverity: Math.max(...violations.map((v: any) => v.severity)),
      totalViolations: violations.length,
      violations,
    })),
  };
});

function deduplicateViolations(violations: any[]): any[] {
  const seen = new Map();
  const deduplicated: any[] = [];

  violations.forEach((violation) => {
    const key = `${violation.entityId}_${violation.policyType}_${violation.description}`;

    if (!seen.has(key)) {
      seen.set(key, violation);
      deduplicated.push(violation);
    } else {
      // Keep the one with higher confidence
      const existing = seen.get(key);
      if (violation.confidence > existing.confidence) {
        seen.set(key, violation);
        const index = deduplicated.findIndex((v) => v.violationId === existing.violationId);
        deduplicated[index] = violation;
      }
    }
  });

  return deduplicated;
}

// Step 5: Determine enforcement actions
export const determineEnforcementActionsStep = createStep(
  'determine-actions',
  async (data: any) => {
    const { consolidatedViolations, enforcementConfig } = data;
    const enforcementActions = [];

    for (const violation of consolidatedViolations) {
      const action = determineAction(violation, enforcementConfig);
      enforcementActions.push(action);
    }

    // Group actions by type for summary
    const actionSummary = enforcementActions.reduce((acc, action) => {
      acc[action.actionType] = (acc[action.actionType] || 0) + 1;
      return acc;
    }, {});

    return {
      ...data,
      actionsImmediate: enforcementActions.filter((a) => a.immediate).length,
      actionsRequired: enforcementActions.filter((a) => a.requiresExecution).length,
      actionSummary,
      enforcementActions,
    };
  },
);

function determineAction(violation: any, config: any): any {
  const action = {
    confidence: violation.confidence,
    evidence: violation.evidence,
    actionId: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    actionType: violation.recommendedAction,
    automatic: violation.automaticAction && config.autoEnforce,
    entityId: violation.entityId,
    entityType: violation.entityType,
    escalated: violation.severity >= config.escalationThreshold,
    gracePeriod: config.gracePeriod,
    immediate: violation.violationType === 'critical',
    reason: violation.description,
    requiresExecution: true,
    requiresHumanReview: false,
    scheduledFor: new Date(
      Date.now() +
        (violation.violationType === 'critical' ? 0 : config.gracePeriod * 60 * 60 * 1000),
    ).toISOString(),
    severity: violation.severity,
    violationId: violation.violationId,
  };

  // Modify action based on enforcement mode
  if (config.strictMode) {
    if (action.actionType === 'warn') {
      action.actionType = 'require-modification';
    } else if (
      action.actionType === 'require-modification' &&
      violation.violationType === 'major'
    ) {
      action.actionType = 'delist';
    }
  }

  // Check if human review is required
  if (config.humanReviewRequired || violation.violationType === 'critical') {
    action.automatic = false;
    action.requiresHumanReview = true;
  }

  return action;
}

// Step 6: Execute enforcement actions
export const executeEnforcementActionsStep = createStep('execute-actions', async (data: any) => {
  const { enforcementActions, enforcementConfig } = data;
  const executionResults = [];

  // Execute automatic actions
  const automaticActions = enforcementActions.filter(
    (a: any) => a.automatic && !a.requiresHumanReview,
  );
  const manualActions = enforcementActions.filter(
    (a: any) => !a.automatic || a.requiresHumanReview,
  );

  for (const action of automaticActions) {
    const result = await executeAction(action);
    executionResults.push(result);
  }

  // Queue manual actions for review
  const queuedActions = [];
  for (const action of manualActions) {
    queuedActions.push({
      ...action,
      assignedTo: 'compliance_team',
      queuedAt: new Date().toISOString(),
      status: 'queued_for_review',
    });
  }

  return {
    ...data,
    executionResults,
    executionStats: {
      automatic: executionResults.length,
      failed: executionResults.filter((r) => !r.success).length,
      queued: queuedActions.length,
      successful: executionResults.filter((r) => r.success).length,
    },
    queuedActions,
  };
});

async function executeAction(action: any): Promise<any> {
  // Simulate action execution
  await new Promise((resolve) => setTimeout(resolve, 200));

  const success = Math.random() > 0.05; // 95% success rate

  return {
    actionId: action.actionId,
    actionType: action.actionType,
    details: success ? getSuccessDetails(action) : getFailureDetails(action),
    entityId: action.entityId,
    executedAt: new Date().toISOString(),
    executedBy: 'system',
    success,
  };
}

function getSuccessDetails(action: any): any {
  switch (action.actionType) {
    case 'warn':
      return {
        message: 'Warning notification sent to merchant',
        notificationId: `warn_${Date.now()}`,
      };
    case 'suspend':
      return { message: 'Entity suspended pending review', suspensionId: `susp_${Date.now()}` };
    case 'remove':
      return { message: 'Entity removed from marketplace', removalId: `rem_${Date.now()}` };
    case 'delist':
      return { delistId: `del_${Date.now()}`, message: 'Product delisted from search results' };
    case 'require-modification':
      return { message: 'Modification request sent to merchant', requestId: `mod_${Date.now()}` };
    case 'fine':
      return {
        amount: '$' + (Math.random() * 1000 + 100).toFixed(2),
        fineId: `fine_${Date.now()}`,
        message: 'Fine assessed and billed',
      };
    default:
      return { message: 'Action executed successfully' };
  }
}

function getFailureDetails(action: any): any {
  return {
    error: 'Execution failed',
    reason: 'System error during action execution',
    retryable: true,
  };
}

// Step 7: Notify affected parties
export const notifyAffectedPartiesStep = createStep('send-notifications', async (data: any) => {
  const { enforcementActions, enforcementConfig, executionResults } = data;

  if (!enforcementConfig.notifyMerchants) {
    return {
      ...data,
      notificationsSkipped: true,
    };
  }

  const notifications = [];

  // Notify merchants about violations and actions
  for (const result of executionResults) {
    if (result.success) {
      const notification = await sendMerchantNotification(result);
      notifications.push(notification);
    }
  }

  // Notify compliance team about queued actions
  if (data.queuedActions?.length > 0) {
    const teamNotification = await sendComplianceTeamNotification(data.queuedActions);
    notifications.push(teamNotification);
  }

  return {
    ...data,
    notifications,
    notificationsFailed: notifications.filter((n) => !n.sent).length,
    notificationsSent: notifications.filter((n) => n.sent).length,
  };
});

async function sendMerchantNotification(executionResult: any): Promise<any> {
  // Simulate notification sending
  await new Promise((resolve) => setTimeout(resolve, 100));

  const sent = Math.random() > 0.05; // 95% success rate

  return {
    type: 'compliance_action',
    actionType: executionResult.actionType,
    channel: 'email',
    entityId: executionResult.entityId,
    notificationId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    recipient: 'merchant',
    sent,
    sentAt: sent ? new Date().toISOString() : undefined,
    template: `${executionResult.actionType}_notification`,
  };
}

async function sendComplianceTeamNotification(queuedActions: any[]): Promise<any> {
  // Simulate team notification
  await new Promise((resolve) => setTimeout(resolve, 50));

  return {
    type: 'review_required',
    actionCount: queuedActions.length,
    channel: 'slack',
    criticalCount: queuedActions.filter((a) => a.severity >= 0.8).length,
    notificationId: `team_notif_${Date.now()}`,
    recipient: 'compliance_team',
    sent: true,
    sentAt: new Date().toISOString(),
    template: 'team_review_required',
  };
}

// Step 8: Update compliance scores
export const updateComplianceScoresStep = createStep('update-scores', async (data: any) => {
  const { executionResults, violationsByEntity } = data;
  const scoreUpdates = [];

  for (const entityGroup of violationsByEntity) {
    const scoreUpdate = calculateComplianceScoreUpdate(entityGroup);
    scoreUpdates.push(scoreUpdate);
  }

  // Apply score updates (mock)
  const updateResults = await Promise.all(
    scoreUpdates.map((update) => updateEntityComplianceScore(update)),
  );

  return {
    ...data,
    averageScoreChange:
      updateResults.reduce((sum, r) => sum + r.scoreChange, 0) / updateResults.length,
    entitiesAffected: updateResults.length,
    scoreUpdates: updateResults,
  };
});

function calculateComplianceScoreUpdate(entityGroup: any): any {
  const violations = entityGroup.violations;
  const totalSeverity = violations.reduce((sum: number, v: any) => sum + v.severity, 0);
  const avgSeverity = totalSeverity / violations.length;

  // Calculate score penalty
  const scorePenalty = Math.min(avgSeverity * 0.3, 0.5); // Max 50% penalty

  const [entityType, entityId] = entityGroup.entityKey.split('_');

  return {
    averageSeverity: avgSeverity,
    entityId,
    entityType,
    recommendedAction: avgSeverity > 0.7 ? 'review_account' : 'monitor_closely',
    scorePenalty,
    severitySum: totalSeverity,
    violationCount: violations.length,
  };
}

async function updateEntityComplianceScore(scoreUpdate: any): Promise<any> {
  // Simulate score update
  await new Promise((resolve) => setTimeout(resolve, 50));

  const currentScore = 0.5 + Math.random() * 0.5; // Mock current score
  const newScore = Math.max(0, currentScore - scoreUpdate.scorePenalty);

  return {
    ...scoreUpdate,
    currentScore,
    newScore,
    scoreChange: newScore - currentScore,
    success: true,
    updatedAt: new Date().toISOString(),
  };
}

// Step 9: Generate compliance alerts
export const generateComplianceAlertsStep = createStep('generate-alerts', async (data: any) => {
  const { consolidatedViolations, executionResults, scoreUpdates } = data;
  const alerts = [];

  // Critical violation alerts
  const criticalViolations = consolidatedViolations.filter(
    (v: any) => v.violationType === 'critical',
  );
  if (criticalViolations.length > 0) {
    alerts.push({
      type: 'critical_violations',
      affectedEntities: criticalViolations.length,
      alertId: `alert_critical_${Date.now()}`,
      description: `${criticalViolations.length} critical violations require immediate attention`,
      requiresAcknowledgment: true,
      severity: 'high',
      timestamp: new Date().toISOString(),
      title: 'Critical Policy Violations Detected',
    });
  }

  // High violation rate alert
  const violationRate = consolidatedViolations.length / data.totalEntities;
  if (violationRate > 0.2) {
    alerts.push({
      type: 'high_violation_rate',
      alertId: `alert_rate_${Date.now()}`,
      description: `${(violationRate * 100).toFixed(1)}% of entities have policy violations`,
      severity: 'medium',
      timestamp: new Date().toISOString(),
      title: 'High Policy Violation Rate',
      violationRate,
    });
  }

  // Compliance score degradation alert
  const significantScoreDrops = scoreUpdates.filter((s: any) => s.scoreChange < -0.3);
  if (significantScoreDrops.length > 0) {
    alerts.push({
      type: 'compliance_score_degradation',
      affectedEntities: significantScoreDrops.length,
      alertId: `alert_scores_${Date.now()}`,
      description: `${significantScoreDrops.length} entities experienced significant compliance score decreases`,
      severity: 'medium',
      timestamp: new Date().toISOString(),
      title: 'Significant Compliance Score Drops',
    });
  }

  // Policy trend alert
  const policyTypeCounts = calculateViolationsByType(consolidatedViolations);
  const dominantPolicy = Object.entries(policyTypeCounts).sort((a: any, b: any) => b[1] - a[1])[0];

  if (dominantPolicy && dominantPolicy[1] > consolidatedViolations.length * 0.4) {
    alerts.push({
      type: 'policy_trend',
      alertId: `alert_trend_${Date.now()}`,
      count: dominantPolicy[1],
      description: `High concentration of ${dominantPolicy[0]} violations (${dominantPolicy[1]} instances)`,
      policyType: dominantPolicy[0],
      severity: 'low',
      timestamp: new Date().toISOString(),
      title: 'Policy Violation Trend',
    });
  }

  return {
    ...data,
    alertsGenerated: alerts.length,
    complianceAlerts: alerts,
  };
});

// Step 10: Generate compliance report
export const generateComplianceReportStep = createStep('generate-report', async (data: any) => {
  const {
    consolidatedViolations,
    complianceAlerts,
    enforcementConfig,
    executionResults,
    scoreUpdates,
    totalEntities,
  } = data;

  const report = {
    alerts: complianceAlerts,
    compliance: {
      averageScoreChange:
        scoreUpdates.reduce((sum: number, s: any) => sum + s.scoreChange, 0) / scoreUpdates.length,
      entitiesWithScoreDrops: scoreUpdates.filter((s: any) => s.scoreChange < 0).length,
      scoreChanges: scoreUpdates,
    },
    enforcement: {
      actionBreakdown: executionResults.reduce((acc: any, result: any) => {
        acc[result.actionType] = (acc[result.actionType] || 0) + 1;
        return acc;
      }, {}),
      actionsExecuted: executionResults.length,
      configuration: enforcementConfig,
      successRate:
        (
          (executionResults.filter((r: any) => r.success).length / executionResults.length) *
          100
        ).toFixed(1) + '%',
    },
    recommendations: generateComplianceRecommendations(data),
    reportId: `compliance_${Date.now()}`,
    summary: {
      actionsExecuted: executionResults.length,
      complianceScore: calculateOverallComplianceScore(data),
      criticalViolations: consolidatedViolations.filter((v: any) => v.violationType === 'critical')
        .length,
      entitiesScanned: totalEntities,
      violationRate: ((consolidatedViolations.length / totalEntities) * 100).toFixed(2) + '%',
      violationsFound: consolidatedViolations.length,
    },
    timestamp: new Date().toISOString(),
    violations: {
      bySeverity: calculateViolationsBySeverity(consolidatedViolations),
      byType: calculateViolationsByType(consolidatedViolations),
      topViolations: consolidatedViolations
        .sort((a: any, b: any) => b.severity - a.severity)
        .slice(0, 10)
        .map((v: any) => ({
          description: v.description,
          entityId: v.entityId,
          policyType: v.policyType,
          severity: v.severity,
          violationId: v.violationId,
        })),
    },
  };

  return {
    ...data,
    complianceCheckComplete: true,
    report,
  };
});

function calculateOverallComplianceScore(data: any): number {
  const totalEntities = data.totalEntities;
  const violatingEntities = data.consolidatedViolations.length;
  const complianceRate = (totalEntities - violatingEntities) / totalEntities;

  // Adjust for severity
  const severityPenalty =
    data.consolidatedViolations.reduce((sum: number, v: any) => sum + v.severity, 0) /
    totalEntities;

  return Math.max(0, (complianceRate - severityPenalty * 0.1) * 100);
}

function generateComplianceRecommendations(data: any): any[] {
  const recommendations = [];

  // High violation rate
  if (data.consolidatedViolations.length / data.totalEntities > 0.15) {
    recommendations.push({
      action: 'Implement merchant education program on policy compliance',
      area: 'policy_education',
      expectedImpact: 'Reduce violations by 40%',
      priority: 'high',
    });
  }

  // Common violation types
  const violationsByType = calculateViolationsByType(data.consolidatedViolations);
  const topViolationType = Object.entries(violationsByType).sort(
    (a: any, b: any) => b[1] - a[1],
  )[0];

  if (topViolationType && topViolationType[1] > 20) {
    recommendations.push({
      action: `Clarify and strengthen guidance for ${topViolationType[0]} policies`,
      area: 'policy_clarification',
      expectedImpact: `Reduce ${topViolationType[0]} violations`,
      priority: 'medium',
    });
  }

  // AI confidence issues
  const lowConfidenceViolations = data.consolidatedViolations.filter(
    (v: any) => v.confidence < 0.8,
  );
  if (lowConfidenceViolations.length > data.consolidatedViolations.length * 0.3) {
    recommendations.push({
      action: 'Retrain AI models with more labeled data',
      area: 'ai_improvement',
      expectedImpact: 'Improve violation detection accuracy',
      priority: 'low',
    });
  }

  return recommendations;
}

// Main workflow definition
export const compliancePolicyEnforcementWorkflow = {
  id: 'compliance-policy-enforcement',
  name: 'Compliance & Policy Enforcement',
  config: {
    concurrency: {
      max: 3, // Limit concurrent compliance jobs
    },
    maxDuration: 2700000, // 45 minutes
    schedule: {
      cron: '0 1 * * *', // Daily at 1 AM
      timezone: 'UTC',
    },
  },
  description: 'Monitor and enforce marketplace policies and regulatory compliance',
  features: {
    aiContentAnalysis: true,
    automatedEnforcement: true,
    complianceScoring: true,
    merchantNotifications: true,
    policyViolationDetection: true,
  },
  steps: [
    collectEntitiesStep,
    applyPolicyRulesStep,
    runAIContentAnalysisStep,
    consolidateViolationsStep,
    determineEnforcementActionsStep,
    executeEnforcementActionsStep,
    notifyAffectedPartiesStep,
    updateComplianceScoresStep,
    generateComplianceAlertsStep,
    generateComplianceReportStep,
  ],
  version: '1.0.0',
};
