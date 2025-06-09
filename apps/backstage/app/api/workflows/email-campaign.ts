/**
 * Email Campaign Workflow
 * Batch email processing with personalization and analytics
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepMonitoring,
  withStepRetry,
} from '@repo/orchestration';

// Input schemas
const EmailCampaignInput = z.object({
  name: z.string(),
  campaignId: z.string(),
  scheduledAt: z.string().optional(),
  segmentId: z.string(),
  subject: z.string(),
  templateId: z.string(),
  testMode: z.boolean().default(false),
});

const RecipientSchema = z.object({
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  metadata: z.record(z.any()).optional(),
  preferences: z
    .object({
      categories: z.array(z.string()),
      frequency: z.enum(['daily', 'weekly', 'monthly']),
    })
    .optional(),
});

// Step 1: Load campaign configuration
export const loadCampaignStep = createStepWithValidation(
  'load-campaign',
  async (input: z.infer<typeof EmailCampaignInput>) => {
    // Simulate loading campaign from database
    return {
      ...input,
      segment: {
        id: input.segmentId,
        criteria: {
          lastPurchase: { within: '30d' },
          totalSpent: { min: 100 },
        },
        estimatedSize: input.testMode ? 10 : 5000,
      },
      settings: {
        fromEmail: 'noreply@example.com',
        fromName: 'Example Store',
        replyTo: 'support@example.com',
        trackClicks: true,
        trackOpens: true,
      },
      template: {
        id: input.templateId,
        content: '<h1>Hello {{firstName}}!</h1><p>Check out our latest {{category}} products.</p>',
        requiredVars: ['firstName', 'category'],
      },
    };
  },
  (input) => !!input.campaignId && !!input.templateId,
  (output) => !!output.template && !!output.segment,
);

// Step 2: Fetch recipients from segment
export const fetchRecipientsStep = compose(
  createStep('fetch-recipients', async (campaign: any) => {
    const { segment, testMode } = campaign;

    // Simulate fetching recipients based on segment criteria
    const recipientCount = testMode ? 10 : segment.estimatedSize;
    const recipients = Array.from({ length: recipientCount }, (_, i) => ({
      email: `user${i}@example.com`,
      firstName: `User${i}`,
      lastName: `Test`,
      metadata: {
        customerId: `cust_${i}`,
        lastPurchaseDate: new Date(Date.now() - i * 86400000).toISOString(),
      },
      preferences: {
        categories: ['electronics', 'clothing', 'home'][i % 3],
        frequency: ['daily', 'weekly', 'monthly'][i % 3] as any,
      },
    }));

    return {
      ...campaign,
      fetchedAt: new Date().toISOString(),
      recipients,
      totalRecipients: recipients.length,
    };
  }),
  (step) =>
    withStepMonitoring(step, {
      enableDetailedLogging: true,
      trackingMetrics: ['templateCount'],
    }),
);

// Step 3: Validate and deduplicate recipients
export const validateRecipientsStep = createStep('validate-recipients', async (data: any) => {
  const { recipients } = data;
  const validRecipients: any[] = [];
  const invalidRecipients: any[] = [];
  const seen = new Set<string>();

  recipients.forEach((recipient: any) => {
    // Check for duplicates
    if (seen.has(recipient.email)) {
      invalidRecipients.push({
        ...recipient,
        reason: 'duplicate',
      });
      return;
    }
    seen.add(recipient.email);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipient.email)) {
      invalidRecipients.push({
        ...recipient,
        reason: 'invalid_email',
      });
      return;
    }

    // Check suppression list (simulated)
    if (Math.random() < 0.05) {
      // 5% on suppression list
      invalidRecipients.push({
        ...recipient,
        reason: 'suppressed',
      });
      return;
    }

    validRecipients.push(recipient);
  });

  return {
    ...data,
    invalidRecipients,
    validation: {
      invalid: invalidRecipients.length,
      valid: validRecipients.length,
      suppressionRate:
        (invalidRecipients.filter((r) => r.reason === 'suppressed').length / recipients.length) *
        100,
      total: recipients.length,
    },
    recipients: validRecipients,
  };
});

// Step 4: Personalize content
export const personalizeContentStep = createStep('personalize-content', async (data: any) => {
  const { recipients, subject, template } = data;

  const personalizedEmails = recipients.map((recipient: any) => {
    // Replace template variables
    let content = template.content;
    let personalizedSubject = subject;

    // Basic personalization
    content = content.replace(/{{firstName}}/g, recipient.firstName);
    content = content.replace(/{{lastName}}/g, recipient.lastName);
    content = content.replace(
      /{{category}}/g,
      recipient.preferences?.categories?.[0] || 'featured',
    );

    personalizedSubject = personalizedSubject.replace(/{{firstName}}/g, recipient.firstName);

    // Add tracking pixels and links
    const trackingId = `${data.campaignId}_${recipient.metadata.customerId}`;
    content += `<img src="https://track.example.com/open/${trackingId}" width="1" height="1" />`;

    return {
      html: content,
      metadata: {
        campaignId: data.campaignId,
        recipientId: recipient.metadata.customerId,
        trackingId,
      },
      subject: personalizedSubject,
      to: recipient.email,
    };
  });

  return {
    ...data,
    personalizationComplete: true,
    personalizedEmails,
  };
});

// Step 5: Batch emails for sending
export const batchEmailsStep = createStep('batch-emails', async (data: any) => {
  const { personalizedEmails, testMode } = data;
  const BATCH_SIZE = testMode ? 5 : 100;

  const batches = [];
  for (let i = 0; i < personalizedEmails.length; i += BATCH_SIZE) {
    batches.push({
      batchId: `batch_${i / BATCH_SIZE}`,
      emails: personalizedEmails.slice(i, i + BATCH_SIZE),
      size: Math.min(BATCH_SIZE, personalizedEmails.length - i),
    });
  }

  return {
    ...data,
    batches,
    totalBatches: batches.length,
  };
});

// Step 6: Send email batches
export const sendEmailBatchesStep = compose(
  createStep('send-batches', async (data: any) => {
    const { batches, settings, testMode } = data;
    const results = [];

    for (const batch of batches) {
      // Simulate sending with rate limiting
      await new Promise((resolve) => setTimeout(resolve, testMode ? 100 : 1000));

      const batchResult = {
        batchId: batch.batchId,
        errors: [] as any[],
        failed: 0,
        sent: 0,
      };

      for (const email of batch.emails) {
        // Simulate send with 95% success rate
        if (Math.random() > 0.05) {
          batchResult.sent++;
          // Log success (in real implementation, would call email service)
          console.log(`Email sent to ${email.to}`);
        } else {
          batchResult.failed++;
          batchResult.errors.push({
            email: email.to,
            error: 'Temporary failure',
          });
        }
      }

      results.push(batchResult);
    }

    const totalSent = results.reduce((sum, r) => sum + r.sent, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

    return {
      ...data,
      sendResults: results,
      sentAt: new Date().toISOString(),
      summary: {
        successRate: (totalSent / (totalSent + totalFailed)) * 100,
        totalFailed,
        totalSent,
      },
    };
  }),
  (step) =>
    withStepRetry(step, {
      backoff: 'exponential',
      maxAttempts: 3,
    }),
);

// Step 7: Update campaign analytics
export const updateAnalyticsStep = StepTemplates.database(
  'update-analytics',
  'Store campaign sending results',
);

// Step 8: Schedule follow-up actions
export const scheduleFollowUpStep = createStep('schedule-follow-up', async (data: any) => {
  const { campaignId, summary } = data;

  // Schedule analytics collection jobs
  const jobs = [
    {
      type: 'collect-opens',
      campaignId,
      scheduledFor: new Date(Date.now() + 3600000).toISOString(), // 1 hour
    },
    {
      type: 'collect-clicks',
      campaignId,
      scheduledFor: new Date(Date.now() + 7200000).toISOString(), // 2 hours
    },
    {
      type: 'generate-report',
      campaignId,
      scheduledFor: new Date(Date.now() + 86400000).toISOString(), // 24 hours
    },
  ];

  return {
    ...data,
    followUpJobs: jobs,
    workflowComplete: true,
  };
});

// Step 9: Send completion notification
export const sendCompletionNotificationStep = StepTemplates.notification(
  'campaign-complete',
  'Notify about campaign completion',
  {
    channels: ['email', 'slack'],
    template: {
      body: 'Sent {{totalSent}} emails with {{successRate}}% success rate',
      subject: 'Campaign {{campaignName}} Complete',
    },
  },
);

// Main workflow definition
export const emailCampaignWorkflow = {
  id: 'email-campaign',
  name: 'Email Campaign',
  config: {
    maxDuration: 600000, // 10 minutes
    rateLimiting: {
      maxRequests: 1000,
      windowMs: 60000, // per minute
    },
  },
  description: 'Batch email processing with personalization and analytics',
  steps: [
    loadCampaignStep,
    fetchRecipientsStep,
    validateRecipientsStep,
    personalizeContentStep,
    batchEmailsStep,
    sendEmailBatchesStep,
    updateAnalyticsStep,
    scheduleFollowUpStep,
    sendCompletionNotificationStep,
  ],
  version: '1.0.0',
};
