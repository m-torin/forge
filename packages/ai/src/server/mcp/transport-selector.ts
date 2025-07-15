import { MCPClientConfig } from './client';

/**
 * Transport selection criteria
 */
export interface TransportSelectionCriteria {
  latencyRequirement: 'low' | 'medium' | 'high';
  reliabilityRequirement: 'basic' | 'standard' | 'high';
  throughputRequirement: 'low' | 'medium' | 'high';
  networkEnvironment: 'local' | 'lan' | 'wan' | 'internet';
  securityRequirement: 'basic' | 'standard' | 'high';
  scalabilityRequirement: 'single' | 'multiple' | 'massive';
}

/**
 * Transport performance characteristics
 */
interface TransportCharacteristics {
  latency: number; // Lower is better (1-10 scale)
  reliability: number; // Higher is better (1-10 scale)
  throughput: number; // Higher is better (1-10 scale)
  scalability: number; // Higher is better (1-10 scale)
  security: number; // Higher is better (1-10 scale)
  complexity: number; // Lower is better (1-10 scale)
  overhead: number; // Lower is better (1-10 scale)
}

/**
 * Transport scoring weights
 */
interface TransportScoringWeights {
  latency: number;
  reliability: number;
  throughput: number;
  scalability: number;
  security: number;
  complexity: number;
  overhead: number;
}

/**
 * Transport performance profiles
 */
const TRANSPORT_CHARACTERISTICS: Record<string, TransportCharacteristics> = {
  stdio: {
    latency: 9, // Excellent - direct IPC
    reliability: 8, // Very good - OS managed
    throughput: 7, // Good - direct pipes
    scalability: 4, // Limited - single process
    security: 7, // Good - OS process isolation
    complexity: 9, // Excellent - simple setup
    overhead: 9, // Excellent - minimal overhead
  },
  sse: {
    latency: 6, // Good - HTTP overhead
    reliability: 7, // Good - HTTP retry mechanisms
    throughput: 6, // Good - HTTP streaming
    scalability: 8, // Very good - HTTP scalable
    security: 6, // Good - HTTPS available
    complexity: 7, // Good - standard HTTP
    overhead: 6, // Good - HTTP headers
  },
  http: {
    latency: 5, // Fair - request/response cycle
    reliability: 6, // Fair - stateless, needs retry
    throughput: 5, // Fair - request/response only
    scalability: 9, // Excellent - stateless HTTP
    security: 7, // Good - HTTPS + auth
    complexity: 8, // Very good - standard REST
    overhead: 5, // Fair - full HTTP headers
  },
};

/**
 * Default scoring weights based on use case
 */
const USE_CASE_WEIGHTS: Record<string, TransportScoringWeights> = {
  'real-time': {
    latency: 0.4,
    reliability: 0.2,
    throughput: 0.2,
    scalability: 0.1,
    security: 0.05,
    complexity: 0.03,
    overhead: 0.02,
  },
  'batch-processing': {
    latency: 0.1,
    reliability: 0.3,
    throughput: 0.3,
    scalability: 0.2,
    security: 0.05,
    complexity: 0.03,
    overhead: 0.02,
  },
  'high-availability': {
    latency: 0.15,
    reliability: 0.4,
    throughput: 0.15,
    scalability: 0.2,
    security: 0.05,
    complexity: 0.03,
    overhead: 0.02,
  },
  development: {
    latency: 0.2,
    reliability: 0.2,
    throughput: 0.1,
    scalability: 0.1,
    security: 0.1,
    complexity: 0.25,
    overhead: 0.05,
  },
  production: {
    latency: 0.2,
    reliability: 0.25,
    throughput: 0.2,
    scalability: 0.15,
    security: 0.15,
    complexity: 0.03,
    overhead: 0.02,
  },
};

/**
 * Transport selection result
 */
export interface TransportSelectionResult {
  recommendedTransport: 'stdio' | 'sse' | 'http';
  score: number;
  reasoning: string[];
  alternatives: Array<{
    transport: 'stdio' | 'sse' | 'http';
    score: number;
    reason: string;
  }>;
}

/**
 * MCP Transport Selector
 * Intelligently selects the best transport based on use case requirements
 */
export class MCPTransportSelector {
  /**
   * Select optimal transport based on criteria
   */
  selectTransport(
    criteria: TransportSelectionCriteria,
    availableTransports: Array<'stdio' | 'sse' | 'http'> = ['stdio', 'sse', 'http'],
  ): TransportSelectionResult {
    const weights = this.getWeightsForCriteria(criteria);
    const scores = this.calculateTransportScores(weights, availableTransports);

    // Sort by score (highest first)
    const sortedScores = scores.sort((a, b) => b.score - a.score);
    const best = sortedScores[0];

    const reasoning = this.generateReasoning(criteria, best.transport);
    const alternatives = sortedScores.slice(1).map(result => ({
      transport: result.transport,
      score: result.score,
      reason: this.getTransportReason(result.transport, criteria),
    }));

    return {
      recommendedTransport: best.transport,
      score: best.score,
      reasoning,
      alternatives,
    };
  }

  /**
   * Select optimal transport for common use cases
   */
  selectForUseCase(
    useCase: 'real-time' | 'batch-processing' | 'high-availability' | 'development' | 'production',
    availableTransports: Array<'stdio' | 'sse' | 'http'> = ['stdio', 'sse', 'http'],
  ): TransportSelectionResult {
    const weights = USE_CASE_WEIGHTS[useCase];
    const scores = this.calculateTransportScores(weights, availableTransports);

    const sortedScores = scores.sort((a, b) => b.score - a.score);
    const best = sortedScores[0];

    const reasoning = [`Optimized for ${useCase} use case`];
    const alternatives = sortedScores.slice(1).map(result => ({
      transport: result.transport,
      score: result.score,
      reason: `Alternative for ${useCase}`,
    }));

    return {
      recommendedTransport: best.transport,
      score: best.score,
      reasoning,
      alternatives,
    };
  }

  /**
   * Get transport recommendation for specific client config
   */
  recommendForClient(config: MCPClientConfig): TransportSelectionResult {
    // Analyze existing transport configuration to infer requirements
    const criteria = this.inferCriteriaFromConfig(config);
    return this.selectTransport(criteria);
  }

  /**
   * Calculate weighted scores for available transports
   */
  private calculateTransportScores(
    weights: TransportScoringWeights,
    availableTransports: Array<'stdio' | 'sse' | 'http'>,
  ): Array<{ transport: 'stdio' | 'sse' | 'http'; score: number }> {
    return availableTransports.map(transport => {
      const characteristics = TRANSPORT_CHARACTERISTICS[transport];

      // Calculate weighted score (higher is better)
      const score =
        characteristics.latency * weights.latency +
        characteristics.reliability * weights.reliability +
        characteristics.throughput * weights.throughput +
        characteristics.scalability * weights.scalability +
        characteristics.security * weights.security +
        (10 - characteristics.complexity) * weights.complexity + // Invert complexity (lower is better)
        (10 - characteristics.overhead) * weights.overhead; // Invert overhead (lower is better)

      return { transport, score };
    });
  }

  /**
   * Convert selection criteria to scoring weights
   */
  private getWeightsForCriteria(criteria: TransportSelectionCriteria): TransportScoringWeights {
    const weights: TransportScoringWeights = {
      latency: 0,
      reliability: 0,
      throughput: 0,
      scalability: 0,
      security: 0,
      complexity: 0,
      overhead: 0,
    };

    // Latency requirement
    switch (criteria.latencyRequirement) {
      case 'low':
        weights.latency = 0.1;
        break;
      case 'medium':
        weights.latency = 0.25;
        break;
      case 'high':
        weights.latency = 0.4;
        break;
    }

    // Reliability requirement
    switch (criteria.reliabilityRequirement) {
      case 'basic':
        weights.reliability = 0.1;
        break;
      case 'standard':
        weights.reliability = 0.25;
        break;
      case 'high':
        weights.reliability = 0.4;
        break;
    }

    // Throughput requirement
    switch (criteria.throughputRequirement) {
      case 'low':
        weights.throughput = 0.1;
        break;
      case 'medium':
        weights.throughput = 0.2;
        break;
      case 'high':
        weights.throughput = 0.3;
        break;
    }

    // Scalability requirement
    switch (criteria.scalabilityRequirement) {
      case 'single':
        weights.scalability = 0.05;
        break;
      case 'multiple':
        weights.scalability = 0.15;
        break;
      case 'massive':
        weights.scalability = 0.3;
        break;
    }

    // Security requirement
    switch (criteria.securityRequirement) {
      case 'basic':
        weights.security = 0.05;
        break;
      case 'standard':
        weights.security = 0.1;
        break;
      case 'high':
        weights.security = 0.2;
        break;
    }

    // Network environment adjustments
    switch (criteria.networkEnvironment) {
      case 'local':
        weights.complexity = 0.15; // Prefer simplicity for local
        weights.overhead = 0.1;
        break;
      case 'lan':
        weights.reliability = Math.min(weights.reliability + 0.1, 0.5);
        break;
      case 'wan':
      case 'internet':
        weights.scalability = Math.min(weights.scalability + 0.1, 0.4);
        weights.security = Math.min(weights.security + 0.1, 0.3);
        break;
    }

    // Normalize weights to sum to 1.0
    const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (total > 0) {
      Object.keys(weights).forEach(key => {
        weights[key as keyof TransportScoringWeights] /= total;
      });
    }

    return weights;
  }

  /**
   * Generate reasoning for transport selection
   */
  private generateReasoning(
    criteria: TransportSelectionCriteria,
    selectedTransport: 'stdio' | 'sse' | 'http',
  ): string[] {
    const reasoning: string[] = [];
    const characteristics = TRANSPORT_CHARACTERISTICS[selectedTransport];

    // Add specific reasoning based on criteria
    if (criteria.latencyRequirement === 'high' && selectedTransport === 'stdio') {
      reasoning.push('STDIO selected for lowest latency via direct IPC');
    }

    if (criteria.scalabilityRequirement === 'massive' && selectedTransport === 'http') {
      reasoning.push('HTTP selected for maximum scalability in distributed environments');
    }

    if (criteria.networkEnvironment === 'local' && selectedTransport === 'stdio') {
      reasoning.push('STDIO optimal for local process communication');
    }

    if (criteria.reliabilityRequirement === 'high') {
      reasoning.push(
        `Selected transport provides reliability score of ${characteristics.reliability}/10`,
      );
    }

    // Add general strengths
    const strengths: string[] = [];
    if (characteristics.latency >= 8) strengths.push('excellent latency');
    if (characteristics.reliability >= 8) strengths.push('high reliability');
    if (characteristics.throughput >= 8) strengths.push('high throughput');
    if (characteristics.scalability >= 8) strengths.push('excellent scalability');
    if (characteristics.security >= 8) strengths.push('strong security');
    if (characteristics.complexity >= 8) strengths.push('simple setup');

    if (strengths.length > 0) {
      reasoning.push(`Transport provides: ${strengths.join(', ')}`);
    }

    return reasoning.length > 0 ? reasoning : ['Selected based on overall optimization criteria'];
  }

  /**
   * Get reason for alternative transport
   */
  private getTransportReason(
    transport: 'stdio' | 'sse' | 'http',
    _criteria: TransportSelectionCriteria,
  ): string {
    const _characteristics = TRANSPORT_CHARACTERISTICS[transport];

    switch (transport) {
      case 'stdio':
        return 'Best for low-latency local communication';
      case 'sse':
        return 'Good balance of features with streaming support';
      case 'http':
        return 'Best for scalable, distributed architectures';
      default:
        return 'Alternative transport option';
    }
  }

  /**
   * Infer selection criteria from existing client configuration
   */
  private inferCriteriaFromConfig(config: MCPClientConfig): TransportSelectionCriteria {
    // Make educated guesses based on configuration
    const criteria: TransportSelectionCriteria = {
      latencyRequirement: 'medium',
      reliabilityRequirement: 'standard',
      throughputRequirement: 'medium',
      networkEnvironment: 'local',
      securityRequirement: 'standard',
      scalabilityRequirement: 'multiple',
    };

    // Adjust based on transport type
    switch (config.transport.type) {
      case 'stdio':
        criteria.networkEnvironment = 'local';
        criteria.latencyRequirement = 'high';
        criteria.scalabilityRequirement = 'single';
        break;
      case 'sse':
        criteria.networkEnvironment = 'lan';
        criteria.throughputRequirement = 'high';
        break;
      case 'http':
        criteria.networkEnvironment = 'internet';
        criteria.scalabilityRequirement = 'massive';
        break;
    }

    // Adjust based on other config options
    if (config.gracefulDegradation) {
      criteria.reliabilityRequirement = 'high';
    }

    if (config.timeoutMs && config.timeoutMs < 5000) {
      criteria.latencyRequirement = 'high';
    }

    return criteria;
  }
}

/**
 * Global transport selector instance
 */
export const globalTransportSelector = new MCPTransportSelector();

/**
 * Convenience function to get transport recommendation
 */
export function selectOptimalTransport(
  criteria: TransportSelectionCriteria,
  availableTransports?: Array<'stdio' | 'sse' | 'http'>,
): TransportSelectionResult {
  return globalTransportSelector.selectTransport(criteria, availableTransports);
}

/**
 * Convenience function to get transport recommendation for use case
 */
export function selectTransportForUseCase(
  useCase: 'real-time' | 'batch-processing' | 'high-availability' | 'development' | 'production',
  availableTransports?: Array<'stdio' | 'sse' | 'http'>,
): TransportSelectionResult {
  return globalTransportSelector.selectForUseCase(useCase, availableTransports);
}
