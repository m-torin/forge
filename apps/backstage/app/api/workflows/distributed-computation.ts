/**
 * Distributed Computation Workflow
 * Demonstrates map-reduce patterns, parallel execution, and dynamic step generation
 */

import {
  createStep,
  StepTemplates,
  withStepRetry,
  withStepMonitoring,
  compose,
  StepFactory,
  StandardWorkflowStep,
  createWorkflowStep,
} from '@repo/orchestration';
import { z } from 'zod';

// Input schema
const DistributedComputationInput = z.object({
  dataset: z.object({
    source: z.string(),
    size: z.number(), // Total records
    partitionStrategy: z.enum(['round-robin', 'hash', 'range']),
  }),
  computation: z.object({
    type: z.enum(['aggregation', 'transformation', 'analysis', 'ml-training']),
    params: z.record(z.any()),
  }),
  workers: z.number().min(1).max(100).default(10),
});

// Dynamic step factory for worker nodes
const createWorkerStep = (workerId: number, config: any) => {
  return createWorkflowStep(
    {
      name: `Worker-${workerId}`,
      version: '1.0.0',
      category: 'compute',
      tags: ['worker', 'distributed'],
    },
    async (context) => {
      const { partition, computation } = context.input;
      
      // Simulate different computation types
      let result: any;
      switch (computation.type) {
        case 'aggregation':
          result = {
            sum: partition.data.reduce((a: number, b: number) => a + b, 0),
            count: partition.data.length,
            avg: partition.data.reduce((a: number, b: number) => a + b, 0) / partition.data.length,
            min: Math.min(...partition.data),
            max: Math.max(...partition.data),
          };
          break;
        case 'transformation':
          result = partition.data.map((item: any) => ({
            original: item,
            transformed: item * computation.params.multiplier || 2,
            metadata: { processedBy: workerId },
          }));
          break;
        case 'analysis':
          // Simulate complex analysis
          await new Promise(resolve => setTimeout(resolve, 500));
          result = {
            patterns: Math.floor(Math.random() * 10),
            anomalies: Math.floor(Math.random() * 5),
            confidence: Math.random(),
          };
          break;
        case 'ml-training':
          // Simulate model training
          await new Promise(resolve => setTimeout(resolve, 1000));
          result = {
            modelUpdate: {
              weights: Array(10).fill(0).map(() => Math.random()),
              loss: Math.random() * 0.1,
              epoch: computation.params.epoch || 1,
            },
          };
          break;
      }
      
      return {
        success: true,
        output: {
          workerId,
          partition: partition.id,
          result,
          processingTime: Date.now() - context.startTime,
          memoryUsage: process.memoryUsage().heapUsed,
        },
      };
    },
    {
      executionConfig: {
        timeout: { execution: 60000 },
        retryConfig: {
          maxAttempts: 2,
          backoff: 'exponential',
        },
      },
    }
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
          data = Array.from({ length: end - start }, () => 
            i * rangeSize + Math.random() * rangeSize
          );
          break;
      }
      
      partitions.push({
        id: `partition_${i}`,
        workerId: i,
        data,
        size: data.length,
        startIndex: start,
        endIndex: end,
      });
    }
    
    return {
      ...input,
      partitions,
      partitionCount: partitions.length,
      totalRecords: dataset.size,
      partitionedAt: new Date().toISOString(),
    };
  }
);

// Step 2: Dynamically create and execute worker steps
export const executeWorkersStep = compose(
  createStep('execute-workers', async (data: any) => {
    const { partitions, computation, workers } = data;
    const stepFactory = new StepFactory();
    
    // Create worker steps dynamically
    const workerSteps = partitions.map((partition: any, index: number) => {
      const workerStep = createWorkerStep(index, { computation });
      stepFactory.register(workerStep);
      return workerStep;
    });
    
    // Execute all workers in parallel
    const startTime = Date.now();
    const results = await Promise.all(
      workerSteps.map((step, index) => 
        step.execute({
          input: {
            partition: partitions[index],
            computation,
          },
          executionId: `exec_${Date.now()}_${index}`,
          workflowId: 'distributed-computation',
          startTime,
        })
      )
    );
    
    // Collect execution stats
    const executionStats = {
      totalWorkers: workers,
      successfulWorkers: results.filter(r => r.success).length,
      failedWorkers: results.filter(r => !r.success).length,
      totalProcessingTime: Date.now() - startTime,
      avgProcessingTime: results.reduce((sum, r) => sum + (r.output?.processingTime || 0), 0) / results.length,
      totalMemoryUsed: results.reduce((sum, r) => sum + (r.output?.memoryUsage || 0), 0),
    };
    
    return {
      ...data,
      workerResults: results.map(r => r.output),
      executionStats,
      executedAt: new Date().toISOString(),
    };
  }),
  (step) => withStepMonitoring(step, {
    enableDetailedLogging: true,
    customMetrics: ['workerCount', 'processingTime', 'memoryUsage'],
  })
);

// Step 3: Reduce results
export const reduceResultsStep = createStep(
  'reduce-results',
  async (data: any) => {
    const { workerResults, computation } = data;
    let finalResult: any;
    
    switch (computation.type) {
      case 'aggregation':
        // Combine aggregation results
        finalResult = workerResults.reduce((acc: any, worker: any) => ({
          sum: (acc.sum || 0) + worker.result.sum,
          count: (acc.count || 0) + worker.result.count,
          min: Math.min(acc.min ?? Infinity, worker.result.min),
          max: Math.max(acc.max ?? -Infinity, worker.result.max),
        }), {});
        finalResult.avg = finalResult.sum / finalResult.count;
        break;
        
      case 'transformation':
        // Merge transformed data
        finalResult = {
          transformedData: workerResults.flatMap((w: any) => w.result),
          totalTransformed: workerResults.reduce((sum: number, w: any) => sum + w.result.length, 0),
        };
        break;
        
      case 'analysis':
        // Aggregate analysis results
        finalResult = {
          totalPatterns: workerResults.reduce((sum: number, w: any) => sum + w.result.patterns, 0),
          totalAnomalies: workerResults.reduce((sum: number, w: any) => sum + w.result.anomalies, 0),
          avgConfidence: workerResults.reduce((sum: number, w: any) => sum + w.result.confidence, 0) / workerResults.length,
        };
        break;
        
      case 'ml-training':
        // Average model updates
        const modelUpdates = workerResults.map((w: any) => w.result.modelUpdate);
        finalResult = {
          averagedWeights: modelUpdates[0].weights.map((_: any, i: number) =>
            modelUpdates.reduce((sum: number, update: any) => sum + update.weights[i], 0) / modelUpdates.length
          ),
          avgLoss: modelUpdates.reduce((sum: number, u: any) => sum + u.loss, 0) / modelUpdates.length,
          epoch: modelUpdates[0].epoch,
        };
        break;
    }
    
    return {
      ...data,
      reducedResult: finalResult,
      reductionComplete: true,
    };
  }
);

// Step 4: Validate results
export const validateResultsStep = createStepWithValidation(
  'validate-results',
  async (data: any) => {
    const { reducedResult, computation, dataset } = data;
    const validation = {
      valid: true,
      warnings: [] as string[],
      errors: [] as string[],
    };
    
    // Validation based on computation type
    if (computation.type === 'aggregation') {
      if (reducedResult.count !== dataset.size) {
        validation.errors.push(`Count mismatch: expected ${dataset.size}, got ${reducedResult.count}`);
        validation.valid = false;
      }
    }
    
    if (computation.type === 'ml-training' && reducedResult.avgLoss > 0.5) {
      validation.warnings.push('High loss value detected - model may need more epochs');
    }
    
    return {
      ...data,
      validation,
      validatedAt: new Date().toISOString(),
    };
  },
  (data) => !!data.reducedResult,
  (result) => result.validation.valid
);

// Step 5: Cache results
export const cacheResultsStep = StepTemplates.conditional(
  'cache-results',
  'Cache computation results for future use',
  {
    condition: (data: any) => data.computation.params.enableCache !== false,
    trueStep: createStep('store-cache', async (data: any) => {
      const cacheKey = `computation_${data.computation.type}_${Date.now()}`;
      const ttl = 3600; // 1 hour
      
      // Simulate caching
      console.log(`Caching results with key: ${cacheKey}`);
      
      return {
        ...data,
        cache: {
          key: cacheKey,
          ttl,
          size: JSON.stringify(data.reducedResult).length,
          storedAt: new Date().toISOString(),
        },
      };
    }),
  }
);

// Step 6: Generate computation report
export const generateReportStep = createStep(
  'generate-report',
  async (data: any) => {
    const { executionStats, reducedResult, validation } = data;
    
    const report = {
      summary: {
        computationType: data.computation.type,
        totalRecords: data.dataset.size,
        workersUsed: data.workers,
        processingTime: `${(executionStats.totalProcessingTime / 1000).toFixed(2)}s`,
        throughput: `${Math.floor(data.dataset.size / (executionStats.totalProcessingTime / 1000))} records/sec`,
        status: validation.valid ? 'success' : 'completed_with_errors',
      },
      performance: {
        avgWorkerTime: `${(executionStats.avgProcessingTime / 1000).toFixed(2)}s`,
        totalMemoryUsed: `${(executionStats.totalMemoryUsed / 1024 / 1024).toFixed(2)}MB`,
        parallelEfficiency: `${((1 / data.workers) * (executionStats.totalProcessingTime / executionStats.avgProcessingTime) * 100).toFixed(1)}%`,
      },
      results: reducedResult,
      validation,
      recommendations: [],
    };
    
    // Add recommendations based on performance
    if (executionStats.avgProcessingTime > 10000) {
      report.recommendations.push('Consider increasing worker count for better performance');
    }
    
    if (executionStats.failedWorkers > 0) {
      report.recommendations.push(`${executionStats.failedWorkers} workers failed - investigate error logs`);
    }
    
    return {
      ...data,
      report,
      workflowComplete: true,
    };
  }
);

// Main workflow definition
export const distributedComputationWorkflow = {
  id: 'distributed-computation',
  name: 'Distributed Computation',
  description: 'Map-reduce pattern with dynamic worker generation and parallel execution',
  version: '1.0.0',
  steps: [
    partitionDatasetStep,
    executeWorkersStep,
    reduceResultsStep,
    validateResultsStep,
    cacheResultsStep,
    generateReportStep,
  ],
  config: {
    maxDuration: 600000, // 10 minutes
    monitoring: {
      enableDetailedMetrics: true,
      customDashboard: 'distributed-compute',
    },
  },
  features: {
    dynamicSteps: true,
    mapReduce: true,
    parallelExecution: true,
    stepFactory: true,
  },
};