/**
 * Performance Monitoring Workflow
 * Simple hello world version with basic steps
 */

import { z } from 'zod';

import { createStep, createStepWithValidation } from '@repo/orchestration/server/next';

// Input schemas
const PerformanceMonitoringInput = z.object({
  serviceName: z.string(),
  metricType: z.enum(['cpu', 'memory', 'response_time']),
  threshold: z.number(),
});

// Step 1: Hello World - Collect Metrics
export const collectMetricsStep = createStepWithValidation(
  'collect-metrics',
  async (input: z.infer<typeof PerformanceMonitoringInput>) => {
    console.log('Hello World from Step 1: Collecting metrics');
    console.log(`Service: ${input.serviceName}`);
    console.log(`Metric Type: ${input.metricType}`);

    // Simulate metric collection
    const currentValue = Math.random() * 100;

    return {
      ...input,
      currentValue,
      message: 'Hello from collect metrics step!',
      timestamp: new Date().toISOString(),
    };
  },
  (input) => input.threshold > 0, // Pre-condition
  (output) => output.currentValue !== undefined, // Post-condition
);

// Step 2: Hello World - Analyze Performance
export const analyzePerformanceStep = createStep('analyze-performance', async (data: any) => {
  console.log('Hello World from Step 2: Analyzing performance');

  const isAboveThreshold = data.currentValue > data.threshold;
  const status = isAboveThreshold ? 'warning' : 'healthy';

  console.log(`Current value: ${data.currentValue.toFixed(2)}, Threshold: ${data.threshold}`);
  console.log(`Status: ${status}`);

  return {
    ...data,
    isAboveThreshold,
    status,
    message: 'Hello from analyze performance step!',
  };
});

// Step 3: Hello World - Generate Alert
export const generateAlertStep = createStep('generate-alert', async (data: any) => {
  console.log('Hello World from Step 3: Generating alert if needed');

  let alert = null;
  if (data.isAboveThreshold) {
    alert = {
      level: 'warning',
      message: `${data.serviceName} ${data.metricType} is above threshold`,
      value: data.currentValue,
      threshold: data.threshold,
    };
    console.log('Alert generated:', alert);
  } else {
    console.log('No alert needed - performance is healthy');
  }

  return {
    ...data,
    alert,
    alertChecked: true,
    message: 'Hello from generate alert step!',
  };
});

// Step 4: Hello World - Store Metrics
export const storeMetricsStep = createStep('store-metrics', async (data: any) => {
  console.log('Hello World from Step 4: Storing metrics');

  const record = {
    service: data.serviceName,
    metric: data.metricType,
    value: data.currentValue,
    status: data.status,
    timestamp: data.timestamp,
  };

  console.log('Storing metric record:', record);

  return {
    ...data,
    stored: true,
    record,
    message: 'Hello from store metrics step!',
  };
});

// Step 5: Hello World - Generate Report
export const generateReportStep = createStep('generate-report', async (data: any) => {
  console.log('Hello World from Step 5: Generating performance report');

  const report = {
    summary: {
      service: data.serviceName,
      metric: data.metricType,
      currentValue: data.currentValue,
      threshold: data.threshold,
      status: data.status,
      hasAlert: data.alert !== null,
    },
    messages: [data.message, 'Hello from all performance monitoring steps!'],
    completedAt: new Date().toISOString(),
  };

  console.log('Report generated:', JSON.stringify(report, null, 2));

  return {
    ...data,
    report,
    workflowComplete: true,
    finalMessage: 'Hello World performance monitoring completed!',
  };
});

// Main workflow definition
export const performanceMonitoringWorkflow = {
  id: 'performance-monitoring',
  name: 'Performance Monitoring - Hello World',
  description: 'Simple hello world performance monitoring workflow',
  version: '1.0.0',
  config: {
    maxDuration: 60000, // 1 minute
  },
  steps: [
    collectMetricsStep,
    analyzePerformanceStep,
    generateAlertStep,
    storeMetricsStep,
    generateReportStep,
  ],
};
