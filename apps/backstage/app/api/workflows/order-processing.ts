/**
 * Order Processing Workflow
 * Simple hello world version with basic steps
 */

import { z } from 'zod';

import { createStep, createStepWithValidation } from '@repo/orchestration/server/next';

// Input schemas
const OrderProcessingInput = z.object({
  orderId: z.string(),
  customerId: z.string(),
  totalAmount: z.number(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number(),
      price: z.number(),
    }),
  ),
});

// Step 1: Hello World - Validate Order
export const validateOrderStep = createStepWithValidation(
  'validate-order',
  async (input: z.infer<typeof OrderProcessingInput>) => {
    console.log('Hello World from Step 1: Validating order');
    console.log(`Order ID: ${input.orderId}`);
    console.log(`Customer ID: ${input.customerId}`);
    console.log(`Total Amount: $${input.totalAmount}`);
    console.log(`Items: ${input.items.length}`);

    // Simple validation
    const isValid = input.totalAmount > 0 && input.items.length > 0;

    return {
      ...input,
      isValid,
      message: 'Hello from validate order step!',
      timestamp: new Date().toISOString(),
    };
  },
  (input) => input.items.length > 0, // Pre-condition
  (output) => output.isValid !== undefined, // Post-condition
);

// Step 2: Hello World - Check Inventory
export const checkInventoryStep = createStep('check-inventory', async (data: any) => {
  console.log('Hello World from Step 2: Checking inventory');

  // Simulate inventory check
  const inventoryStatus = data.items.map((item: any) => ({
    productId: item.productId,
    requested: item.quantity,
    available: Math.floor(Math.random() * 20),
    inStock: true, // Simplified - always in stock for hello world
  }));

  const allInStock = inventoryStatus.every((item: any) => item.inStock);

  console.log(`All items in stock: ${allInStock}`);

  return {
    ...data,
    inventoryStatus,
    allInStock,
    message: 'Hello from check inventory step!',
  };
});

// Step 3: Hello World - Process Payment
export const processPaymentStep = createStep('process-payment', async (data: any) => {
  console.log('Hello World from Step 3: Processing payment');

  // Simulate payment processing
  const paymentResult = {
    success: Math.random() > 0.1, // 90% success rate
    transactionId: `txn_${Date.now()}`,
    amount: data.totalAmount,
    currency: 'USD',
  };

  console.log(`Payment ${paymentResult.success ? 'succeeded' : 'failed'}`);
  console.log(`Transaction ID: ${paymentResult.transactionId}`);

  return {
    ...data,
    paymentResult,
    paymentProcessed: true,
    message: 'Hello from process payment step!',
  };
});

// Step 4: Hello World - Update Order Status
export const updateOrderStatusStep = createStep('update-status', async (data: any) => {
  console.log('Hello World from Step 4: Updating order status');

  let orderStatus = 'pending';
  if (data.paymentResult.success && data.allInStock) {
    orderStatus = 'confirmed';
  } else if (!data.paymentResult.success) {
    orderStatus = 'payment-failed';
  } else if (!data.allInStock) {
    orderStatus = 'inventory-issue';
  }

  console.log(`Order status updated to: ${orderStatus}`);

  return {
    ...data,
    orderStatus,
    statusUpdated: true,
    message: 'Hello from update status step!',
  };
});

// Step 5: Hello World - Send Confirmation
export const sendConfirmationStep = createStep('send-confirmation', async (data: any) => {
  console.log('Hello World from Step 5: Sending order confirmation');

  const confirmation = {
    orderId: data.orderId,
    customerId: data.customerId,
    status: data.orderStatus,
    totalAmount: data.totalAmount,
    itemCount: data.items.length,
    message:
      data.orderStatus === 'confirmed'
        ? 'Your order has been confirmed!'
        : 'There was an issue with your order',
    timestamp: new Date().toISOString(),
  };

  console.log('Sending confirmation:', confirmation);

  return {
    ...data,
    confirmation,
    confirmationSent: true,
    message: 'Hello from send confirmation step!',
  };
});

// Step 6: Hello World - Generate Report
export const generateReportStep = createStep('generate-report', async (data: any) => {
  console.log('Hello World from Step 6: Generating order report');

  const report = {
    summary: {
      orderId: data.orderId,
      customerId: data.customerId,
      totalAmount: data.totalAmount,
      itemCount: data.items.length,
      orderStatus: data.orderStatus,
      paymentSuccess: data.paymentResult.success,
      allItemsInStock: data.allInStock,
    },
    messages: [data.message, 'Hello from all order processing steps!'],
    completedAt: new Date().toISOString(),
  };

  console.log('Report generated:', JSON.stringify(report, null, 2));

  return {
    ...data,
    report,
    workflowComplete: true,
    finalMessage: 'Hello World order processing completed!',
  };
});

// Main workflow definition
export const orderProcessingWorkflow = {
  id: 'order-processing',
  name: 'Order Processing - Hello World',
  description: 'Simple hello world order processing workflow',
  version: '1.0.0',
  config: {
    maxDuration: 60000, // 1 minute
  },
  steps: [
    validateOrderStep,
    checkInventoryStep,
    processPaymentStep,
    updateOrderStatusStep,
    sendConfirmationStep,
    generateReportStep,
  ],
};
