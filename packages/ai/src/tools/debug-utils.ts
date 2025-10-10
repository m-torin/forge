import { logInfo, logWarn } from '@repo/observability';

/**
 * Debug utilities for AI SDK result inspection and tool validation
 * Light helpers that don't reinvent SDK features - just provide insights
 */
export const debugUtils = {
  // Inspect AI SDK results - supports the debugging guidelines
  inspectResult: (result: any) => {
    const warnings = result.warnings ?? [];
    const inspection = {
      warningsCount: warnings.length,
      warnings,
      usage: result.usage,
      requestBodyAvailable: Boolean(result.request?.body),
      requestBodySize: result.request?.body
        ? JSON.stringify(result.request.body).length
        : undefined,
    };

    logInfo('[DebugUtils] AI SDK result inspection', inspection);
    return result; // Return for chaining
  },

  // Validate tool setup against prompt engineering guidelines
  validateToolSetup: (tools: Record<string, any>) => {
    const count = Object.keys(tools).length;
    const issues: string[] = [];

    // Check tool count guideline (≤ 5 recommended)
    if (count > 5) {
      issues.push(`Tool count (${count}) exceeds recommended limit of 5`);
      logWarn('[DebugUtils] Tool count exceeds recommended limit', {
        count,
        limit: 5,
      });
    }

    // Simple naming check - only warn about obviously poor names
    const poorNames = Object.keys(tools).filter(
      name => name.length < 3 || name.includes('tool') || name.includes('fn'),
    );
    if (poorNames.length > 0) {
      issues.push(`Tools with unclear names: ${poorNames.join(', ')}`);
      logWarn('[DebugUtils] Consider more descriptive tool names', { tools: poorNames });
    }

    return {
      toolCount: count,
      issues,
      isOptimal: issues.length === 0,
    };
  },

  // Quick schema complexity check
  checkSchemaComplexity: (schema: any, name?: string) => {
    // Simple heuristic - would be more sophisticated in real implementation
    const schemaStr = JSON.stringify(schema);
    const depth = (schemaStr.match(/\{/g) || []).length;
    const properties = (schemaStr.match(/"type":/g) || []).length;

    const issues: string[] = [];
    if (depth > 5) {
      issues.push(`Schema depth (${depth}) may be too complex for reliable parsing`);
    }
    if (properties > 15) {
      issues.push(`Property count (${properties}) may overwhelm the model`);
    }

    if (issues.length > 0 && name) {
      logWarn('[DebugUtils] Schema complexity warning', { name, issues });
    }

    return { depth, properties, issues, isOptimal: issues.length === 0 };
  },

  // Light error classification - provides context without abstraction
  classifyError: (error: any) => {
    const message = error.message || String(error);
    const type = message.includes('rate limit')
      ? 'rate_limit'
      : message.includes('validation') || message.includes('schema')
        ? 'validation'
        : message.includes('network') || message.includes('fetch')
          ? 'network'
          : message.includes('model') || message.includes('provider')
            ? 'model_error'
            : 'unknown';

    return { type, message, context: { operation: error.operation, model: error.model } };
  },
};
