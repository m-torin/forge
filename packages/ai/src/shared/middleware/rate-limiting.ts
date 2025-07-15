export interface RateLimitConfig {
  enabled: boolean;
  maxRequestsPerMinute: number;
  maxTokensPerMinute: number;
}

export class AIRateLimiter {
  private config: RateLimitConfig;
  private requestCounts = new Map<string, number[]>();
  private tokenCounts = new Map<string, number[]>();

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      maxRequestsPerMinute: config.maxRequestsPerMinute ?? 60,
      maxTokensPerMinute: config.maxTokensPerMinute ?? 10000,
    };
  }

  async checkRateLimit(
    provider: string,
    estimatedTokens = 0,
  ): Promise<{ allowed: boolean; retryAfter?: number }> {
    if (!this.config.enabled) {
      return { allowed: true };
    }

    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    // Clean old entries
    this.cleanOldEntries(provider, oneMinuteAgo);

    // Check request rate limit
    const requests = this.requestCounts.get(provider) ?? [];
    if (requests.length >= this.config.maxRequestsPerMinute) {
      const oldestRequest = Math.min(...requests);
      const retryAfter = Math.ceil((oldestRequest + 60000 - now) / 1000);
      return { allowed: false, retryAfter };
    }

    // Check token rate limit
    const tokens = this.tokenCounts.get(provider) ?? [];
    const totalTokens = tokens.reduce((sum, tokenCount: any) => sum + tokenCount, 0);
    if (totalTokens + estimatedTokens > this.config.maxTokensPerMinute) {
      const retryAfter = 60; // Wait a minute for token limit
      return { allowed: false, retryAfter };
    }

    // Record this request
    requests.push(now);
    this.requestCounts.set(provider, requests);

    if (estimatedTokens > 0) {
      tokens.push(estimatedTokens);
      this.tokenCounts.set(provider, tokens);
    }

    return { allowed: true };
  }

  getRateLimitStatus(provider: string): {
    maxRequests: number;
    maxTokens: number;
    requestsThisMinute: number;
    tokensThisMinute: number;
  } {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    this.cleanOldEntries(provider, oneMinuteAgo);

    const requests = this.requestCounts.get(provider) ?? [];
    const tokens = this.tokenCounts.get(provider) ?? [];
    const totalTokens = tokens.reduce((sum, count: any) => sum + count, 0);

    return {
      maxRequests: this.config.maxRequestsPerMinute,
      maxTokens: this.config.maxTokensPerMinute,
      requestsThisMinute: requests.length,
      tokensThisMinute: totalTokens,
    };
  }

  recordTokenUsage(provider: string, tokenCount: number): void {
    if (!this.config.enabled) return;

    const tokens = this.tokenCounts.get(provider) ?? [];
    tokens.push(tokenCount);
    this.tokenCounts.set(provider, tokens);
  }

  private cleanOldEntries(provider: string, cutoff: number): void {
    // Clean request counts
    const requests = this.requestCounts.get(provider) ?? [];
    const recentRequests = requests.filter((timestamp: any) => timestamp > cutoff);
    this.requestCounts.set(provider, recentRequests);

    // For tokens, we'll keep them simple and reset every minute
    // In a real implementation, you might want to track timestamps with token counts
    if (requests.length === 0) {
      this.tokenCounts.set(provider, []);
    }
  }
}

export const defaultRateLimiter = new AIRateLimiter();
