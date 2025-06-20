/**
 * Distributed Computation Workflow
 * Demonstrates map-reduce patterns, parallel execution, and dynamic step generation
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  createWorkflowStep,
  withStepMonitoring,
} from '@repo/orchestration/server/next';

// Input schema
const DistributedComputationInput = z.object({
  computation: z.object({
    type: z.enum(['aggregation', 'transformation', 'analysis', 'ml-training']),
    params: z.record(z.any()),
  }),
  dataset: z.object({
    partitionStrategy: z.enum(['round-robin', 'hash', 'range']),
    size: z.number(), // Total records
    source: z.string(),
  }),
  workers: z.number().min(1).max(100).default(10),
});

// Dynamic step factory for worker nodes
const createWorkerStep = (workerId: number, config: any) => {
  return createWorkflowStep(
    {
      name: `Worker-${workerId}`,
      category: 'compute',
      tags: ['worker', 'distributed'],
      version: '1.0.0',
    },
    async (context) => {
      const { computation, partition } = context.input;
      const startTime = Date.now();

      // Simulate different computation types
      let result: any;
      switch (computation.type) {
        case 'aggregation':
          result = {
            avg: partition.data.reduce((a: number, b: number) => a + b, 0) / partition.data.length,
            count: partition.data.length,
            max: Math.max(...partition.data),
            min: Math.min(...partition.data),
            sum: partition.data.reduce((a: number, b: number) => a + b, 0),
          };
          break;
        case 'transformation':
          result = partition.data.map((item: any) => ({
            metadata: { processedBy: workerId },
            original: item,
            transformed: item * computation.params.multiplier || 2,
          }));
          break;
        case 'analysis':
          // Simulate complex analysis
          await new Promise((resolve) => setTimeout(resolve, 500));
          result = {
            confidence: Math.random(),
            anomalies: Math.floor(Math.random() * 5),
            patterns: Math.floor(Math.random() * 10),
          };
          break;
        case 'ml-training':
          // Simulate model training
          await new Promise((resolve) => setTimeout(resolve, 1000));
          result = {
            modelUpdate: {
              epoch: computation.params.epoch || 1,
              loss: Math.random() * 0.1,
              weights: Array(10)
                .fill(0)
                .map(() => Math.random()),
            },
          };
          break;
      }

      return {
        output: {
          memoryUsage: process.memoryUsage().heapUsed,
          partition: partition.id,
          processingTime: Date.now() - startTime,
          result,
          workerId,
        },
        success: true,
      };
    },
    {
      retries: 2,
      timeout: 60000,
    },
  );
};

// Step 1: Partition dataset
export const partitionDatasetStep = createStep(
  'partition-dataset',
  async (input: z.infer<typeof DistributedComputationInput>) => {
    const { dataset, workers } = input;
    const partitions = [];
    const recordsPerPartition = Math.ceil(dataset.size / workers);

    // Generate mock data and partition it
    for (let i = 0; i < workers; i++) {
      const start = i * recordsPerPartition;
      const end = Math.min(start + recordsPerPartition, dataset.size);

      // Simulate data based on partition strategy
      let data: any[];
      switch (dataset.partitionStrategy) {
        case 'round-robin':
          data = Array.from({ length: end - start }, (_, j) => start + j);
          break;
        case 'hash':
          // Hash-based partitioning for key-based distribution
          data = Array.from({ length: end - start }, (_, j) => ({
            key: `key_${(start + j) % 100}`,
            value: Math.random() * 1000,
          }));
          break;
        case 'range':
          // Range-based partitioning
          const rangeSize = 1000 / workers;
          data = Array.from(
            { length: end - start },
            () => i * rangeSize + Math.random() * rangeSize,
          );
          break;
      }

      partitions.push({
        id: `partition_${i}`,
        data,
        endIndex: end,
        size: data.length,
        startIndex: start,
        workerId: i,
      });
    }

    return {
      ...input,
      partitionCount: partitions.length,
      partitionedAt: new Date().toISOString(),
      partitions,
      totalRecords: dataset.size,
    };
  },
);

// Step 2: Dynamically create and execute worker steps
export const executeWorkersStep = compose(
  createStep('execute-workers', async (data: any) => {
    const { computation, partitions, workers } = data;

    // Create worker steps dynamically
    const workerSteps = partitions.map((partition: any, index: number) => {
      const workerStep = createWorkerStep(index, { computation });
      return workerStep;
    });

    // Execute all workers in parallel
    const startTime = Date.now();
    const results = await Promise.all(
      workerSteps.map((step: any, index: any) =>
        step.execute({
          executionId: `exec_${Date.now()}_${index}`,
          input: {
            computation,
            partition: partitions[index],
          },
          startTime,
          workflowId: 'distributed-computation',
        }),
      ),
    );

    // Collect execution stats
    const executionStats = {
      avgProcessingTime:
        results.reduce((sum, r) => sum + (r.output?.processingTime || 0), 0) / results.length,
      failedWorkers: results.filter((r) => !r.success).length,
      successfulWorkers: results.filter((r) => r.success).length,
      totalMemoryUsed: results.reduce((sum, r) => sum + (r.output?.memoryUsage || 0), 0),
      totalProcessingTime: Date.now() - startTime,
      totalWorkers: workers,
    };

    return {
      ...data,
      executedAt: new Date().toISOString(),
      executionStats,
      workerResults: results.map((r) => r.output),
    };
  }),
  (step: any) => withStepMonitoring(step),
);

// Step 3: Reduce results
export const reduceResultsStep = createStep('reduce-results', async (data: any) => {
  const { computation, workerResults } = data;
  let finalResult: any;

  switch (computation.type) {
    case 'aggregation':
      // Combine aggregation results
      finalResult = workerResults.reduce(
        (acc: any, worker: any) => ({
          count: (acc.count || 0) + worker.result.count,
          max: Math.max(acc.max ?? -Infinity, worker.result.max),
          min: Math.min(acc.min ?? Infinity, worker.result.min),
          sum: (acc.sum || 0) + worker.result.sum,
        }),
        {},
      );
      finalResult.avg = finalResult.sum / finalResult.count;
      break;

    case 'transformation':
      // Merge transformed data
      finalResult = {
        totalTransformed: workerResults.reduce((sum: number, w: any) => sum + w.result.length, 0),
        transformedData: workerResults.flatMap((w: any) => w.result),
      };
      break;

    case 'analysis':
      // Aggregate analysis results
      finalResult = {
        avgConfidence:
          workerResults.reduce((sum: number, w: any) => sum + w.result.confidence, 0) /
          workerResults.length,
        totalAnomalies: workerResults.reduce((sum: number, w: any) => sum + w.result.anomalies, 0),
        totalPatterns: workerResults.reduce((sum: number, w: any) => sum + w.result.patterns, 0),
      };
      break;

    case 'ml-training':
      // Average model updates
      const modelUpdates = workerResults.map((w: any) => w.result.modelUpdate);
      finalResult = {
        averagedWeights: modelUpdates[0].weights.map(
          (_: any, i: number) =>
            modelUpdates.reduce((sum: number, update: any) => sum + update.weights[i], 0) /
            modelUpdates.length,
        ),
        avgLoss:
          modelUpdates.reduce((sum: number, u: any) => sum + u.loss, 0) / modelUpdates.length,
        epoch: modelUpdates[0].epoch,
      };
      break;
  }

  return {
    ...data,
    reducedResult: finalResult,
    reductionComplete: true,
  };
});

// Step 4: Validate results
export const validateResultsStep = createStepWithValidation(
  'validate-results',
  async (data: any) => {
    const { computation, dataset, reducedResult } = data;
    const validation = {
      valid: true,
      errors: [] as string[],
      warnings: [] as string[],
    };

    // Validation based on computation type
    if (computation.type === 'aggregation') {
      if (reducedResult.count !== dataset.size) {
        validation.errors.push(
          `Count mismatch: expected ${dataset.size}, got ${reducedResult.count}`,
        );
        validation.valid = false;
      }
    }

    if (computation.type === 'ml-training' && reducedResult.avgLoss > 0.5) {
      validation.warnings.push('High loss value detected - model may need more epochs');
    }

    return {
      ...data,
      validatedAt: new Date().toISOString(),
      validation,
    };
  },
  (data: any) => !!data.reducedResult,
  (result: any) => result.validation.valid,
);

// Step 5: Cache results
export const cacheResultsStep = createStep('cache-results', async (data: any) => {
  const shouldCache = data.options?.cache_results !== false;

  if (!shouldCache) {
    return {
      ...data,
      cacheSkipped: true,
    };
  }

  const cacheKey = `computation_${data.computation.type}_${Date.now()}`;
  const ttl = 3600; // 1 hour

  // Simulate caching
  console.log(`Caching results with key: ${cacheKey}`);

  return {
    ...data,
    cache: {
      key: cacheKey,
      size: JSON.stringify(data.reducedResult).length,
      storedAt: new Date().toISOString(),
      ttl,
    },
  };
});

// Step 6: Generate computation report
export const generateReportStep = createStep('generate-report', async (data: any) => {
  const { validation, executionStats, reducedResult } = data;

  const report = {
    validation,
    performance: {
      avgWorkerTime: `${(executionStats.avgProcessingTime / 1000).toFixed(2)}s`,
      parallelEfficiency: `${((1 / data.workers) * (executionStats.totalProcessingTime / executionStats.avgProcessingTime) * 100).toFixed(1)}%`,
      totalMemoryUsed: `${(executionStats.totalMemoryUsed / 1024 / 1024).toFixed(2)}MB`,
    },
    recommendations: [] as string[],
    results: reducedResult,
    summary: {
      computationType: data.computation.type,
      processingTime: `${(executionStats.totalProcessingTime / 1000).toFixed(2)}s`,
      status: validation.valid ? 'success' : 'completed_with_errors',
      throughput: `${Math.floor(data.dataset.size / (executionStats.totalProcessingTime / 1000))} records/sec`,
      totalRecords: data.dataset.size,
      workersUsed: data.workers,
    },
  };

  // Add recommendations based on performance
  if (executionStats.avgProcessingTime > 10000) {
    report.recommendations.push('Consider increasing worker count for better performance');
  }

  if (executionStats.failedWorkers > 0) {
    report.recommendations.push(
      `${executionStats.failedWorkers} workers failed - investigate error logs`,
    );
  }

  return {
    ...data,
    report,
    workflowComplete: true,
  };
});

// Main workflow definition
export const distributedComputationWorkflow = {
  id: 'distributed-computation',
  name: 'Distributed Computation',
  config: {
    maxDuration: 600000, // 10 minutes
    monitoring: {
      customDashboard: 'distributed-compute',
      enableDetailedMetrics: true,
    },
  },
  description: 'Map-reduce pattern with dynamic worker generation and parallel execution',
  features: {
    dynamicSteps: true,
    mapReduce: true,
    parallelExecution: true,
    stepFactory: true,
  },
  steps: [
    partitionDatasetStep,
    executeWorkersStep,
    reduceResultsStep,
    validateResultsStep,
    cacheResultsStep,
    generateReportStep,
  ],
  version: '1.0.0',
};
