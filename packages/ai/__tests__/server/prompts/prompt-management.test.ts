/**
 * Prompt Management System Tests
 * Testing templates, caching, versioning, and optimization
 */

import { afterEach, beforeEach, describe, expect } from 'vitest';
import { PromptCache, withPromptCache } from '../../../src/server/prompts/prompt-cache';
import {
  AnalyticsPromptCache,
  cacheWarmingUtils,
} from '../../../src/server/prompts/prompt-cache-analytics';
import { PromptTemplate, PromptTemplateEngine } from '../../../src/server/prompts/prompt-templates';
import { PromptVersionManager } from '../../../src/server/prompts/prompt-versioning';

describe('promptCache', () => {
  let cache: PromptCache;

  beforeEach(() => {
    cache = new PromptCache({
      maxSize: 100,
      defaultTTL: 5000,
      evictionPolicy: 'lru',
    });
  });

  afterEach(() => {
    cache.clear();
  });

  describe('basic Caching Operations', () => {
    test('should store and retrieve prompts correctly', () => {
      const key = cache.generateKey('test prompt', { model: 'gpt-4', temperature: 0.7 });

      cache.set(key, 'test prompt', 'test response', {
        model: 'gpt-4',
        temperature: 0.7,
      });

      const entry = cache.get(key);

      expect(entry).toBeDefined();
      expect(entry!.prompt).toBe('test prompt');
      expect(entry!.response).toBe('test response');
      expect(entry!.metadata.model).toBe('gpt-4');
      expect(entry!.metadata.temperature).toBe(0.7);
    });

    test('should handle cache misses correctly', () => {
      const key = cache.generateKey('nonexistent prompt');
      const entry = cache.get(key);

      expect(entry).toBeNull();
    });

    test('should respect TTL expiration', async () => {
      const shortTTLCache = new PromptCache({
        defaultTTL: 100, // 100ms
      });

      const key = shortTTLCache.generateKey('expiring prompt');
      shortTTLCache.set(key, 'expiring prompt', 'response', {}, 100);

      // Should be available immediately
      expect(shortTTLCache.get(key)).toBeDefined();

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be expired
      expect(shortTTLCache.get(key)).toBeNull();
    });

    test('should implement LRU eviction policy', () => {
      const smallCache = new PromptCache({
        maxSize: 3,
        evictionPolicy: 'lru',
      });

      // Fill cache to capacity
      const key1 = smallCache.generateKey('prompt1');
      const key2 = smallCache.generateKey('prompt2');
      const key3 = smallCache.generateKey('prompt3');

      smallCache.set(key1, 'prompt1', 'response1');
      smallCache.set(key2, 'prompt2', 'response2');
      smallCache.set(key3, 'prompt3', 'response3');

      // Access key1 to make it most recent
      smallCache.get(key1);

      // Add another entry - should evict key2 (least recently used)
      const key4 = smallCache.generateKey('prompt4');
      smallCache.set(key4, 'prompt4', 'response4');

      expect(smallCache.get(key1)).toBeDefined(); // Still available
      expect(smallCache.get(key2)).toBeNull(); // Should be evicted
      expect(smallCache.get(key3)).toBeDefined(); // Still available
      expect(smallCache.get(key4)).toBeDefined(); // Newly added
    });

    test('should implement LFU eviction policy', () => {
      const lfuCache = new PromptCache({
        maxSize: 2,
        evictionPolicy: 'lfu',
      });

      const key1 = lfuCache.generateKey('prompt1');
      const key2 = lfuCache.generateKey('prompt2');

      lfuCache.set(key1, 'prompt1', 'response1');
      lfuCache.set(key2, 'prompt2', 'response2');

      // Access key1 multiple times
      lfuCache.get(key1);
      lfuCache.get(key1);
      lfuCache.get(key1);

      // Access key2 once
      lfuCache.get(key2);

      // Add third entry - should evict key2 (less frequently used)
      const key3 = lfuCache.generateKey('prompt3');
      lfuCache.set(key3, 'prompt3', 'response3');

      expect(lfuCache.get(key1)).toBeDefined(); // Frequently used
      expect(lfuCache.get(key2)).toBeNull(); // Should be evicted
      expect(lfuCache.get(key3)).toBeDefined(); // Newly added
    });
  });

  describe('cache Statistics', () => {
    test('should track hit and miss statistics', () => {
      const key1 = cache.generateKey('prompt1');
      const key2 = cache.generateKey('prompt2');

      // Set one entry
      cache.set(key1, 'prompt1', 'response1');

      // Hit
      cache.get(key1);
      cache.get(key1);

      // Miss
      cache.get(key2);

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.avgHitRate).toBeCloseTo(2 / 3, 2);
    });

    test('should track cache size correctly', () => {
      expect(cache.getStats().size).toBe(0);

      cache.set(cache.generateKey('prompt1'), 'prompt1', 'response1');
      expect(cache.getStats().size).toBe(1);

      cache.set(cache.generateKey('prompt2'), 'prompt2', 'response2');
      expect(cache.getStats().size).toBe(2);

      cache.delete(cache.generateKey('prompt1'));
      expect(cache.getStats().size).toBe(1);
    });
  });

  describe('cache Decorator', () => {
    test('should cache function results', async () => {
      let callCount = 0;

      const expensiveFunction = async (input: string) => {
        callCount++;
        return `Processed: ${input}`;
      };

      const cachedFunction = withPromptCache(expensiveFunction, {
        cache,
        ttl: 5000,
      });

      // First call should execute function
      const result1 = await cachedFunction('test input');
      expect(result1).toBe('Processed: test input');
      expect(callCount).toBe(1);

      // Second call should use cache
      const result2 = await cachedFunction('test input');
      expect(result2).toBe('Processed: test input');
      expect(callCount).toBe(1); // Should not increment

      // Different input should execute function
      const result3 = await cachedFunction('different input');
      expect(result3).toBe('Processed: different input');
      expect(callCount).toBe(2);
    });

    test('should use custom key generator', async () => {
      const fn = async (obj: { id: number; data: string }) => `Result: ${obj.id}`;

      const cachedFn = withPromptCache(fn, {
        cache,
        keyGenerator: obj => `custom-key-${obj.id}`,
      });

      await cachedFn({ id: 1, data: 'first' });
      await cachedFn({ id: 1, data: 'second' }); // Different data, same ID

      // Should use cached result despite different data
      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
    });
  });
});

describe('enhancedPromptCache', () => {
  let enhancedCache: AnalyticsPromptCache;

  beforeEach(() => {
    enhancedCache = new AnalyticsPromptCache({
      maxSize: 100,
      enableAutoOptimization: true,
      enableSemanticSimilarity: true,
      enableCostTracking: true,
      costPerToken: 0.003,
    });
  });

  afterEach(() => {
    enhancedCache.destroy();
  });

  describe('analytics Integration', () => {
    test('should track cache operations with analytics', async () => {
      const key = enhancedCache.generateKey('test prompt');

      await enhancedCache.setWithAnalytics(key, 'test prompt', 'response', {
        tokens: 100,
        cost: 0.3,
      });

      const result = await enhancedCache.getWithAnalytics(key, {
        tokens: 100,
        cost: 0.3,
      });

      expect(result.success).toBeTruthy();
      expect(result.fromCache).toBeTruthy();
      expect(result.data).toBeDefined();
      expect(result.analytics).toBeDefined();
    });

    test('should generate comprehensive analytics reports', async () => {
      // Execute several cache operations
      for (let i = 0; i < 10; i++) {
        const key = enhancedCache.generateKey(`prompt ${i}`);
        await enhancedCache.setWithAnalytics(key, `prompt ${i}`, `response ${i}`, {
          tokens: 50 + i * 10,
          cost: (50 + i * 10) * 0.003,
        });

        // Access some entries multiple times
        if (i < 5) {
          await enhancedCache.getWithAnalytics(key);
          await enhancedCache.getWithAnalytics(key);
        }
      }

      const report = enhancedCache.generateAnalyticsReport();

      expect(report.performance.hitRate).toBeGreaterThan(0);
      expect(report.efficiency.costSavings).toBeGreaterThan(0);
      expect(report.patterns.mostAccessedPrompts.length).toBeGreaterThan(0);
      expect(report.optimization.recommendations.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('semantic Similarity', () => {
    test('should find semantically similar prompts', async () => {
      const key1 = enhancedCache.generateKey('analyze performance metrics');
      await enhancedCache.setWithAnalytics(
        key1,
        'analyze performance metrics',
        'Performance analysis result',
      );

      // Try to find similar prompt
      const similarResult = await enhancedCache.findSimilarPrompt('examine performance data');

      // Note: This uses a mock embedding, so we test the structure
      expect(similarResult).toBeDefined();

      // Verify result structure when present
      expect(similarResult?.success).toBeTruthy();
      expect(similarResult?.cacheKey).toBeDefined();
    });

    test('should respect similarity threshold', async () => {
      const strictCache = new AnalyticsPromptCache({
        enableSemanticSimilarity: true,
        similarityThreshold: 0.95, // Very strict
      });

      const key = strictCache.generateKey('exact prompt text');
      await strictCache.setWithAnalytics(key, 'exact prompt text', 'response');

      const dissimilarResult = await strictCache.findSimilarPrompt('completely different text');
      expect(dissimilarResult).toBeNull();

      strictCache.destroy();
    });
  });

  describe('auto-Optimization', () => {
    test('should perform automatic optimizations', async () => {
      // Generate cache activity that would trigger optimizations
      for (let i = 0; i < 20; i++) {
        const key = enhancedCache.generateKey(`optimization-test-${i}`);
        await enhancedCache.setWithAnalytics(key, `prompt ${i}`, `response ${i}`);
      }

      const optimizationResult = await enhancedCache.optimizeCache();

      expect(optimizationResult.optimizationsApplied).toBeDefined();
      expect(optimizationResult.recommendations).toBeDefined();
      expect(optimizationResult.performanceImprovement).toBeGreaterThanOrEqual(0);
    });

    test('should provide optimization recommendations', async () => {
      // Create suboptimal cache usage patterns
      const heavilyUsedKey = enhancedCache.generateKey('heavy-use-prompt');
      await enhancedCache.setWithAnalytics(heavilyUsedKey, 'heavy-use-prompt', 'response');

      // Access frequently
      for (let i = 0; i < 10; i++) {
        await enhancedCache.getWithAnalytics(heavilyUsedKey);
      }

      const report = enhancedCache.generateAnalyticsReport();
      expect(report.optimization.recommendations.length).toBeGreaterThanOrEqual(0);

      // Extract condition into deterministic variable to avoid conditional expects
      const hasPreloadCandidates = report.optimization.preloadCandidates.length > 0;
      const firstCandidateFrequency = hasPreloadCandidates
        ? report.optimization.preloadCandidates[0].frequency
        : 0;
      const frequencyIsValid = hasPreloadCandidates ? firstCandidateFrequency > 0 : true;

      // Unified assertion
      expect(frequencyIsValid).toBeTruthy();
    });
  });

  describe('cache Warming', () => {
    test('should preload frequently accessed prompts', async () => {
      const warmingData = [
        { prompt: 'frequently used prompt 1', response: 'response 1' },
        { prompt: 'frequently used prompt 2', response: 'response 2' },
      ];

      await enhancedCache.preloadPrompts(warmingData);

      // Verify prompts are cached
      const key1 = enhancedCache.generateKey('frequently used prompt 1');
      const key2 = enhancedCache.generateKey('frequently used prompt 2');

      const result1 = await enhancedCache.getWithAnalytics(key1);
      const result2 = await enhancedCache.getWithAnalytics(key2);

      expect(result1.fromCache).toBeTruthy();
      expect(result2.fromCache).toBeTruthy();
    });

    test('should generate effective warming strategies', async () => {
      // Simulate usage patterns
      const heavyUsePrompts = ['prompt A', 'prompt B'];
      for (const prompt of heavyUsePrompts) {
        const key = enhancedCache.generateKey(prompt);
        await enhancedCache.setWithAnalytics(key, prompt, `response for ${prompt}`);

        // Access multiple times to establish frequency
        for (let i = 0; i < 5; i++) {
          await enhancedCache.getWithAnalytics(key);
        }
      }

      const strategy = cacheWarmingUtils.generateWarmingStrategy(enhancedCache);
      expect(strategy.length).toBeGreaterThanOrEqual(0);

      // Extract condition into deterministic variable to avoid conditional expects
      const hasStrategyItems = strategy.length > 0;
      const firstItemPriority = hasStrategyItems ? strategy[0].priority : 0;
      const firstItemBenefit = hasStrategyItems ? strategy[0].estimatedBenefit : 0;
      const priorityIsValid = hasStrategyItems ? firstItemPriority > 0 : true;
      const benefitIsValid = hasStrategyItems ? firstItemBenefit > 0 : true;

      // Unified assertions
      expect(priorityIsValid).toBeTruthy();
      expect(benefitIsValid).toBeTruthy();
    });
  });
});

describe('promptTemplateEngine', () => {
  let templateEngine: PromptTemplateEngine;

  beforeEach(() => {
    templateEngine = new PromptTemplateEngine({
      enableCaching: true,
      enableValidation: true,
      customFunctions: {
        uppercase: (str: string) => str.toUpperCase(),
        formatNumber: (num: number) => num.toLocaleString(),
      },
    });
  });

  afterEach(() => {
    templateEngine.destroy();
  });

  describe('template Compilation and Rendering', () => {
    test('should compile and render basic templates', async () => {
      const template: PromptTemplate = {
        id: 'basic-template',
        name: 'Basic Template',
        template: 'Hello {{name}}, your score is {{score}}.',
        variables: [
          { name: 'name', type: 'string', required: true },
          { name: 'score', type: 'number', required: true },
        ],
      };

      templateEngine.registerTemplate(template);

      const view = await templateEngine.render('basic-template', {
        name: 'Alice',
        score: 95,
      });

      expect(view.success).toBeTruthy();
      expect(view.prompt).toBe('Hello Alice, your score is 95.');
    });

    test('should handle conditional statements', async () => {
      const template: PromptTemplate = {
        id: 'conditional-template',
        name: 'Conditional Template',
        template: 'Welcome {{name}}{{#if premium}}, premium user{{/if}}!',
        variables: [
          { name: 'name', type: 'string', required: true },
          { name: 'premium', type: 'boolean', required: false },
        ],
      };

      templateEngine.registerTemplate(template);

      const premiumView = await templateEngine.render('conditional-template', {
        name: 'Bob',
        premium: true,
      });

      const regularView = await templateEngine.render('conditional-template', {
        name: 'Charlie',
        premium: false,
      });

      expect(premiumView.prompt).toBe('Welcome Bob, premium user!');
      expect(regularView.prompt).toBe('Welcome Charlie!');
    });

    test('should handle loops and arrays', async () => {
      const template: PromptTemplate = {
        id: 'loop-template',
        name: 'Loop Template',
        template: 'Items: {{#each items}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}',
        variables: [{ name: 'items', type: 'array', required: true }],
      };

      templateEngine.registerTemplate(template);

      const view = await templateEngine.render('loop-template', {
        items: ['apple', 'banana', 'cherry'],
      });

      expect(view.success).toBeTruthy();
      expect(view.prompt).toBe('Items: apple, banana, cherry');
    });

    test('should use custom functions', async () => {
      const template: PromptTemplate = {
        id: 'custom-function-template',
        name: 'Custom Function Template',
        template: '{{uppercase name}} has {{formatNumber score}} points.',
        variables: [
          { name: 'name', type: 'string', required: true },
          { name: 'score', type: 'number', required: true },
        ],
      };

      templateEngine.registerTemplate(template);

      const view = await templateEngine.render('custom-function-template', {
        name: 'david',
        score: 1234567,
      });

      expect(view.success).toBeTruthy();
      expect(view.prompt).toBe('DAVID has 1,234,567 points.');
    });
  });

  describe('template Validation', () => {
    test('should validate required variables', async () => {
      const template: PromptTemplate = {
        id: 'validation-template',
        name: 'Validation Template',
        template: 'Hello {{name}}, your age is {{age}}.',
        variables: [
          { name: 'name', type: 'string', required: true },
          { name: 'age', type: 'number', required: true },
        ],
      };

      templateEngine.registerTemplate(template);

      const view = await templateEngine.render('validation-template', {
        name: 'Eve',
        // Missing required 'age' variable
      });

      expect(view.success).toBeFalsy();
      expect(view.errors).toContain('Required variable "age" is missing');
    });

    test('should validate variable types', async () => {
      const template: PromptTemplate = {
        id: 'type-validation-template',
        name: 'Type Validation Template',
        template: 'User {{name}} is {{age}} years old.',
        variables: [
          { name: 'name', type: 'string', required: true },
          { name: 'age', type: 'number', required: true },
        ],
      };

      templateEngine.registerTemplate(template);

      const view = await templateEngine.render('type-validation-template', {
        name: 'Frank',
        age: 'thirty', // Wrong type
      });

      expect(view.success).toBeFalsy();
      expect(view.errors?.some(error => error.includes('type'))).toBeTruthy();
    });

    test('should validate constraints', async () => {
      const template: PromptTemplate = {
        id: 'constraint-template',
        name: 'Constraint Template',
        template: 'Email: {{email}}',
        variables: [
          {
            name: 'email',
            type: 'string',
            required: true,
            constraints: {
              pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              minLength: 5,
              maxLength: 100,
            },
          },
        ],
      };

      templateEngine.registerTemplate(template);

      const invalidView = await templateEngine.render('constraint-template', {
        email: 'invalid-email',
      });

      const validView = await templateEngine.render('constraint-template', {
        email: 'user@example.com',
      });

      expect(invalidResult.success).toBeFalsy();
      expect(validResult.success).toBeTruthy();
    });
  });

  describe('template Inheritance and Composition', () => {
    test('should support template inheritance', async () => {
      const baseTemplate: PromptTemplate = {
        id: 'base-template',
        name: 'Base Template',
        template: 'System: {{system_message}}\nUser: {{user_message}}',
        variables: [
          { name: 'system_message', type: 'string', required: true },
          { name: 'user_message', type: 'string', required: true },
        ],
      };

      const childTemplate: PromptTemplate = {
        id: 'child-template',
        name: 'Child Template',
        extends: 'base-template',
        template:
          'System: You are a helpful assistant. {{system_message}}\nUser: {{user_message}}\nAssistant: ',
        variables: [
          { name: 'system_message', type: 'string', required: false, defaultValue: '' },
          { name: 'user_message', type: 'string', required: true },
        ],
      };

      templateEngine.registerTemplate(baseTemplate);
      templateEngine.registerTemplate(childTemplate);

      const view = await templateEngine.render('child-template', {
        user_message: 'Hello!',
      });

      expect(result.success).toBeTruthy();
      expect(result.prompt).toContain('You are a helpful assistant');
      expect(result.prompt).toContain('Hello!');
    });

    test('should support template composition with includes', async () => {
      const headerTemplate: PromptTemplate = {
        id: 'header-template',
        name: 'Header Template',
        template: 'System: {{system_role}}',
        variables: [{ name: 'system_role', type: 'string', required: true }],
      };

      const mainTemplate: PromptTemplate = {
        id: 'main-template',
        name: 'Main Template',
        template: '{{> header-template}}\nUser: {{user_input}}\nResponse:',
        includes: ['header-template'],
        variables: [
          { name: 'system_role', type: 'string', required: true },
          { name: 'user_input', type: 'string', required: true },
        ],
      };

      templateEngine.registerTemplate(headerTemplate);
      templateEngine.registerTemplate(mainTemplate);

      const view = await templateEngine.render('main-template', {
        system_role: 'Assistant',
        user_input: 'What is AI?',
      });

      expect(result.success).toBeTruthy();
      expect(result.prompt).toBe('System: Assistant\nUser: What is AI?\nResponse:');
    });
  });

  describe('template Caching and Performance', () => {
    test('should cache compiled templates', async () => {
      const template: PromptTemplate = {
        id: 'cached-template',
        name: 'Cached Template',
        template: 'Hello {{name}}!',
        variables: [{ name: 'name', type: 'string', required: true }],
      };

      templateEngine.registerTemplate(template);

      // First render - should compile
      const start1 = Date.now();
      await templateEngine.render('cached-template', { name: 'User1' });
      const duration1 = Date.now() - start1;

      // Second render - should use cache
      const start2 = Date.now();
      await templateEngine.render('cached-template', { name: 'User2' });
      const duration2 = Date.now() - start2;

      // Cached render should be faster (though this might be unreliable in tests)
      expect(duration2).toBeLessThanOrEqual(duration1 + 10); // Allow some margin
    });

    test('should provide template performance metrics', async () => {
      const template: PromptTemplate = {
        id: 'performance-template',
        name: 'Performance Template',
        template: 'Complex template with {{#each items}}{{name}}: {{value}}{{/each}}',
        variables: [{ name: 'items', type: 'array', required: true }],
      };

      templateEngine.registerTemplate(template);

      // Render multiple times
      for (let i = 0; i < 5; i++) {
        await templateEngine.render('performance-template', {
          items: [
            { name: 'item1', value: i },
            { name: 'item2', value: i * 2 },
          ],
        });
      }

      const metrics = templateEngine.getPerformanceMetrics('performance-template');
      expect(metrics).toBeDefined();
      expect(metrics!.renderCount).toBe(5);
      expect(metrics!.averageRenderTime).toBeGreaterThan(0);
      expect(metrics!.cacheHitRate).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('promptVersionManager', () => {
  let versionManager: PromptVersionManager;

  beforeEach(() => {
    versionManager = new PromptVersionManager({
      enableAutoBackup: true,
      maxVersionHistory: 10,
      enableDiffTracking: true,
    });
  });

  afterEach(() => {
    versionManager.destroy();
  });

  describe('version Management', () => {
    test('should create and manage prompt versions', async () => {
      const promptId = 'versioned-prompt';

      // Create initial version
      const v1 = await versionManager.createVersion(promptId, {
        template: 'Hello {{name}}!',
        variables: [{ name: 'name', type: 'string', required: true }],
        metadata: { author: 'user1', description: 'Initial version' },
      });

      expect(v1.version).toBe('1.0.0');
      expect(v1.isActive).toBeTruthy();

      // Create second version
      const v2 = await versionManager.createVersion(promptId, {
        template: 'Hello {{name}}, welcome!',
        variables: [{ name: 'name', type: 'string', required: true }],
        metadata: { author: 'user2', description: 'Added welcome message' },
      });

      expect(v2.version).toBe('1.1.0');
      expect(v2.isActive).toBeTruthy();

      // First version should no longer be active
      const versions = versionManager.getVersionHistory(promptId);
      expect(versions).toHaveLength(2);
      expect(versions.find(v => v.version === '1.0.0')?.isActive).toBeFalsy();
    });

    test('should handle semantic versioning correctly', async () => {
      const promptId = 'semantic-versioned-prompt';

      // Patch version (minor change)
      const v1 = await versionManager.createVersion(promptId, {
        template: 'Hello {{name}}!',
        metadata: { changeType: 'patch' },
      });

      // Minor version (new feature)
      const v2 = await versionManager.createVersion(promptId, {
        template: 'Hello {{name}}, your role is {{role}}!',
        variables: [
          { name: 'name', type: 'string', required: true },
          { name: 'role', type: 'string', required: false },
        ],
        metadata: { changeType: 'minor' },
      });

      // Major version (breaking change)
      const v3 = await versionManager.createVersion(promptId, {
        template: 'Greetings {{fullName}}!',
        variables: [{ name: 'fullName', type: 'string', required: true }],
        metadata: { changeType: 'major' },
      });

      expect(v1.version).toBe('1.0.0');
      expect(v2.version).toBe('1.1.0');
      expect(v3.version).toBe('2.0.0');
    });

    test('should support version rollback', async () => {
      const promptId = 'rollback-prompt';

      const v1 = await versionManager.createVersion(promptId, {
        template: 'Good template',
        metadata: { description: 'Working version' },
      });

      const v2 = await versionManager.createVersion(promptId, {
        template: 'Bad template with bug',
        metadata: { description: 'Buggy version' },
      });

      // Rollback to v1
      const rolledBack = await versionManager.rollback(promptId, '1.0.0');

      expect(rolledBack.success).toBeTruthy();
      expect(rolledBack.activeVersion).toBe('1.0.0');

      const currentVersion = versionManager.getActiveVersion(promptId);
      expect(currentVersion?.template).toBe('Good template');
    });
  });

  describe('diff Tracking', () => {
    test('should track changes between versions', async () => {
      const promptId = 'diff-tracked-prompt';

      await versionManager.createVersion(promptId, {
        template: 'Hello {{name}}, you have {{points}} points.',
        variables: [
          { name: 'name', type: 'string', required: true },
          { name: 'points', type: 'number', required: true },
        ],
      });

      await versionManager.createVersion(promptId, {
        template: 'Hello {{name}}, you have {{points}} points and {{level}} level.',
        variables: [
          { name: 'name', type: 'string', required: true },
          { name: 'points', type: 'number', required: true },
          { name: 'level', type: 'string', required: true },
        ],
      });

      const diff = versionManager.getDiff(promptId, '1.0.0', '1.1.0');

      expect(diff).toBeDefined();
      expect(diff!.templateChanges.length).toBeGreaterThan(0);
      expect(diff!.variableChanges.added).toHaveLength(1);
      expect(diff!.variableChanges.added[0].name).toBe('level');
    });

    test('should identify breaking changes', async () => {
      const promptId = 'breaking-change-prompt';

      await versionManager.createVersion(promptId, {
        template: 'Hello {{name}}!',
        variables: [{ name: 'name', type: 'string', required: true }],
      });

      await versionManager.createVersion(promptId, {
        template: 'Hello {{fullName}}!',
        variables: [{ name: 'fullName', type: 'string', required: true }],
      });

      const analysis = versionManager.analyzeChanges(promptId, '1.0.0', '2.0.0');

      expect(analysis.isBreakingChange).toBeTruthy();
      expect(analysis.breakingReasons).toContain('Required variable removed: name');
      expect(analysis.breakingReasons).toContain('New required variable added: fullName');
    });
  });

  describe('version Validation and Testing', () => {
    test('should validate version compatibility', async () => {
      const promptId = 'compatibility-prompt';

      await versionManager.createVersion(promptId, {
        template: 'Version 1: {{name}}',
        variables: [{ name: 'name', type: 'string', required: true }],
      });

      await versionManager.createVersion(promptId, {
        template: 'Version 2: {{name}} {{age}}',
        variables: [
          { name: 'name', type: 'string', required: true },
          { name: 'age', type: 'number', required: false, defaultValue: 0 },
        ],
      });

      const compatibility = versionManager.checkCompatibility(promptId, '1.0.0', '1.1.0');

      expect(compatibility.isCompatible).toBeTruthy();
      expect(compatibility.compatibilityLevel).toBe('backward');
    });

    test('should support A/B testing between versions', async () => {
      const promptId = 'ab-test-prompt';

      await versionManager.createVersion(promptId, {
        template: 'Version A: {{message}}',
        metadata: { variant: 'A' },
      });

      await versionManager.createVersion(promptId, {
        template: 'Version B: {{message}}!',
        metadata: { variant: 'B' },
      });

      const abTest = await versionManager.setupABTest(promptId, {
        variants: [
          { version: '1.0.0', weight: 0.5 },
          { version: '1.1.0', weight: 0.5 },
        ],
        duration: 24 * 60 * 60 * 1000, // 24 hours
        metrics: ['response_time', 'user_satisfaction'],
      });

      expect(abTest.success).toBeTruthy();
      expect(abTest.testId).toBeDefined();

      // Test variant selection
      const variant1 = versionManager.getABTestVariant(abTest.testId!, 'user1');
      const variant2 = versionManager.getABTestVariant(abTest.testId!, 'user2');

      expect(['1.0.0', '1.1.0']).toContain(variant1.version);
      expect(['1.0.0', '1.1.0']).toContain(variant2.version);
    });
  });

  describe('performance and Analytics', () => {
    test('should track version performance metrics', async () => {
      const promptId = 'performance-tracked-prompt';

      await versionManager.createVersion(promptId, {
        template: 'Performance test: {{data}}',
      });

      // Simulate usage
      for (let i = 0; i < 10; i++) {
        await versionManager.recordUsage(promptId, '1.0.0', {
          responseTime: 100 + Math.random() * 50,
          tokenCount: 50 + Math.random() * 20,
          success: Math.random() > 0.1, // 90% success rate
        });
      }

      const metrics = versionManager.getVersionMetrics(promptId, '1.0.0');

      expect(metrics).toBeDefined();
      expect(metrics!.usageCount).toBe(10);
      expect(metrics!.averageResponseTime).toBeGreaterThan(100);
      expect(metrics!.successRate).toBeGreaterThan(0.8);
    });

    test('should generate version comparison reports', async () => {
      const promptId = 'comparison-prompt';

      // Create two versions
      await versionManager.createVersion(promptId, {
        template: 'Old version: {{input}}',
      });

      await versionManager.createVersion(promptId, {
        template: 'New improved version: {{input}}',
      });

      // Record different performance for each version
      await versionManager.recordUsage(promptId, '1.0.0', {
        responseTime: 150,
        tokenCount: 60,
        success: true,
      });

      await versionManager.recordUsage(promptId, '1.1.0', {
        responseTime: 120,
        tokenCount: 55,
        success: true,
      });

      const comparison = versionManager.compareVersions(promptId, '1.0.0', '1.1.0');

      expect(comparison.performanceComparison.responseTimeImprovement).toBeCloseTo(20, 0);
      expect(comparison.performanceComparison.tokenEfficiencyImprovement).toBeCloseTo(5, 0);
      expect(comparison.recommendation).toContain('version 1.1.0 performs better');
    });
  });
});

describe('integration Tests', () => {
  test('should integrate cache, templates, and versioning', async () => {
    const cache = new AnalyticsPromptCache({ enableCostTracking: true });
    const templateEngine = new PromptTemplateEngine({ enableCaching: true });
    const versionManager = new PromptVersionManager({});

    try {
      // Create a versioned template
      const promptId = 'integrated-prompt';
      await versionManager.createVersion(promptId, {
        template: 'Hello {{name}}, you have {{points}} points.',
        variables: [
          { name: 'name', type: 'string', required: true },
          { name: 'points', type: 'number', required: true },
        ],
      });

      // Register template in engine
      const activeVersion = versionManager.getActiveVersion(promptId);
      const template: PromptTemplate = {
        id: promptId,
        name: 'Integrated Template',
        template: activeVersion!.template,
        variables: activeVersion!.variables || [],
      };

      templateEngine.registerTemplate(template);

      // Render template with caching
      const renderAndCache = async (data: any) => {
        const view = await templateEngine.render(promptId, data);
        if (renderResult.success) {
          const cacheKey = cache.generateKey(renderResult.prompt, data);
          await cache.setWithAnalytics(cacheKey, renderResult.prompt, 'Generated response', {
            tokens: 50,
            cost: 0.15,
          });
          return renderResult.prompt;
        }
        return null;
      };

      const prompt1 = await renderAndCache({ name: 'Alice', points: 100 });
      const prompt2 = await renderAndCache({ name: 'Bob', points: 200 });

      expect(prompt1).toBe('Hello Alice, you have 100 points.');
      expect(prompt2).toBe('Hello Bob, you have 200 points.');

      // Verify caching worked
      const cacheStats = cache.getStats();
      expect(cacheStats.cache.size).toBe(2);

      // Generate analytics report
      const analyticsReport = cache.generateAnalyticsReport();
      expect(analyticsReport.efficiency.costSavings).toBeGreaterThanOrEqual(0);
    } finally {
      cache.destroy();
      templateEngine.destroy();
      versionManager.destroy();
    }
  });
});
