/**
 * Local Feature Flag Provider
 * Simple local provider for development, testing, and static configurations
 */

import type {
  FeatureFlagProvider,
  FlagConfig,
  FlagContext,
  FlagEvaluationResult,
  FlagValue
} from '../feature-flags/types';

export class LocalFlagProvider implements FeatureFlagProvider {
  readonly name = 'local';
  
  private flags: Map<string, LocalFlagDefinition> = new Map();
  private context: FlagContext = {};
  private isInitialized = false;

  constructor(private config: FlagConfig) {
    // Load flags from configuration
    if (config.options?.flags) {
      this.loadFlags(config.options.flags);
    }
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  async initialize(context?: FlagContext): Promise<void> {
    if (context) {
      this.setContext(context);
    }
    this.isInitialized = true;
  }

  async close(): Promise<void> {
    this.isInitialized = false;
  }

  // ============================================================================
  // FLAG EVALUATION
  // ============================================================================

  async getFlag<T = FlagValue>(
    key: string,
    defaultValue: T,
    context?: FlagContext
  ): Promise<FlagEvaluationResult<T>> {
    const evaluationContext = { ...this.context, ...context };
    const flagDef = this.flags.get(key);

    if (!flagDef) {
      return {
        key,
        value: defaultValue,
        reason: 'off' as const,
        source: 'fallback' as const,
        timestamp: Date.now()
      };
    }

    // Evaluate the flag based on rules
    const evaluation = this.evaluateFlag(flagDef, evaluationContext);
    
    return {
      key,
      value: evaluation.value !== undefined ? evaluation.value as T : defaultValue,
      variant: evaluation.variant,
      reason: evaluation.reason as any,
      source: 'network' as const,
      timestamp: Date.now(),
      payload: flagDef.payload,
      ruleId: evaluation.ruleId
    };
  }

  async getAllFlags(context?: FlagContext): Promise<Record<string, FlagEvaluationResult>> {
    const evaluationContext = { ...this.context, ...context };
    const results: Record<string, FlagEvaluationResult> = {};

    for (const [key, flagDef] of this.flags) {
      const evaluation = this.evaluateFlag(flagDef, evaluationContext);
      
      results[key] = {
        key,
        value: evaluation.value,
        variant: evaluation.variant,
        reason: evaluation.reason as any,
        source: 'network' as const,
        timestamp: Date.now(),
        payload: flagDef.payload,
        ruleId: evaluation.ruleId
      };
    }

    return results;
  }

  async isEnabled(key: string, context?: FlagContext): Promise<boolean> {
    const result = await this.getFlag(key, false, context);
    return Boolean(result.value);
  }

  async getVariant(
    key: string,
    context?: FlagContext
  ): Promise<{ variant: string; payload?: any } | null> {
    const result = await this.getFlag(key, null, context);
    
    if (result.variant) {
      return {
        variant: result.variant,
        payload: result.payload
      };
    }
    
    return null;
  }

  // ============================================================================
  // CONTEXT MANAGEMENT
  // ============================================================================

  setContext(context: FlagContext): void {
    this.context = { ...context };
  }

  updateContext(updates: Partial<FlagContext>): void {
    this.context = { ...this.context, ...updates };
  }

  // ============================================================================
  // LOCAL PROVIDER SPECIFIC METHODS
  // ============================================================================

  /**
   * Add or update a flag definition
   */
  setFlag(key: string, definition: LocalFlagDefinition | FlagValue): void {
    if (typeof definition === 'object' && definition !== null && 'value' in definition) {
      this.flags.set(key, definition as LocalFlagDefinition);
    } else {
      // Simple value flag
      this.flags.set(key, {
        value: definition,
        enabled: true
      });
    }
  }

  /**
   * Remove a flag
   */
  removeFlag(key: string): void {
    this.flags.delete(key);
  }

  /**
   * Load flags from object
   */
  loadFlags(flags: Record<string, any>): void {
    Object.entries(flags).forEach(([key, value]) => {
      this.setFlag(key, value);
    });
  }

  /**
   * Get all flag definitions (for debugging)
   */
  getFlagDefinitions(): Record<string, LocalFlagDefinition> {
    const result: Record<string, LocalFlagDefinition> = {};
    this.flags.forEach((def, key) => {
      result[key] = def;
    });
    return result;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private evaluateFlag(
    flagDef: LocalFlagDefinition,
    context: FlagContext
  ): FlagEvaluation {
    // If flag is disabled, return default value
    if (!flagDef.enabled) {
      return {
        value: flagDef.defaultValue || flagDef.value,
        reason: 'off'
      };
    }

    // If no rules, return the default value
    if (!flagDef.rules || flagDef.rules.length === 0) {
      return {
        value: flagDef.value,
        variant: flagDef.variant,
        reason: 'fallthrough'
      };
    }

    // Evaluate rules in order
    for (let i = 0; i < flagDef.rules.length; i++) {
      const rule = flagDef.rules[i];
      if (this.evaluateRule(rule, context)) {
        return {
          value: rule.value,
          variant: rule.variant,
          reason: 'rule_match',
          ruleId: rule.id || `rule_${i}`
        };
      }
    }

    // No rules matched, return default
    return {
      value: flagDef.value,
      variant: flagDef.variant,
      reason: 'fallthrough'
    };
  }

  private evaluateRule(rule: LocalFlagRule, context: FlagContext): boolean {
    if (!rule.conditions || rule.conditions.length === 0) {
      return true;
    }

    // All conditions must match (AND logic)
    return rule.conditions.every(condition => 
      this.evaluateCondition(condition, context)
    );
  }

  private evaluateCondition(condition: LocalFlagCondition, context: FlagContext): boolean {
    const contextValue = this.getContextValue(condition.attribute, context);
    
    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value;
      
      case 'not_equals':
        return contextValue !== condition.value;
      
      case 'in':
        return Array.isArray(condition.value) && 
               condition.value.includes(contextValue);
      
      case 'not_in':
        return Array.isArray(condition.value) && 
               !condition.value.includes(contextValue);
      
      case 'contains':
        return String(contextValue).includes(String(condition.value));
      
      case 'starts_with':
        return String(contextValue).startsWith(String(condition.value));
      
      case 'ends_with':
        return String(contextValue).endsWith(String(condition.value));
      
      case 'matches_regex':
        try {
          const regex = new RegExp(String(condition.value));
          return regex.test(String(contextValue));
        } catch {
          return false;
        }
      
      case 'greater_than':
        return Number(contextValue) > Number(condition.value);
      
      case 'less_than':
        return Number(contextValue) < Number(condition.value);
      
      case 'greater_than_or_equal':
        return Number(contextValue) >= Number(condition.value);
      
      case 'less_than_or_equal':
        return Number(contextValue) <= Number(condition.value);
      
      case 'exists':
        return contextValue !== undefined && contextValue !== null;
      
      case 'percentage':
        // Simple percentage rollout based on user ID hash
        const userId = context.userId || context.distinctId || 'anonymous';
        const hash = this.simpleHash(userId + condition.attribute);
        const percentage = Number(condition.value);
        return (hash % 100) < percentage;
      
      default:
        return false;
    }
  }

  private getContextValue(attribute: string, context: FlagContext): any {
    // Support dot notation for nested attributes
    const keys = attribute.split('.');
    let value: any = context;
    
    for (const key of keys) {
      if (value && typeof value === 'object') {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

// ============================================================================
// LOCAL PROVIDER TYPES
// ============================================================================

export interface LocalFlagDefinition {
  value: FlagValue;
  variant?: string;
  enabled: boolean;
  defaultValue?: FlagValue;
  payload?: any;
  rules?: LocalFlagRule[];
  description?: string;
}

export interface LocalFlagRule {
  id?: string;
  value: FlagValue;
  variant?: string;
  conditions: LocalFlagCondition[];
}

export interface LocalFlagCondition {
  attribute: string;
  operator: LocalFlagOperator;
  value: any;
}

export type LocalFlagOperator = 
  | 'equals'
  | 'not_equals'
  | 'in'
  | 'not_in'
  | 'contains'
  | 'starts_with'
  | 'ends_with'
  | 'matches_regex'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'exists'
  | 'percentage';

interface FlagEvaluation {
  value: FlagValue;
  variant?: string;
  reason: string;
  ruleId?: string;
}