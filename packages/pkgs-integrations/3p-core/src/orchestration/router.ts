/**
 * Event Router for Analytics Providers
 * Smart routing based on event types, user segments, and business rules
 */

import type { AnalyticsEvent, ProviderType } from '../types';

export interface RoutingRule {
  name: string;
  condition: RoutingCondition;
  target: RoutingTarget;
  priority: number;
  enabled: boolean;
}

export interface RoutingCondition {
  eventName?: string | string[];
  eventNamePattern?: RegExp;
  userId?: string | string[];
  userSegment?: string | string[];
  properties?: Record<string, any>;
  customCondition?: (event: AnalyticsEvent) => boolean;
}

export interface RoutingTarget {
  providers: ProviderType[];
  action: 'route_to' | 'exclude_from' | 'duplicate_to';
  weight?: number; // For A/B testing scenarios
}

export interface RouterConfig {
  rules: RoutingRule[];
  defaultProviders: ProviderType[];
  fallbackBehavior: 'all_providers' | 'default_providers' | 'none';
  enableLogging: boolean;
}

export interface RouteResult {
  targetProviders: ProviderType[];
  appliedRules: string[];
  excluded: ProviderType[];
}

export class AnalyticsRouter {
  private config: RouterConfig;
  private ruleCache: Map<string, RouteResult> = new Map();
  private cacheEnabled: boolean = true;
  private maxCacheSize: number = 1000;

  constructor(config: RouterConfig) {
    this.config = config;
    this.sortRulesByPriority();
  }

  route(event: AnalyticsEvent, availableProviders: ProviderType[]): RouteResult {
    const cacheKey = this.generateCacheKey(event, availableProviders);

    if (this.cacheEnabled && this.ruleCache.has(cacheKey)) {
      return this.ruleCache.get(cacheKey)!;
    }

    const result = this.computeRoute(event, availableProviders);

    if (this.cacheEnabled) {
      this.setCacheResult(cacheKey, result);
    }

    if (this.config.enableLogging) {
      this.logRouteDecision(event, result);
    }

    return result;
  }

  private computeRoute(event: AnalyticsEvent, availableProviders: ProviderType[]): RouteResult {
    let targetProviders = new Set(
      this.config.defaultProviders.filter(p => availableProviders.includes(p)),
    );
    let excluded = new Set<ProviderType>();
    const appliedRules: string[] = [];

    // Apply routing rules in priority order
    for (const rule of this.config.rules) {
      if (!rule.enabled) continue;

      if (this.evaluateCondition(rule.condition, event)) {
        appliedRules.push(rule.name);

        switch (rule.target.action) {
          case 'route_to':
            targetProviders.clear();
            rule.target.providers
              .filter(p => availableProviders.includes(p))
              .forEach(p => targetProviders.add(p));
            break;

          case 'exclude_from':
            rule.target.providers.forEach(p => {
              targetProviders.delete(p);
              excluded.add(p);
            });
            break;

          case 'duplicate_to':
            rule.target.providers
              .filter(p => availableProviders.includes(p))
              .forEach(p => targetProviders.add(p));
            break;
        }

        // Handle A/B testing weight
        if (rule.target.weight && rule.target.weight < 100) {
          const random = Math.random() * 100;
          if (random > rule.target.weight) {
            // Skip this rule based on weight
            continue;
          }
        }
      }
    }

    // Apply fallback behavior if no providers selected
    if (targetProviders.size === 0) {
      switch (this.config.fallbackBehavior) {
        case 'all_providers':
          availableProviders.forEach(p => targetProviders.add(p));
          break;
        case 'default_providers':
          this.config.defaultProviders
            .filter(p => availableProviders.includes(p))
            .forEach(p => targetProviders.add(p));
          break;
        case 'none':
          // Keep empty set
          break;
      }
    }

    return {
      targetProviders: Array.from(targetProviders),
      appliedRules,
      excluded: Array.from(excluded),
    };
  }

  private evaluateCondition(condition: RoutingCondition, event: AnalyticsEvent): boolean {
    // Event name matching
    if (condition.eventName) {
      const eventNames = Array.isArray(condition.eventName)
        ? condition.eventName
        : [condition.eventName];
      if (!eventNames.includes(event.name)) return false;
    }

    // Event name pattern matching
    if (condition.eventNamePattern) {
      if (!condition.eventNamePattern.test(event.name)) return false;
    }

    // User ID matching
    if (condition.userId && event.userId) {
      const userIds = Array.isArray(condition.userId) ? condition.userId : [condition.userId];
      if (!userIds.includes(event.userId)) return false;
    }

    // User segment matching
    if (condition.userSegment && event.properties?.userSegment) {
      const segments = Array.isArray(condition.userSegment)
        ? condition.userSegment
        : [condition.userSegment];
      if (!segments.includes(event.properties.userSegment)) return false;
    }

    // Properties matching
    if (condition.properties) {
      for (const [key, expectedValue] of Object.entries(condition.properties)) {
        if (event.properties?.[key] !== expectedValue) return false;
      }
    }

    // Custom condition
    if (condition.customCondition) {
      if (!condition.customCondition(event)) return false;
    }

    return true;
  }

  private sortRulesByPriority(): void {
    this.config.rules.sort((a, b) => b.priority - a.priority);
  }

  private generateCacheKey(event: AnalyticsEvent, availableProviders: ProviderType[]): string {
    const eventKey = `${event.name}:${event.userId || 'anon'}:${event.properties?.userSegment || 'none'}`;
    const providersKey = availableProviders.sort().join(',');
    return `${eventKey}|${providersKey}`;
  }

  private setCacheResult(key: string, result: RouteResult): void {
    if (this.ruleCache.size >= this.maxCacheSize) {
      // Remove oldest entries
      const keysToRemove = Array.from(this.ruleCache.keys()).slice(
        0,
        Math.floor(this.maxCacheSize * 0.2),
      );
      keysToRemove.forEach(k => this.ruleCache.delete(k));
    }
    this.ruleCache.set(key, result);
  }

  private logRouteDecision(event: AnalyticsEvent, result: RouteResult): void {
    console.log(`[AnalyticsRouter] Event: ${event.name}`, {
      targetProviders: result.targetProviders,
      appliedRules: result.appliedRules,
      excluded: result.excluded,
      userId: event.userId,
      properties: event.properties,
    });
  }

  // Configuration management methods
  addRule(rule: RoutingRule): void {
    this.config.rules.push(rule);
    this.sortRulesByPriority();
    this.clearCache();
  }

  removeRule(ruleName: string): void {
    this.config.rules = this.config.rules.filter(rule => rule.name !== ruleName);
    this.clearCache();
  }

  updateRule(ruleName: string, updates: Partial<RoutingRule>): void {
    const ruleIndex = this.config.rules.findIndex(rule => rule.name === ruleName);
    if (ruleIndex !== -1) {
      this.config.rules[ruleIndex] = { ...this.config.rules[ruleIndex], ...updates };
      this.sortRulesByPriority();
      this.clearCache();
    }
  }

  enableRule(ruleName: string): void {
    this.updateRule(ruleName, { enabled: true });
  }

  disableRule(ruleName: string): void {
    this.updateRule(ruleName, { enabled: false });
  }

  clearCache(): void {
    this.ruleCache.clear();
  }

  getCacheStats(): { size: number; maxSize: number; hitRate?: number } {
    return {
      size: this.ruleCache.size,
      maxSize: this.maxCacheSize,
    };
  }

  // Utility methods for common routing patterns
  static createEventTypeRule(
    eventNames: string[],
    targetProviders: ProviderType[],
    priority: number = 100,
  ): RoutingRule {
    return {
      name: `event_type_${eventNames.join('_')}`,
      condition: { eventName: eventNames },
      target: { providers: targetProviders, action: 'route_to' },
      priority,
      enabled: true,
    };
  }

  static createUserSegmentRule(
    segments: string[],
    targetProviders: ProviderType[],
    priority: number = 50,
  ): RoutingRule {
    return {
      name: `user_segment_${segments.join('_')}`,
      condition: { userSegment: segments },
      target: { providers: targetProviders, action: 'route_to' },
      priority,
      enabled: true,
    };
  }

  static createA11yRule(
    condition: RoutingCondition,
    providers: ProviderType[],
    weight: number,
    priority: number = 75,
  ): RoutingRule {
    return {
      name: `ab_test_${Date.now()}`,
      condition,
      target: { providers, action: 'route_to', weight },
      priority,
      enabled: true,
    };
  }

  static createExclusionRule(
    condition: RoutingCondition,
    excludedProviders: ProviderType[],
    priority: number = 25,
  ): RoutingRule {
    return {
      name: `exclude_${excludedProviders.join('_')}`,
      condition,
      target: { providers: excludedProviders, action: 'exclude_from' },
      priority,
      enabled: true,
    };
  }
}

// Builder for creating router configurations
export class RouterBuilder {
  private config: Partial<RouterConfig> = {
    rules: [],
    defaultProviders: [],
    fallbackBehavior: 'default_providers',
    enableLogging: false,
  };

  setDefaultProviders(providers: ProviderType[]): this {
    this.config.defaultProviders = providers;
    return this;
  }

  setFallbackBehavior(behavior: RouterConfig['fallbackBehavior']): this {
    this.config.fallbackBehavior = behavior;
    return this;
  }

  enableLogging(enabled: boolean = true): this {
    this.config.enableLogging = enabled;
    return this;
  }

  addRule(rule: RoutingRule): this {
    this.config.rules!.push(rule);
    return this;
  }

  addEventTypeRule(eventNames: string[], providers: ProviderType[], priority: number = 100): this {
    return this.addRule(AnalyticsRouter.createEventTypeRule(eventNames, providers, priority));
  }

  addUserSegmentRule(segments: string[], providers: ProviderType[], priority: number = 50): this {
    return this.addRule(AnalyticsRouter.createUserSegmentRule(segments, providers, priority));
  }

  addExclusionRule(
    condition: RoutingCondition,
    excludedProviders: ProviderType[],
    priority: number = 25,
  ): this {
    return this.addRule(
      AnalyticsRouter.createExclusionRule(condition, excludedProviders, priority),
    );
  }

  build(): AnalyticsRouter {
    return new AnalyticsRouter(this.config as RouterConfig);
  }
}
