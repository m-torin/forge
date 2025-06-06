interface EmailCampaignInput {
  campaignId: string;
  subject: string;
  templateId: string;
  recipients: Array<{
    email: string;
    name: string;
    customData?: Record<string, any>;
  }>;
  scheduledFor?: Date;
  batchSize?: number;
}

interface EmailCampaignOutput {
  campaignId: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  batchResults: Array<{
    batchId: string;
    recipients: number;
    sent: number;
    failed: number;
    startedAt: Date;
    completedAt: Date;
  }>;
  completedAt: Date;
  metrics: {
    deliveryRate: number;
    estimatedCost: number;
  };
}

async function sendEmailBatch(
  emails: EmailCampaignInput['recipients'],
  templateId: string,
  subject: string,
  batchId: string,
): Promise<{
  batchId: string;
  recipients: number;
  sent: number;
  failed: number;
  startedAt: Date;
  completedAt: Date;
}> {
  const startedAt = new Date();

  // Simulate email sending with 95% success rate
  const results = emails.map((email) => ({
    email: email.email,
    success: Math.random() > 0.05, // 95% success rate
  }));

  // Simulate processing time (100ms per email + 500ms overhead)
  const processingTime = emails.length * 100 + 500;
  await new Promise((resolve) => setTimeout(resolve, processingTime));

  const sent = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`Batch ${batchId}: ${sent} sent, ${failed} failed`);

  return {
    batchId,
    recipients: emails.length,
    sent,
    failed,
    startedAt,
    completedAt: new Date(),
  };
}

export default {
  id: 'email-campaign',
  name: 'Email Campaign Sender',
  description: 'Send marketing emails to a list of recipients in batches',
  version: '1.2.0',
  category: 'email',
  tags: ['email', 'marketing', 'campaign', 'batch'],
  author: 'Marketing Team',
  timeout: 300000, // 5 minutes
  retries: 1,
  concurrency: 3,

  inputSchema: {
    type: 'object',
    required: ['campaignId', 'subject', 'templateId', 'recipients'],
    properties: {
      campaignId: { type: 'string', minLength: 1 },
      subject: { type: 'string', minLength: 1 },
      templateId: { type: 'string', minLength: 1 },
      recipients: {
        type: 'array',
        minItems: 1,
        items: {
          type: 'object',
          required: ['email', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            name: { type: 'string', minLength: 1 },
            customData: { type: 'object' },
          },
        },
      },
      scheduledFor: { type: 'string', format: 'date-time' },
      batchSize: { type: 'number', minimum: 1, maximum: 1000, default: 50 },
    },
  },

  outputSchema: {
    type: 'object',
    required: [
      'campaignId',
      'totalRecipients',
      'sentCount',
      'failedCount',
      'batchResults',
      'completedAt',
      'metrics',
    ],
    properties: {
      campaignId: { type: 'string' },
      totalRecipients: { type: 'number' },
      sentCount: { type: 'number' },
      failedCount: { type: 'number' },
      batchResults: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            batchId: { type: 'string' },
            recipients: { type: 'number' },
            sent: { type: 'number' },
            failed: { type: 'number' },
            startedAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
      completedAt: { type: 'string', format: 'date-time' },
      metrics: {
        type: 'object',
        properties: {
          deliveryRate: { type: 'number' },
          estimatedCost: { type: 'number' },
        },
      },
    },
  },

  async handler(input: EmailCampaignInput): Promise<EmailCampaignOutput> {
    console.log(
      `Starting email campaign: ${input.campaignId} with ${input.recipients.length} recipients`,
    );

    const batchSize = input.batchSize || 50;
    const batches: EmailCampaignInput['recipients'][] = [];

    // Split recipients into batches
    for (let i = 0; i < input.recipients.length; i += batchSize) {
      batches.push(input.recipients.slice(i, i + batchSize));
    }

    console.log(`Split into ${batches.length} batches of ${batchSize} recipients each`);

    // Wait for scheduled time if specified
    if (input.scheduledFor) {
      const delay = new Date(input.scheduledFor).getTime() - Date.now();
      if (delay > 0) {
        console.log(`Waiting ${delay}ms for scheduled time`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    const batchResults: EmailCampaignOutput['batchResults'] = [];

    // Process batches sequentially to avoid overwhelming email service
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const batchId = `batch_${i + 1}_${Date.now()}`;

      console.log(`Processing batch ${i + 1}/${batches.length}: ${batch.length} recipients`);

      try {
        const result = await sendEmailBatch(batch, input.templateId, input.subject, batchId);
        batchResults.push(result);
      } catch (error) {
        console.error(`Batch ${batchId} failed:`, error);
        // Record failed batch
        batchResults.push({
          batchId,
          recipients: batch.length,
          sent: 0,
          failed: batch.length,
          startedAt: new Date(),
          completedAt: new Date(),
        });
      }

      // Short delay between batches to be nice to email service
      if (i < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Calculate totals
    const totalRecipients = input.recipients.length;
    const sentCount = batchResults.reduce((sum, batch) => sum + batch.sent, 0);
    const failedCount = batchResults.reduce((sum, batch) => sum + batch.failed, 0);
    const deliveryRate = totalRecipients > 0 ? (sentCount / totalRecipients) * 100 : 0;
    const estimatedCost = sentCount * 0.001; // $0.001 per email

    const result: EmailCampaignOutput = {
      campaignId: input.campaignId,
      totalRecipients,
      sentCount,
      failedCount,
      batchResults,
      completedAt: new Date(),
      metrics: {
        deliveryRate,
        estimatedCost,
      },
    };

    console.log(
      `Campaign completed: ${sentCount}/${totalRecipients} sent (${deliveryRate.toFixed(1)}%)`,
    );

    return result;
  },
};
