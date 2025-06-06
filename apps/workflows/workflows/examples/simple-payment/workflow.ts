interface PaymentInput {
  amount: number;
  currency: string;
  customerId: string;
  paymentMethodId: string;
  description?: string;
}

interface PaymentOutput {
  paymentId: string;
  status: 'succeeded' | 'failed' | 'requires_action';
  amount: number;
  currency: string;
  chargedAt: Date;
  fees?: {
    platform: number;
    processing: number;
  };
}

async function processPayment(input: PaymentInput): Promise<PaymentOutput> {
  // Simulate payment processing
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 85% success rate simulation
  const success = Math.random() > 0.15;

  if (!success) {
    throw new Error('Payment declined by processor');
  }

  return {
    paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'succeeded',
    amount: input.amount,
    currency: input.currency,
    chargedAt: new Date(),
    fees: {
      platform: Math.round(input.amount * 0.029), // 2.9%
      processing: 30, // $0.30
    },
  };
}

export default {
  id: 'simple-payment',
  name: 'Simple Payment Processing',
  description: 'Process a single payment using Stripe-like API simulation',
  version: '1.0.0',
  category: 'payments',
  tags: ['payment', 'stripe', 'simple'],
  author: 'Workflows Team',
  timeout: 30000, // 30 seconds
  retries: 2,
  concurrency: 5,

  inputSchema: {
    type: 'object',
    required: ['amount', 'currency', 'customerId', 'paymentMethodId'],
    properties: {
      amount: { type: 'number', minimum: 1 },
      currency: { type: 'string', enum: ['usd', 'eur', 'gbp'] },
      customerId: { type: 'string', minLength: 1 },
      paymentMethodId: { type: 'string', minLength: 1 },
      description: { type: 'string' },
    },
  },

  outputSchema: {
    type: 'object',
    required: ['paymentId', 'status', 'amount', 'currency', 'chargedAt'],
    properties: {
      paymentId: { type: 'string' },
      status: { type: 'string', enum: ['succeeded', 'failed', 'requires_action'] },
      amount: { type: 'number' },
      currency: { type: 'string' },
      chargedAt: { type: 'string', format: 'date-time' },
      fees: {
        type: 'object',
        properties: {
          platform: { type: 'number' },
          processing: { type: 'number' },
        },
      },
    },
  },

  async handler(input: PaymentInput): Promise<PaymentOutput> {
    console.log(
      `Processing payment: ${input.amount} ${input.currency} for customer ${input.customerId}`,
    );

    // Validate input
    if (input.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!['usd', 'eur', 'gbp'].includes(input.currency.toLowerCase())) {
      throw new Error('Unsupported currency');
    }

    try {
      const result = await processPayment(input);
      console.log(`Payment processed successfully: ${result.paymentId}`);
      return result;
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  },
};
