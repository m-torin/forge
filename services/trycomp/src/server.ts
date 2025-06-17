import { createTryCompClient } from './client.js';
import type {
  TryCompClient,
  TryCompConfig,
  ComparisonRequest,
  ComparisonResult,
  AnalysisRequest,
  AnalysisResult,
  DiffRequest,
  DiffResult,
} from './types.js';

export class TryCompServer {
  private client: TryCompClient;

  constructor(config?: Partial<TryCompConfig>) {
    this.client = createTryCompClient(config);
  }

  async compareCode(request: ComparisonRequest): Promise<ComparisonResult> {
    return this.client.compare(request);
  }

  async analyzeCode(request: AnalysisRequest): Promise<AnalysisResult> {
    return this.client.analyze(request);
  }

  async diffCode(request: DiffRequest): Promise<DiffResult> {
    return this.client.diff(request);
  }

  async validateCode(code: string, language?: string): Promise<boolean> {
    return this.client.validateCode(code, language);
  }

  async health(): Promise<{ status: 'ok' | 'error', timestamp: string }> {
    try {
      // Test with a simple validation
      await this.validateCode('console.log("hello");', 'javascript');
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    } catch {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export function createTryCompServer(config?: Partial<TryCompConfig>): TryCompServer {
  return new TryCompServer(config);
}
