/**
 * Order Processing Workflow
 * Complete e-commerce order fulfillment with inventory, payment, and shipping
 */

import {
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepRetry,
  withStepCircuitBreaker,
  withStepTimeout,
  compose,
} from '@repo/orchestration';
import { z } from 'zod';

// Input schemas
const OrderProcessingInput = z.object({
  orderId: z.string(),
  customerId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    sku: z.string(),
    quantity: z.number().positive(),
    price: z.number().positive(),
    discount: z.number().min(0).max(100).default(0),
  })),
  shippingAddress: z.object({
    name: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
    phone: z.string(),
  }),
  paymentMethod: z.object({
    type: z.enum(['credit_card', 'paypal', 'apple_pay', 'google_pay']),
    token: z.string(),
  }),
  shippingMethod: z.enum(['standard', 'express', 'overnight']),
  couponCode: z.string().optional(),
  giftMessage: z.string().optional(),
});

// Step 1: Validate order
export const validateOrderStep = compose(
  createStepWithValidation(
    'validate-order',
    async (input: z.infer<typeof OrderProcessingInput>) => {
      const validationResults = {
        order: {
          ...input,
          subtotal: input.items.reduce((sum, item) => 
            sum + (item.price * item.quantity * (1 - item.discount / 100)), 0
          ),
          itemCount: input.items.reduce((sum, item) => sum + item.quantity, 0),
        },
        validation: {
          addressValid: true, // Simulate address validation
          paymentMethodValid: true,
          itemsValid: true,
          couponValid: !input.couponCode || input.couponCode.startsWith('VALID'),
        },
        timestamp: new Date().toISOString(),
      };

      // Check for any validation failures
      const allValid = Object.values(validationResults.validation).every(v => v === true);
      if (!allValid) {
        throw new Error(`Order validation failed: ${JSON.stringify(validationResults.validation)}`);
      }

      return validationResults;
    },
    (input) => input.items.length > 0 && !!input.customerId,
    (output) => output.validation.itemsValid
  ),
  (step) => withStepMonitoring(step, { enableDetailedLogging: true })
);

// Step 2: Check inventory
export const checkInventoryStep = compose(
  createStep('check-inventory', async (data: any) => {
    const { order } = data;
    const inventoryChecks = [];
    const reservations = [];

    for (const item of order.items) {
      // Simulate inventory check
      const available = Math.floor(Math.random() * 100) + 50;
      const inStock = available >= item.quantity;
      
      inventoryChecks.push({
        productId: item.productId,
        sku: item.sku,
        requested: item.quantity,
        available,
        inStock,
        warehouse: inStock ? 'warehouse-1' : null,
        backorderExpected: !inStock ? new Date(Date.now() + 7 * 86400000).toISOString() : null,
      });

      if (inStock) {
        reservations.push({
          reservationId: `res_${Date.now()}_${item.sku}`,
          sku: item.sku,
          quantity: item.quantity,
          warehouse: 'warehouse-1',
          expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        });
      }
    }

    const allInStock = inventoryChecks.every(check => check.inStock);

    return {
      ...data,
      inventory: {
        checks: inventoryChecks,
        allInStock,
        reservations,
        checkedAt: new Date().toISOString(),
      },
    };
  }),
  (step) => withStepRetry(step, { 
    maxAttempts: 3,
    retryIf: (error) => error.message.includes('inventory service unavailable'),
  }),
  (step) => withStepCircuitBreaker(step, {
    timeout: 5000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000,
  })
);

// Step 3: Calculate pricing
export const calculatePricingStep = createStep(
  'calculate-pricing',
  async (data: any) => {
    const { order } = data;
    
    // Calculate base pricing
    const subtotal = order.subtotal;
    
    // Apply coupon if valid
    let couponDiscount = 0;
    if (order.couponCode && data.validation.couponValid) {
      couponDiscount = subtotal * 0.1; // 10% off
    }
    
    // Calculate shipping
    const shippingRates = {
      standard: 5.99,
      express: 15.99,
      overnight: 29.99,
    };
    const shippingCost = shippingRates[order.shippingMethod];
    
    // Calculate tax (simplified)
    const taxRate = 0.08; // 8%
    const taxableAmount = subtotal - couponDiscount;
    const tax = taxableAmount * taxRate;
    
    // Final total
    const total = subtotal - couponDiscount + shippingCost + tax;

    return {
      ...data,
      pricing: {
        subtotal: Number(subtotal.toFixed(2)),
        couponDiscount: Number(couponDiscount.toFixed(2)),
        shippingCost: Number(shippingCost.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(total.toFixed(2)),
        currency: 'USD',
        breakdown: {
          items: order.items.map((item: any) => ({
            ...item,
            lineTotal: item.price * item.quantity * (1 - item.discount / 100),
          })),
        },
      },
    };
  }
);

// Step 4: Process payment
export const processPaymentStep = compose(
  createStep('process-payment', async (data: any) => {
    const { order, pricing } = data;
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock payment result (95% success rate)
    const success = Math.random() > 0.05;
    
    if (!success) {
      throw new Error('Payment declined: Insufficient funds');
    }

    const payment = {
      transactionId: `txn_${Date.now()}`,
      status: 'authorized',
      amount: pricing.total,
      currency: pricing.currency,
      method: order.paymentMethod.type,
      processor: 'stripe',
      metadata: {
        last4: '4242',
        brand: 'visa',
        authCode: 'AUTH' + Math.random().toString(36).substring(7).toUpperCase(),
      },
      processedAt: new Date().toISOString(),
    };

    return {
      ...data,
      payment,
      paymentProcessed: true,
    };
  }),
  (step) => withStepRetry(step, {
    maxAttempts: 2,
    retryIf: (error) => error.message.includes('timeout') || error.message.includes('network'),
  }),
  (step) => withStepTimeout(step, { execution: 30000 }) // 30 second timeout
);

// Step 5: Create fulfillment order
export const createFulfillmentStep = createStep(
  'create-fulfillment',
  async (data: any) => {
    const { order, inventory, pricing } = data;
    
    const fulfillment = {
      fulfillmentId: `ful_${Date.now()}`,
      orderId: order.orderId,
      warehouse: 'warehouse-1',
      items: inventory.reservations.map((res: any) => {
        const item = order.items.find((i: any) => i.sku === res.sku);
        return {
          ...item,
          reservationId: res.reservationId,
          location: `A${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 100)}`,
        };
      }),
      priority: order.shippingMethod === 'overnight' ? 'high' : 'normal',
      packingInstructions: order.giftMessage ? 'Include gift message' : null,
      createdAt: new Date().toISOString(),
    };

    // Generate shipping label
    const shippingLabel = {
      trackingNumber: `1Z${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      carrier: order.shippingMethod === 'overnight' ? 'FedEx' : 'UPS',
      service: order.shippingMethod,
      labelUrl: `https://shipping.example.com/labels/${fulfillment.fulfillmentId}.pdf`,
      estimatedDelivery: new Date(
        Date.now() + 
        (order.shippingMethod === 'standard' ? 5 : order.shippingMethod === 'express' ? 2 : 1) * 
        86400000
      ).toISOString(),
    };

    return {
      ...data,
      fulfillment,
      shippingLabel,
    };
  }
);

// Step 6: Update inventory
export const updateInventoryStep = StepTemplates.database(
  'update-inventory',
  'Decrement inventory levels and update reservations'
);

// Step 7: Send order confirmation
export const sendOrderConfirmationStep = compose(
  StepTemplates.notification(
    'order-confirmation',
    'Send order confirmation email to customer',
    {
      channels: ['email'],
      template: {
        templateId: 'order-confirmation-v2',
        subject: 'Order {{orderId}} Confirmed - Thank You!',
      },
    }
  ),
  (step) => withStepRetry(step, { maxAttempts: 3 })
);

// Step 8: Notify warehouse
export const notifyWarehouseStep = StepTemplates.http(
  'notify-warehouse',
  'Send fulfillment request to warehouse system',
  {
    defaultConfig: {
      method: 'POST',
      baseUrl: 'https://warehouse-api.example.com',
      baseHeaders: {
        'X-API-Key': 'warehouse-key',
        'Content-Type': 'application/json',
      },
    },
  }
);

// Step 9: Schedule status updates
export const scheduleStatusUpdatesStep = createStep(
  'schedule-updates',
  async (data: any) => {
    const { order, shippingLabel } = data;
    
    const scheduledJobs = [
      {
        type: 'send-shipped-notification',
        scheduledFor: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        data: {
          orderId: order.orderId,
          trackingNumber: shippingLabel.trackingNumber,
        },
      },
      {
        type: 'request-review',
        scheduledFor: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days
        data: {
          orderId: order.orderId,
          customerId: order.customerId,
          items: order.items.map((i: any) => i.productId),
        },
      },
      {
        type: 'loyalty-points',
        scheduledFor: new Date(Date.now() + 30 * 86400000).toISOString(), // 30 days
        data: {
          customerId: order.customerId,
          points: Math.floor(data.pricing.total),
        },
      },
    ];

    return {
      ...data,
      scheduledJobs,
      orderProcessingComplete: true,
    };
  }
);

// Step 10: Capture payment
export const capturePaymentStep = compose(
  StepTemplates.conditional(
    'capture-payment',
    'Capture authorized payment after successful fulfillment',
    {
      condition: (data: any) => data.payment.status === 'authorized',
      trueStep: createStep('capture', async (data: any) => {
        // Simulate payment capture
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
          ...data,
          payment: {
            ...data.payment,
            status: 'captured',
            capturedAt: new Date().toISOString(),
          },
        };
      }),
    }
  ),
  (step) => withStepRetry(step, { maxAttempts: 5, backoff: 'exponential' })
);

// Main workflow definition
export const orderProcessingWorkflow = {
  id: 'order-processing',
  name: 'Order Processing',
  description: 'Complete e-commerce order fulfillment with inventory, payment, and shipping',
  version: '1.0.0',
  steps: [
    validateOrderStep,
    checkInventoryStep,
    calculatePricingStep,
    processPaymentStep,
    createFulfillmentStep,
    updateInventoryStep,
    sendOrderConfirmationStep,
    notifyWarehouseStep,
    scheduleStatusUpdatesStep,
    capturePaymentStep,
  ],
  config: {
    maxDuration: 300000, // 5 minutes
    compensationEnabled: true, // Enable saga pattern for rollback
    criticalSteps: [
      'process-payment',
      'update-inventory',
      'capture-payment',
    ],
  },
};