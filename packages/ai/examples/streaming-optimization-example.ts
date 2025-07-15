/**
 * Streaming Optimization Integration Example
 * Demonstrates how to use advanced streaming components together for optimal performance
 */

import {
  BackpressureController,
  EnhancedStreamBufferManager,
  bufferOptimizationUtils,
  type BufferOptimizationConfig,
} from '../src/server/streaming/advanced/buffer-optimization';

import {
  AdvancedFlowController,
  TrafficPriority,
  flowControlUtils,
} from '../src/server/streaming/advanced/flow-control';

import { EnhancedStreamData } from '../src/server/streaming/advanced/stream-data';

/**
 * Comprehensive streaming optimization example
 */
export async function streamingOptimizationExample() {
  console.log('🚀 Starting Streaming Optimization Example...');

  // 1. Setup optimized streaming components
  console.log('1️⃣ Setting up optimized streaming components');

  // Create backpressure controller with memory optimization
  const backpressureController = new BackpressureController({
    highWaterMark: 200,
    lowWaterMark: 100,
    strategy: 'throttle',
    memory: {
      maxBytes: 25 * 1024 * 1024, // 25MB
      autoGC: true,
      gcThreshold: 20 * 1024 * 1024, // 20MB
    },
  });

  // Create buffer optimization engine
  const bufferConfig = bufferOptimizationUtils.createOptimizedConfig('balanced');
  const bufferManager = new EnhancedStreamBufferManager(backpressureController, bufferConfig);

  // Create advanced flow controller
  const flowConfig = flowControlUtils.createConfig('balanced');
  const flowController = new AdvancedFlowController(
    flowConfig,
    backpressureController,
    bufferManager['optimizationEngine'], // Access the internal optimization engine
  );

  // Create enhanced stream data for monitoring
  const streamData = new EnhancedStreamData();

  console.log('✅ Components initialized');

  // 2. Simulate high-load streaming scenario
  console.log('2️⃣ Simulating high-load streaming scenario');

  const totalItems = 500;
  const batchSize = 20;
  const processingDelay = () => Math.random() * 50 + 10; // 10-60ms processing time

  streamData.appendProgress(0, totalItems, 'Starting processing');

  for (let batch = 0; batch < Math.ceil(totalItems / batchSize); batch++) {
    const batchStart = batch * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, totalItems);

    console.log(`   Processing batch ${batch + 1}: items ${batchStart + 1}-${batchEnd}`);

    // Process batch with flow control and optimization
    const batchPromises: Promise<void>[] = [];

    for (let i = batchStart; i < batchEnd; i++) {
      const priority = i % 10 === 0 ? TrafficPriority.HIGH : TrafficPriority.NORMAL;
      const item = { id: i, data: `Item ${i}`, priority };

      const promise = processBatchItem(
        item,
        flowController,
        bufferManager,
        streamData,
        processingDelay,
      );

      batchPromises.push(promise);
    }

    await Promise.all(batchPromises);

    // Update progress
    streamData.appendProgress(batchEnd, totalItems, `Completed batch ${batch + 1}`);

    // Get metrics after each batch
    if (batch % 3 === 0) {
      const flowMetrics = flowController.getMetrics();
      const bufferMetrics = bufferManager.getMetrics();

      console.log(
        `   📊 Metrics - Throughput: ${flowMetrics.actualThroughput.toFixed(2)}/s, ` +
          `Efficiency: ${bufferMetrics.efficiencyScore.toFixed(1)}%`,
      );

      streamData.appendAnalytics('batch_metrics', {
        batch: batch + 1,
        throughput: flowMetrics.actualThroughput,
        efficiency: bufferMetrics.efficiencyScore,
        congestion: flowMetrics.congestionLevel,
      });
    }
  }

  console.log('✅ Processing completed');

  // 3. Analyze performance and get recommendations
  console.log('3️⃣ Analyzing performance and generating recommendations');

  const finalFlowMetrics = flowController.getMetrics();
  const finalBufferMetrics = bufferManager.getMetrics();
  const flowRecommendations = flowController.getRecommendations();
  const bufferRecommendations = bufferManager.getRecommendations();

  console.log('📈 Final Performance Metrics:');
  console.log(`   • Throughput: ${finalFlowMetrics.actualThroughput.toFixed(2)} items/second`);
  console.log(`   • Flow Control Efficiency: ${finalFlowMetrics.efficiency.toFixed(1)}%`);
  console.log(`   • Buffer Efficiency: ${finalBufferMetrics.efficiencyScore.toFixed(1)}%`);
  console.log(`   • Average Latency: ${finalFlowMetrics.averageLatency.toFixed(2)}ms`);
  console.log(`   • Congestion Level: ${(finalFlowMetrics.congestionLevel * 100).toFixed(1)}%`);
  console.log(`   • Items Processed: ${finalFlowMetrics.totalProcessed}`);
  console.log(`   • Items Dropped: ${finalFlowMetrics.totalDropped}`);

  streamData.appendTyped('final_metrics', {
    flow: finalFlowMetrics,
    buffer: finalBufferMetrics,
  });

  console.log(`
💡 Optimization Recommendations:`);

  if (flowRecommendations.length > 0) {
    console.log('   Flow Control:');
    flowRecommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.description}`);
      console.log(`      Implementation: ${rec.implementation}`);
    });
  }

  if (bufferRecommendations.actions.length > 0) {
    console.log('   Buffer Optimization:');
    bufferRecommendations.actions.slice(0, 3).forEach((rec, i) => {
      console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.description}`);
      console.log(`      Expected improvement: ${rec.expectedImprovement}%`);
    });
  }

  streamData.appendTyped('recommendations', {
    flow: flowRecommendations,
    buffer: bufferRecommendations,
  });

  // 4. Apply automatic optimizations
  console.log('4️⃣ Applying automatic optimizations');

  try {
    const optimizationResults = await bufferManager.optimize();

    console.log('🔧 Buffer Optimizations Applied:');
    optimizationResults.applied.forEach((optimization, i) => {
      console.log(`   ${i + 1}. ${optimization}`);
    });

    if (optimizationResults.skipped.length > 0) {
      console.log('⚠️ Optimizations Skipped:');
      optimizationResults.skipped.forEach((skip, i) => {
        console.log(`   ${i + 1}. ${skip}`);
      });
    }

    streamData.appendTyped('optimizations_applied', optimizationResults);
  } catch (error) {
    console.error('❌ Optimization failed:', error);
    streamData.appendError(error instanceof Error ? error : new Error(String(error)));
  }

  // 5. Demonstrate different optimization scenarios
  console.log('5️⃣ Demonstrating different optimization scenarios');

  const scenarios = ['high_throughput', 'low_latency', 'memory_efficient'] as const;

  for (const scenario of scenarios) {
    console.log(`
   Testing ${scenario} configuration:`);

    const scenarioConfig = bufferOptimizationUtils.createOptimizedConfig(scenario);
    console.log(`   • Target Latency: ${scenarioConfig.targetLatency}ms`);
    console.log(`   • Max Buffer Size: ${scenarioConfig.maxBufferSize}`);
    console.log(
      `   • Memory Target: ${(scenarioConfig.memoryOptimization?.targetMemoryUsage || 0) * 100}%`,
    );

    // Simulate quick test with scenario
    const testResults = await simulateScenarioTest(scenario, scenarioConfig);
    console.log(`   • Simulated Efficiency: ${testResults.efficiency.toFixed(1)}%`);
    console.log(`   • Estimated Throughput: ${testResults.throughput.toFixed(1)} items/s`);

    streamData.appendTyped('scenario_test', {
      scenario,
      config: scenarioConfig,
      results: testResults,
    });
  }

  // 6. Generate comprehensive report
  console.log('6️⃣ Generating comprehensive optimization report');

  const comprehensiveReport = {
    summary: {
      totalItemsProcessed: finalFlowMetrics.totalProcessed,
      overallEfficiency: (finalFlowMetrics.efficiency + finalBufferMetrics.efficiencyScore) / 2,
      averageLatency: finalFlowMetrics.averageLatency,
      throughput: finalFlowMetrics.actualThroughput,
    },
    optimizationOpportunities: [
      ...flowRecommendations.map(r => ({ source: 'flow_control', ...r })),
      ...bufferRecommendations.actions.map(r => ({ source: 'buffer_optimization', ...r })),
    ],
    performanceTrends: finalBufferMetrics.trends,
    configuration: {
      buffer: bufferConfig,
      flow: flowConfig,
    },
  };

  console.log('📋 Comprehensive Optimization Report:');
  console.log(
    `   • Overall Efficiency: ${comprehensiveReport.summary.overallEfficiency.toFixed(1)}%`,
  );
  console.log(
    `   • Optimization Opportunities: ${comprehensiveReport.optimizationOpportunities.length}`,
  );
  console.log(`   • Performance Trends:`);
  console.log(`     - Latency: ${finalBufferMetrics.trends.latency}`);
  console.log(`     - Throughput: ${finalBufferMetrics.trends.throughput}`);
  console.log(`     - Memory: ${finalBufferMetrics.trends.memory}`);

  streamData.appendTyped('comprehensive_report', comprehensiveReport);
  streamData.closeWithSummary();

  // Cleanup
  bufferManager.destroy();
  flowController.destroy();

  console.log('✅ Streaming optimization example completed!');
  console.log('📊 Stream data contains detailed metrics and recommendations');

  return {
    metrics: {
      flow: finalFlowMetrics,
      buffer: finalBufferMetrics,
    },
    recommendations: {
      flow: flowRecommendations,
      buffer: bufferRecommendations,
    },
    report: comprehensiveReport,
    streamData,
  };
}

/**
 * Process a single batch item with flow control and optimization
 */
async function processBatchItem(
  item: { id: number; data: string; priority: TrafficPriority },
  flowController: AdvancedFlowController<any>,
  bufferManager: EnhancedStreamBufferManager<any>,
  streamData: EnhancedStreamData,
  processingDelay: () => number,
): Promise<void> {
  // Request permission from flow controller
  const permitted = await flowController.requestPermission(item, item.priority);

  if (!permitted) {
    streamData.appendError(`Item ${item.id} was dropped due to flow control`);
    return;
  }

  // Record processing start
  flowController.recordProcessingStart();

  // Process with buffer manager optimization tracking
  const success = await bufferManager.processItem(item, async processedItem => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, processingDelay()));

    // Simulate occasional errors (2% error rate)
    if (Math.random() < 0.02) {
      throw new Error(`Processing failed for item ${processedItem.id}`);
    }
  });

  // Record completion
  const processingTime = processingDelay();
  flowController.recordProcessingComplete(processingTime, success);
}

/**
 * Simulate scenario test
 */
async function simulateScenarioTest(
  scenario: string,
  config: BufferOptimizationConfig,
): Promise<{
  efficiency: number;
  throughput: number;
  latency: number;
}> {
  // Simulate different performance characteristics for each scenario
  const scenarioMultipliers = {
    high_throughput: { efficiency: 0.85, throughput: 1.5, latency: 1.2 },
    low_latency: { efficiency: 0.9, throughput: 1.0, latency: 0.6 },
    memory_efficient: { efficiency: 0.88, throughput: 0.8, latency: 1.1 },
  };

  const multiplier = scenarioMultipliers[scenario as keyof typeof scenarioMultipliers] || {
    efficiency: 0.8,
    throughput: 1.0,
    latency: 1.0,
  };

  return {
    efficiency: 75 * multiplier.efficiency + Math.random() * 15,
    throughput: 100 * multiplier.throughput + Math.random() * 30,
    latency: (config.targetLatency || 100) * multiplier.latency + Math.random() * 20,
  };
}

/**
 * Buffer size optimization benchmark
 */
export async function bufferSizeBenchmark() {
  console.log('📊 Running Buffer Size Optimization Benchmark...');

  const bufferSizes = [50, 100, 200, 500, 1000, 2000];
  const results: Array<{
    bufferSize: number;
    throughput: number;
    latency: number;
    efficiency: number;
    memoryUsage: number;
  }> = [];

  for (const bufferSize of bufferSizes) {
    console.log(`   Testing buffer size: ${bufferSize}`);

    const config: BufferOptimizationConfig = {
      maxBufferSize: bufferSize,
      minBufferSize: Math.max(10, Math.floor(bufferSize * 0.1)),
      targetLatency: 100,
      adaptiveBuffering: false, // Fixed size for benchmark
    };

    // Simulate performance for this buffer size
    const simulatedResults = await benchmarkBufferSize(bufferSize, config);
    results.push(simulatedResults);

    console.log(`   • Throughput: ${simulatedResults.throughput.toFixed(1)} items/s`);
    console.log(`   • Latency: ${simulatedResults.latency.toFixed(1)}ms`);
    console.log(`   • Efficiency: ${simulatedResults.efficiency.toFixed(1)}%`);
  }

  // Find optimal buffer size
  const optimalResult = results.reduce((best, current) =>
    current.efficiency > best.efficiency ? current : best,
  );

  console.log('\n🎯 Optimal Buffer Size Analysis:');
  console.log(`   • Optimal Size: ${optimalResult.bufferSize}`);
  console.log(`   • Peak Efficiency: ${optimalResult.efficiency.toFixed(1)}%`);
  console.log(`   • Throughput: ${optimalResult.throughput.toFixed(1)} items/s`);
  console.log(`   • Latency: ${optimalResult.latency.toFixed(1)}ms`);

  return {
    results,
    optimal: optimalResult,
  };
}

/**
 * Benchmark a specific buffer size
 */
async function benchmarkBufferSize(
  bufferSize: number,
  config: BufferOptimizationConfig,
): Promise<{
  bufferSize: number;
  throughput: number;
  latency: number;
  efficiency: number;
  memoryUsage: number;
}> {
  // Simulate realistic performance characteristics based on buffer size

  // Throughput generally increases with buffer size but has diminishing returns
  const baseThroughput = 80;
  const throughputBonus = Math.min(50, Math.log(bufferSize / 50) * 20);
  const throughput = baseThroughput + throughputBonus + (Math.random() - 0.5) * 10;

  // Latency increases slightly with larger buffers due to memory overhead
  const baseLatency = 80;
  const latencyPenalty = Math.log(bufferSize / 100) * 15;
  const latency = Math.max(50, baseLatency + latencyPenalty + (Math.random() - 0.5) * 20);

  // Memory usage scales roughly linearly with buffer size
  const memoryUsage = bufferSize * 2048 + Math.random() * 1024; // ~2KB per item

  // Efficiency balances throughput vs latency vs memory
  const throughputScore = Math.min(100, (throughput / 150) * 100);
  const latencyScore = Math.max(0, 100 - ((latency - 50) / 100) * 100);
  const memoryScore = Math.max(0, 100 - (memoryUsage / (1024 * 1024) / 50) * 100);

  const efficiency = throughputScore * 0.4 + latencyScore * 0.4 + memoryScore * 0.2;

  // Small delay to simulate actual benchmarking
  await new Promise(resolve => setTimeout(resolve, 100));

  return {
    bufferSize,
    throughput,
    latency,
    efficiency,
    memoryUsage,
  };
}

// Export the main example for easy testing
if (require.main === module) {
  streamingOptimizationExample()
    .then(results => {
      console.log('\n🎉 Example completed successfully!');
      console.log('Results summary:', {
        overallEfficiency:
          (results.metrics.flow.efficiency + results.metrics.buffer.efficiencyScore) / 2,
        recommendationCount:
          results.recommendations.flow.length + results.recommendations.buffer.actions.length,
      });
    })
    .catch(error => {
      console.error('❌ Example failed:', error);
      process.exit(1);
    });
}
