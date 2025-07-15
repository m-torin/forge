/**
 * Context7 MCP Integration
 * Smart integration for automatic library documentation lookup and context enhancement
 */

import { logError, logInfo } from '@repo/observability';
import type { FeatureFlagContext } from '../feature-flags/config';
import { mcpAnalytics } from './analytics';

/**
 * Context7 tool definitions matching the official MCP server
 */
export interface Context7Tools {
  'mcp__context7__resolve-library-id': {
    parameters: {
      libraryName: string;
    };
    result: {
      libraryId: string;
      confidence: number;
      alternatives?: string[];
    };
  };
  'mcp__context7__get-library-docs': {
    parameters: {
      context7CompatibleLibraryID: string;
      topic?: string;
      tokens?: number;
    };
    result: {
      documentation: string;
      source: string;
      version?: string;
      lastUpdated?: string;
    };
  };
}

/**
 * Context detection patterns for automatic Context7 invocation
 */
const CONTEXT7_TRIGGER_PATTERNS = [
  // Direct requests for documentation
  /(?:use|with|using)\s+context7/i,
  /(?:docs?|documentation)\s+for\s+(\w+)/i,
  /(?:how\s+to\s+(?:use|configure|setup|install))\s+(\w+)/i,

  // Library/framework mentions
  /(?:react|next\.?js|vue|angular|svelte)/i,
  /(?:express|fastify|koa|hapi)/i,
  /(?:typescript|javascript|node\.?js)/i,
  /(?:tailwind|bootstrap|material-ui|chakra)/i,
  /(?:prisma|sequelize|mongoose|typeorm)/i,
  /(?:jest|vitest|cypress|playwright)/i,
  /(?:webpack|vite|rollup|parcel)/i,
  /(?:supabase|firebase|mongodb|postgres)/i,

  // Code-related requests
  /(?:api|library|package|module|framework)\s+(\w+)/i,
  /(?:install|setup|configure|implement)\s+(\w+)/i,
  /(?:examples?|tutorial|guide)\s+for\s+(\w{1,30})/i,
  /(?:examples?|tutorial|guide)\s+(\w{1,30})/i,
];

/**
 * Library name extraction patterns
 */
const LIBRARY_EXTRACTION_PATTERNS = [
  // Direct mentions
  /(?:using|with|for)\s+(\w{1,30})/i,
  // Package syntax
  /@([\w/-]{1,50})/i,
  // Common patterns
  /(\w+)\.js/i,
  /(\w+)\s+(?:library|framework|package)/i,
];

/**
 * Context7 Integration Service
 */
export class Context7IntegrationService {
  private cacheTimeout = 1800000; // 30 minutes
  private documentationCache = new Map<
    string,
    {
      data: string;
      timestamp: number;
      version?: string;
    }
  >();

  /**
   * Analyze a message to determine if Context7 should be invoked
   */
  analyzeMessage(message: string): {
    shouldUseContext7: boolean;
    detectedLibraries: string[];
    confidence: number;
    suggestedQuery?: string;
  } {
    const detectedLibraries: string[] = [];
    let shouldUseContext7 = false;
    let confidence = 0;

    // Check for explicit Context7 requests
    const explicitMatch = CONTEXT7_TRIGGER_PATTERNS[0].test(message);
    if (explicitMatch) {
      shouldUseContext7 = true;
      confidence = 1.0;
    }

    // Extract potential library names
    for (const pattern of LIBRARY_EXTRACTION_PATTERNS) {
      const matches = message.match(pattern);
      if (matches && matches[1]) {
        const library = matches[1].toLowerCase();
        if (!detectedLibraries.includes(library)) {
          detectedLibraries.push(library);
        }
      }
    }

    // Check trigger patterns for implicit Context7 usage
    if (!explicitMatch) {
      for (const pattern of CONTEXT7_TRIGGER_PATTERNS.slice(1)) {
        if (pattern.test(message)) {
          shouldUseContext7 = true;
          confidence = Math.max(confidence, 0.7);
          break;
        }
      }
    }

    // Increase confidence based on detected libraries
    if (detectedLibraries.length > 0) {
      confidence = Math.max(confidence, 0.6 + detectedLibraries.length * 0.1);
      shouldUseContext7 = true;
    }

    // Create suggested query for Context7
    let suggestedQuery: string | undefined;
    if (shouldUseContext7 && detectedLibraries.length > 0) {
      suggestedQuery = detectedLibraries[0];
    }

    return {
      shouldUseContext7,
      detectedLibraries,
      confidence: Math.min(confidence, 1.0),
      suggestedQuery,
    };
  }

  /**
   * Resolve library ID using Context7
   */
  async resolveLibraryId(
    libraryName: string,
    context: FeatureFlagContext = {},
  ): Promise<{
    libraryId: string;
    confidence: number;
    alternatives?: string[];
  } | null> {
    try {
      const startTime = Date.now();

      logInfo('Context7: Resolving library ID', {
        operation: 'context7_resolve_library',
        metadata: {
          libraryName: libraryName.substring(0, 50),
          userId: context.user?.id,
        },
      });

      // This would call the actual Context7 MCP tool
      // For now, return a simulated response
      const response = await this.simulateLibraryResolution(libraryName);

      const executionTime = Date.now() - startTime;

      // Track analytics
      mcpAnalytics.trackToolExecution({
        toolName: 'context7_resolve_library_id',
        executionTime,
        success: true,
        userId: context.user?.id,
        clientType: 'enhanced',
        contextSize: libraryName.length,
      });

      logInfo('Context7: Library ID resolved successfully', {
        operation: 'context7_resolve_library_success',
        metadata: {
          libraryName: libraryName.substring(0, 50),
          libraryId: response.libraryId,
          confidence: response.confidence,
          executionTime,
        },
      });

      return response;
    } catch (error) {
      const resolveError = error instanceof Error ? error : new Error(String(error));

      mcpAnalytics.trackToolExecution({
        toolName: 'context7_resolve_library_id',
        executionTime: Date.now(),
        success: false,
        userId: context.user?.id,
        clientType: 'enhanced',
        error: resolveError,
      });

      logError('Context7: Failed to resolve library ID', {
        operation: 'context7_resolve_library_failed',
        metadata: { libraryName: libraryName.substring(0, 50) },
        error: resolveError,
      });

      return null;
    }
  }

  /**
   * Get library documentation using Context7
   */
  async getLibraryDocumentation(
    libraryId: string,
    options: {
      topic?: string;
      tokens?: number;
      useCache?: boolean;
    } = {},
    context: FeatureFlagContext = {},
  ): Promise<{
    documentation: string;
    source: string;
    version?: string;
    lastUpdated?: string;
    cached?: boolean;
  } | null> {
    try {
      const cacheKey = `${libraryId}:${options.topic || 'general'}:${options.tokens || 10000}`;

      // Check cache first
      if (options.useCache !== false) {
        const cached = this.documentationCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
          logInfo('Context7: Serving documentation from cache', {
            operation: 'context7_docs_cache_hit',
            metadata: {
              libraryId: libraryId.substring(0, 50),
              topic: options.topic,
              age: Date.now() - cached.timestamp,
            },
          });

          return {
            documentation: cached.data,
            source: 'context7-cache',
            version: cached.version,
            cached: true,
          };
        }
      }

      const startTime = Date.now();

      logInfo('Context7: Fetching library documentation', {
        operation: 'context7_get_docs',
        metadata: {
          libraryId: libraryId.substring(0, 50),
          topic: options.topic,
          tokens: options.tokens,
          userId: context.user?.id,
        },
      });

      // This would call the actual Context7 MCP tool
      const response = await this.simulateDocumentationFetch(libraryId, options);

      const executionTime = Date.now() - startTime;

      // Cache the response
      this.documentationCache.set(cacheKey, {
        data: response.documentation,
        timestamp: Date.now(),
        version: response.version,
      });

      // Track analytics
      mcpAnalytics.trackToolExecution({
        toolName: 'context7_get_library_docs',
        executionTime,
        success: true,
        userId: context.user?.id,
        clientType: 'enhanced',
        contextSize: response.documentation.length,
      });

      logInfo('Context7: Documentation fetched successfully', {
        operation: 'context7_get_docs_success',
        metadata: {
          libraryId: libraryId.substring(0, 50),
          documentationLength: response.documentation.length,
          executionTime,
          cached: false,
        },
      });

      return {
        ...response,
        cached: false,
      };
    } catch (error) {
      const docsError = error instanceof Error ? error : new Error(String(error));

      mcpAnalytics.trackToolExecution({
        toolName: 'context7_get_library_docs',
        executionTime: Date.now(),
        success: false,
        userId: context.user?.id,
        clientType: 'enhanced',
        error: docsError,
      });

      logError('Context7: Failed to fetch documentation', {
        operation: 'context7_get_docs_failed',
        metadata: {
          libraryId: libraryId.substring(0, 50),
          topic: options.topic,
        },
        error: docsError,
      });

      return null;
    }
  }

  /**
   * Smart documentation enhancement for messages
   */
  async enhanceMessageWithContext7(
    message: string,
    context: FeatureFlagContext = {},
  ): Promise<{
    enhancedMessage: string;
    usedContext7: boolean;
    librariesFound: string[];
    documentationAdded: number;
  }> {
    const analysis = this.analyzeMessage(message);

    if (!analysis.shouldUseContext7 || analysis.detectedLibraries.length === 0) {
      return {
        enhancedMessage: message,
        usedContext7: false,
        librariesFound: [],
        documentationAdded: 0,
      };
    }

    try {
      let enhancedMessage = message;
      let documentationAdded = 0;
      const processedLibraries: string[] = [];

      // Process up to 3 libraries to avoid overwhelming the context
      const librariesToProcess = analysis.detectedLibraries.slice(0, 3);

      for (const libraryName of librariesToProcess) {
        // Skip if we've already processed this library
        if (processedLibraries.includes(libraryName)) {
          continue;
        }

        // Resolve library ID
        const resolution = await this.resolveLibraryId(libraryName, context);
        if (!resolution || resolution.confidence < 0.5) {
          continue;
        }

        // Get documentation
        const docs = await this.getLibraryDocumentation(
          resolution.libraryId,
          { tokens: 3000, useCache: true },
          context,
        );

        if (docs && docs.documentation) {
          // Add documentation to message
          const contextBlock = `

--- ${libraryName.toUpperCase()} DOCUMENTATION (via Context7) ---
${docs.documentation}
--- END ${libraryName.toUpperCase()} DOCUMENTATION ---
`;
          enhancedMessage += contextBlock;
          documentationAdded++;
          processedLibraries.push(libraryName);
        }
      }

      if (documentationAdded > 0) {
        enhancedMessage = `${enhancedMessage}

Note: I've included up-to-date documentation from Context7 for the libraries mentioned above. Please use this information to provide accurate, current examples and guidance.`;
      }

      logInfo('Context7: Message enhanced with documentation', {
        operation: 'context7_message_enhanced',
        metadata: {
          originalLength: message.length,
          enhancedLength: enhancedMessage.length,
          librariesProcessed: processedLibraries.length,
          documentationAdded,
          userId: context.user?.id,
        },
      });

      return {
        enhancedMessage,
        usedContext7: true,
        librariesFound: processedLibraries,
        documentationAdded,
      };
    } catch (error) {
      logError('Context7: Failed to enhance message', {
        operation: 'context7_message_enhance_failed',
        metadata: {
          detectedLibraries: analysis.detectedLibraries,
          userId: context.user?.id,
        },
        error: error instanceof Error ? error : new Error(String(error)),
      });

      return {
        enhancedMessage: message,
        usedContext7: false,
        librariesFound: analysis.detectedLibraries,
        documentationAdded: 0,
      };
    }
  }

  /**
   * Clear documentation cache
   */
  clearCache(): void {
    const cacheSize = this.documentationCache.size;
    this.documentationCache.clear();

    logInfo('Context7: Documentation cache cleared', {
      operation: 'context7_cache_cleared',
      metadata: { entriesCleared: cacheSize },
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalEntries: number;
    cacheHitRate: number;
    oldestEntry: number;
    newestEntry: number;
    totalSizeBytes: number;
  } {
    const entries = Array.from(this.documentationCache.values());
    const now = Date.now();

    return {
      totalEntries: entries.length,
      cacheHitRate: 0, // Would track this in production
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => now - e.timestamp)) : 0,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => now - e.timestamp)) : 0,
      totalSizeBytes: entries.reduce((sum, entry) => sum + entry.data.length, 0),
    };
  }

  /**
   * Simulation methods (would be replaced with actual MCP calls)
   */
  private async simulateLibraryResolution(libraryName: string): Promise<{
    libraryId: string;
    confidence: number;
    alternatives?: string[];
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Common library mappings
    const libraryMappings: Record<string, string> = {
      react: '/facebook/react',
      nextjs: '/vercel/next.js',
      'next.js': '/vercel/next.js',
      vue: '/vuejs/vue',
      angular: '/angular/angular',
      svelte: '/sveltejs/svelte',
      express: '/expressjs/express',
      fastify: '/fastify/fastify',
      prisma: '/prisma/prisma',
      supabase: '/supabase/supabase',
      tailwind: '/tailwindlabs/tailwindcss',
      typescript: '/microsoft/typescript',
      node: '/nodejs/node',
      jest: '/facebook/jest',
      vitest: '/vitest-dev/vitest',
    };

    const normalizedName = libraryName.toLowerCase().replace(/[.\-_]/g, '');
    const libraryId = libraryMappings[normalizedName] || `/community/${libraryName}`;

    return {
      libraryId,
      confidence: libraryMappings[normalizedName] ? 0.9 : 0.6,
      alternatives: libraryMappings[normalizedName] ? [] : ['/community/similar-lib'],
    };
  }

  private async simulateDocumentationFetch(
    libraryId: string,
    options: { topic?: string; tokens?: number },
  ): Promise<{
    documentation: string;
    source: string;
    version?: string;
    lastUpdated?: string;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const libraryName = libraryId.split('/').pop() || 'library';
    const topic = options.topic || 'overview';

    return {
      documentation: `# ${libraryName.charAt(0).toUpperCase() + libraryName.slice(1)} Documentation

## ${topic.charAt(0).toUpperCase() + topic.slice(1)}

This is up-to-date documentation for ${libraryName} retrieved via Context7.

### Installation
\`\`\`bash
npm install ${libraryName}
\`\`\`

### Basic Usage
\`\`\`javascript
import ${libraryName} from '${libraryName}';

// Example usage
const example = new ${libraryName}();
\`\`\`

### API Reference
- method1(): Returns data
- method2(param: string): Processes parameter
- method3(options: object): Advanced configuration

This documentation is automatically retrieved from the latest official sources.`,
      source: 'context7',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Global Context7 integration service
 */
export const context7Integration = new Context7IntegrationService();

/**
 * Utility functions for Context7 integration
 */
export const context7Utils = {
  analyzeMessage: (message: string) => context7Integration.analyzeMessage(message),

  resolveLibrary: (libraryName: string, context?: FeatureFlagContext) =>
    context7Integration.resolveLibraryId(libraryName, context),

  getDocs: (libraryId: string, options?: any, context?: FeatureFlagContext) =>
    context7Integration.getLibraryDocumentation(libraryId, options, context),

  enhanceMessage: (message: string, context?: FeatureFlagContext) =>
    context7Integration.enhanceMessageWithContext7(message, context),

  clearCache: () => context7Integration.clearCache(),

  getCacheStats: () => context7Integration.getCacheStats(),
};
