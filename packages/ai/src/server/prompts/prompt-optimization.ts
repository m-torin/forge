/**
 * Prompt Optimization System
 * Optimize prompts for performance and cost
 */

import { logInfo, logWarn } from '@repo/observability/server/next';
// tiktoken replacement - simple token estimation
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Prompt optimization configuration
 */
export interface PromptOptimizationConfig {
  model?: string;
  maxTokens?: number;
  preserveStructure?: boolean;
  optimizationLevel?: 'light' | 'moderate' | 'aggressive';
}

/**
 * Optimization result
 */
export interface OptimizationResult {
  original: string;
  optimized: string;
  originalTokens: number;
  optimizedTokens: number;
  reduction: number;
  techniques: string[];
}

/**
 * Prompt optimizer
 */
export class PromptOptimizer {
  private config: Required<PromptOptimizationConfig>;

  constructor(config: PromptOptimizationConfig = {}) {
    this.config = {
      model: config.model || 'gpt-4',
      maxTokens: config.maxTokens || 4000,
      preserveStructure: config.preserveStructure ?? true,
      optimizationLevel: config.optimizationLevel || 'moderate',
    };
  }

  /**
   * Optimize a prompt
   */
  optimize(prompt: string): OptimizationResult {
    const originalTokens = this.countTokens(prompt);
    const techniques: string[] = [];
    let optimized = prompt;

    // Apply optimizations based on level
    switch (this.config.optimizationLevel) {
      case 'light':
        optimized = this.applyLightOptimizations(optimized, techniques);
        break;
      case 'moderate':
        optimized = this.applyModerateOptimizations(optimized, techniques);
        break;
      case 'aggressive':
        optimized = this.applyAggressiveOptimizations(optimized, techniques);
        break;
    }

    // Ensure we don't exceed max tokens
    if (this.countTokens(optimized) > this.config.maxTokens) {
      optimized = this.truncateToTokenLimit(optimized, this.config.maxTokens);
      techniques.push('truncation');
    }

    const optimizedTokens = this.countTokens(optimized);
    const reduction = Math.round(((originalTokens - optimizedTokens) / originalTokens) * 100);

    logInfo('Prompt Optimizer: Optimized', {
      operation: 'prompt_optimize',
      metadata: {
        originalTokens,
        optimizedTokens,
        reduction,
        techniques,
      },
    });

    return {
      original: prompt,
      optimized,
      originalTokens,
      optimizedTokens,
      reduction,
      techniques,
    };
  }

  /**
   * Count tokens in text
   */
  countTokens(text: string): number {
    return estimateTokens(text);
  }

  /**
   * Apply light optimizations
   */
  private applyLightOptimizations(prompt: string, techniques: string[]): string {
    let optimized = prompt;

    // Remove excessive whitespace
    optimized = optimized.replace(/\s+/g, ' ').trim();
    techniques.push('whitespace_normalization');

    // Remove redundant punctuation
    optimized = optimized.replace(/\.{2,}/g, '.').replace(/,{2,}/g, ',');
    techniques.push('punctuation_cleanup');

    return optimized;
  }

  /**
   * Apply moderate optimizations
   */
  private applyModerateOptimizations(prompt: string, techniques: string[]): string {
    let optimized = this.applyLightOptimizations(prompt, techniques);

    // Compress common phrases
    const compressions: Record<string, string> = {
      'in order to': 'to',
      'due to the fact that': 'because',
      'at this point in time': 'now',
      'in the event that': 'if',
      'with regard to': 'about',
      'for the purpose of': 'to',
    };

    for (const [long, short] of Object.entries(compressions)) {
      const regex = new RegExp(long, 'gi');
      if (regex.test(optimized)) {
        optimized = optimized.replace(regex, short);
      }
    }
    techniques.push('phrase_compression');

    // Remove filler words
    const fillers = ['very', 'really', 'quite', 'just', 'actually', 'basically'];
    for (const filler of fillers) {
      const regex = new RegExp(`\\b${filler}\\b`, 'gi');
      optimized = optimized.replace(regex, '');
    }
    techniques.push('filler_removal');

    // Clean up extra spaces from removals
    optimized = optimized.replace(/\s+/g, ' ').trim();

    return optimized;
  }

  /**
   * Apply aggressive optimizations
   */
  private applyAggressiveOptimizations(prompt: string, techniques: string[]): string {
    let optimized = this.applyModerateOptimizations(prompt, techniques);

    // Abbreviate common words
    const abbreviations: Record<string, string> = {
      example: 'e.g.',
      'that is': 'i.e.',
      information: 'info',
      maximum: 'max',
      minimum: 'min',
      number: 'num',
      please: 'pls',
    };

    for (const [full, abbr] of Object.entries(abbreviations)) {
      const regex = new RegExp(`\\b${full}\\b`, 'gi');
      optimized = optimized.replace(regex, abbr);
    }
    techniques.push('abbreviation');

    // Remove articles where not critical
    if (!this.config.preserveStructure) {
      optimized = optimized.replace(/\b(the|a|an)\b/gi, '');
      techniques.push('article_removal');
    }

    // Compress lists
    optimized = optimized.replace(/(\d+)\.\s+/g, '$1.');
    optimized = optimized.replace(/•\s+/g, '-');
    techniques.push('list_compression');

    // Clean up
    optimized = optimized.replace(/\s+/g, ' ').trim();

    return optimized;
  }

  /**
   * Truncate to token limit
   */
  private truncateToTokenLimit(text: string, maxTokens: number): string {
    const tokenCount = estimateTokens(text);

    if (tokenCount <= maxTokens) {
      return text;
    }

    // Try to truncate at sentence boundary
    const ratio = maxTokens / tokenCount;
    const charLimit = Math.floor(text.length * ratio);
    let truncated = text.substring(0, charLimit);

    // Find last complete sentence
    const lastPeriod = truncated.lastIndexOf('.');
    const lastQuestion = truncated.lastIndexOf('?');
    const lastExclamation = truncated.lastIndexOf('!');

    const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);

    if (lastSentenceEnd > truncated.length * 0.8) {
      truncated = truncated.substring(0, lastSentenceEnd + 1);
    } else {
      truncated += '...';
    }

    logWarn('Prompt Optimizer: Truncated', {
      operation: 'prompt_truncate',
      metadata: {
        originalTokens: tokenCount,
        truncatedTokens: maxTokens,
      },
    });

    return truncated;
  }
}

/**
 * Optimization strategies
 */
export const optimizationStrategies = {
  /**
   * Context window optimization
   */
  contextWindowOptimization: (
    prompts: string[],
    maxContextTokens: number,
    optimizer: PromptOptimizer,
  ): string[] => {
    let totalTokens = prompts.reduce((sum, p) => sum + optimizer.countTokens(p), 0);

    if (totalTokens <= maxContextTokens) {
      return prompts;
    }

    // Optimize each prompt proportionally
    const optimized: string[] = [];
    const targetReduction = 1 - maxContextTokens / totalTokens;

    for (const prompt of prompts) {
      const tokens = optimizer.countTokens(prompt);
      const targetTokens = Math.floor(tokens * (1 - targetReduction));

      const result = optimizer.optimize(prompt);

      if (optimizer.countTokens(result.optimized) <= targetTokens) {
        optimized.push(result.optimized);
      } else {
        // Need more aggressive optimization
        const aggressive = new PromptOptimizer({
          ...optimizer['config'],
          optimizationLevel: 'aggressive',
          maxTokens: targetTokens,
        });
        optimized.push(aggressive.optimize(prompt).optimized);
      }
    }

    return optimized;
  },

  /**
   * Dynamic optimization based on importance
   */
  importanceBasedOptimization: (
    sections: Array<{ content: string; importance: number }>,
    totalTokenBudget: number,
    optimizer: PromptOptimizer,
  ): string[] => {
    // Sort by importance
    const sorted = [...sections].sort((a, b) => b.importance - a.importance);

    // Allocate tokens based on importance
    const totalImportance = sorted.reduce((sum, s) => sum + s.importance, 0);
    const results: string[] = new Array(sections.length);

    let remainingTokens = totalTokenBudget;

    for (let i = 0; i < sorted.length; i++) {
      const section = sorted[i];
      const originalIndex = sections.indexOf(section);

      // Allocate tokens proportionally to importance
      const allocation =
        i === sorted.length - 1
          ? remainingTokens // Give all remaining to last item
          : Math.floor((section.importance / totalImportance) * totalTokenBudget);

      const currentTokens = optimizer.countTokens(section.content);

      if (currentTokens <= allocation) {
        // No optimization needed
        results[originalIndex] = section.content;
        remainingTokens -= currentTokens;
      } else {
        // Optimize to fit allocation
        const customOptimizer = new PromptOptimizer({
          ...optimizer['config'],
          maxTokens: allocation,
        });
        results[originalIndex] = customOptimizer.optimize(section.content).optimized;
        remainingTokens -= allocation;
      }
    }

    return results;
  },

  /**
   * Compression for caching
   */
  cacheCompression: (
    prompt: string,
  ): { compressed: string; dictionary: Record<string, string> } => {
    const dictionary: Record<string, string> = {};
    let compressed = prompt;
    let counter = 0;

    // Find repeated phrases (10+ characters)
    const phrases = new Map<string, number>();
    const words = prompt.split(/\s+/);

    for (let len = 5; len >= 2; len--) {
      for (let i = 0; i <= words.length - len; i++) {
        const phrase = words.slice(i, i + len).join(' ');
        if (phrase.length >= 10) {
          const count = (prompt.match(new RegExp(phrase, 'g')) || []).length;
          if (count >= 2) {
            phrases.set(phrase, count * phrase.length);
          }
        }
      }
    }

    // Sort by potential savings
    const sortedPhrases = Array.from(phrases.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // Top 20 phrases

    // Replace with placeholders
    for (const [phrase] of sortedPhrases) {
      const placeholder = `§${counter}§`;
      compressed = compressed.replace(new RegExp(phrase, 'g'), placeholder);
      dictionary[placeholder] = phrase;
      counter++;
    }

    return { compressed, dictionary };
  },
};
