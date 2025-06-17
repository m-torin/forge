/**
 * Inventory Sync Workflow
 * Simple hello world version with basic steps
 */

import { z } from 'zod';

import { createStep, createStepWithValidation } from '@repo/orchestration/server/next';

// Input schemas
const InventorySyncInput = z.object({
  productId: z.string(),
  warehouseId: z.string(),
  quantity: z.number(),
});

// Step 1: Hello World - Fetch Current Inventory
export const fetchInventoryStep = createStepWithValidation(
  'fetch-inventory',
  async (input: z.infer<typeof InventorySyncInput>) => {
    console.log('Hello World from Step 1: Fetching current inventory');
    console.log(`Product ID: ${input.productId}`);
    console.log(`Warehouse ID: ${input.warehouseId}`);

    // Simulate fetching current inventory
    const currentQuantity = Math.floor(Math.random() * 100);

    return {
      ...input,
      currentQuantity,
      message: 'Hello from fetch inventory step!',
      timestamp: new Date().toISOString(),
    };
  },
  (input) => input.quantity >= 0, // Pre-condition
  (output) => output.currentQuantity !== undefined, // Post-condition
);

// Step 2: Hello World - Calculate Difference
export const calculateDifferenceStep = createStep('calculate-difference', async (data: any) => {
  console.log('Hello World from Step 2: Calculating inventory difference');

  const difference = data.quantity - data.currentQuantity;
  const action = difference > 0 ? 'add' : difference < 0 ? 'remove' : 'no-change';

  console.log(`Current: ${data.currentQuantity}, New: ${data.quantity}, Difference: ${difference}`);
  console.log(`Action: ${action}`);

  return {
    ...data,
    difference,
    action,
    message: 'Hello from calculate difference step!',
  };
});

// Step 3: Hello World - Update Inventory
export const updateInventoryStep = createStep('update-inventory', async (data: any) => {
  console.log('Hello World from Step 3: Updating inventory');

  let updateResult = {
    success: true,
    previousQuantity: data.currentQuantity,
    newQuantity: data.quantity,
    action: data.action,
  };

  if (data.action === 'no-change') {
    console.log('No inventory change needed');
  } else {
    console.log(`Updating inventory from ${data.currentQuantity} to ${data.quantity}`);
  }

  return {
    ...data,
    updateResult,
    updated: true,
    message: 'Hello from update inventory step!',
  };
});

// Step 4: Hello World - Send Notifications
export const sendNotificationsStep = createStep('send-notifications', async (data: any) => {
  console.log('Hello World from Step 4: Sending notifications');

  const notifications = [];

  if (data.quantity === 0) {
    notifications.push({
      type: 'out-of-stock',
      message: `Product ${data.productId} is out of stock at warehouse ${data.warehouseId}`,
    });
  } else if (data.quantity < 10) {
    notifications.push({
      type: 'low-stock',
      message: `Product ${data.productId} has low stock (${data.quantity}) at warehouse ${data.warehouseId}`,
    });
  }

  console.log(`Sending ${notifications.length} notifications`);

  return {
    ...data,
    notifications,
    notificationsSent: notifications.length,
    message: 'Hello from send notifications step!',
  };
});

// Step 5: Hello World - Generate Report
export const generateReportStep = createStep('generate-report', async (data: any) => {
  console.log('Hello World from Step 5: Generating sync report');

  const report = {
    summary: {
      productId: data.productId,
      warehouseId: data.warehouseId,
      previousQuantity: data.currentQuantity,
      newQuantity: data.quantity,
      difference: data.difference,
      action: data.action,
      notifications: data.notifications.length,
    },
    messages: [data.message, 'Hello from all inventory sync steps!'],
    completedAt: new Date().toISOString(),
  };

  console.log('Report generated:', JSON.stringify(report, null, 2));

  return {
    ...data,
    report,
    workflowComplete: true,
    finalMessage: 'Hello World inventory sync completed!',
  };
});

// Main workflow definition
export const inventorySyncWorkflow = {
  id: 'inventory-sync',
  name: 'Inventory Sync - Hello World',
  description: 'Simple hello world inventory sync workflow',
  version: '1.0.0',
  config: {
    maxDuration: 60000, // 1 minute
  },
  steps: [
    fetchInventoryStep,
    calculateDifferenceStep,
    updateInventoryStep,
    sendNotificationsStep,
    generateReportStep,
  ],
};
