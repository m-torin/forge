/**
 * Fraud Detection Workflow
 * Simple hello world version with basic steps
 */

import { z } from 'zod';

import { createStep, createStepWithValidation } from '@repo/orchestration/server/next';

// Input schemas
const FraudDetectionInput = z.object({
  transactionId: z.string(),
  amount: z.number(),
  userId: z.string(),
});

// Step 1: Hello World - Validate Input
export const validateInputStep = createStepWithValidation(
  'validate-input',
  async (input: z.infer<typeof FraudDetectionInput>) => {
    console.log('Hello World from Step 1: Validating input');
    console.log(`Transaction ID: ${input.transactionId}`);
    console.log(`Amount: $${input.amount}`);
    console.log(`User ID: ${input.userId}`);

    return {
      ...input,
      message: 'Hello from validate input step!',
      validated: true,
      timestamp: new Date().toISOString(),
    };
  },
  (input) => input.amount > 0, // Pre-condition
  (output) => output.validated === true, // Post-condition
);

// Step 2: Hello World - Check Basic Rules
export const checkBasicRulesStep = createStep('check-rules', async (data: any) => {
  console.log('Hello World from Step 2: Checking basic rules');

  const rules = {
    maxAmount: 10000,
    suspicious: data.amount > 5000,
  };

  console.log(`Amount ${data.amount} is ${rules.suspicious ? 'suspicious' : 'normal'}`);

  return {
    ...data,
    rulesChecked: true,
    rules,
    message: 'Hello from check rules step!',
  };
});

// Step 3: Hello World - Calculate Risk Score
export const calculateRiskScoreStep = createStep('calculate-risk', async (data: any) => {
  console.log('Hello World from Step 3: Calculating risk score');

  // Simple risk calculation
  let riskScore = 0;
  if (data.amount > 1000) riskScore += 0.2;
  if (data.amount > 5000) riskScore += 0.3;
  if (data.rules?.suspicious) riskScore += 0.3;

  const riskLevel = riskScore > 0.5 ? 'high' : riskScore > 0.3 ? 'medium' : 'low';

  console.log(`Risk Score: ${riskScore}, Level: ${riskLevel}`);

  return {
    ...data,
    riskScore,
    riskLevel,
    message: 'Hello from calculate risk step!',
  };
});

// Step 4: Hello World - Take Action
export const takeActionStep = createStep('take-action', async (data: any) => {
  console.log('Hello World from Step 4: Taking action based on risk');

  let action = 'allow';
  if (data.riskLevel === 'high') {
    action = 'review';
  } else if (data.riskLevel === 'medium') {
    action = 'monitor';
  }

  console.log(`Action for transaction ${data.transactionId}: ${action}`);

  return {
    ...data,
    action,
    actionTaken: true,
    message: 'Hello from take action step!',
  };
});

// Step 5: Hello World - Generate Report
export const generateReportStep = createStep('generate-report', async (data: any) => {
  console.log('Hello World from Step 5: Generating report');

  const report = {
    summary: {
      transactionId: data.transactionId,
      amount: data.amount,
      userId: data.userId,
      riskScore: data.riskScore,
      riskLevel: data.riskLevel,
      action: data.action,
    },
    messages: [data.message, 'Hello from all steps!'],
    completedAt: new Date().toISOString(),
  };

  console.log('Report generated:', JSON.stringify(report, null, 2));

  return {
    ...data,
    report,
    workflowComplete: true,
    finalMessage: 'Hello World workflow completed successfully!',
  };
});

// Main workflow definition
export const fraudDetectionWorkflow = {
  id: 'fraud-detection',
  name: 'Fraud Detection - Hello World',
  description: 'Simple hello world fraud detection workflow with basic steps',
  version: '1.0.0',
  config: {
    maxDuration: 60000, // 1 minute
  },
  steps: [
    validateInputStep,
    checkBasicRulesStep,
    calculateRiskScoreStep,
    takeActionStep,
    generateReportStep,
  ],
};
