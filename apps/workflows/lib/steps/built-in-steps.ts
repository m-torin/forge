import { type StepContext, type StepDefinition, type StepResult } from './step-registry';

// Utility steps
export const delayStep: StepDefinition = {
  id: 'delay',
  name: 'Delay',
  category: 'utility',
  description: 'Wait for a specified amount of time',
  async handler(context: StepContext): Promise<StepResult> {
    const { duration } = context.input;

    if (typeof duration !== 'number' || duration < 0) {
      return {
        error: 'Duration must be a non-negative number',
        success: false,
      };
    }

    await new Promise((resolve) => setTimeout(resolve, duration));

    return {
      metadata: { delayDuration: duration },
      output: { delayed: duration },
      success: true,
    };
  },
  inputSchema: {
    type: 'object',
    properties: {
      duration: { type: 'number', description: 'Delay duration in milliseconds', minimum: 0 },
    },
    required: ['duration'],
  },
  tags: ['delay', 'wait', 'timing'],
  version: '1.0.0',
};

export const logStep: StepDefinition = {
  id: 'log',
  name: 'Log',
  category: 'utility',
  description: 'Log a message with specified level',
  async handler(context: StepContext): Promise<StepResult> {
    const { data, level = 'info', message } = context.input;

    const logData = {
      data,
      executionId: context.executionId,
      message,
      stepId: context.stepId,
      timestamp: new Date().toISOString(),
      workflowId: context.workflowId,
    };

    switch (level) {
      case 'debug':
        console.debug('[WORKFLOW]', logData);
        break;
      case 'warn':
        console.warn('[WORKFLOW]', logData);
        break;
      case 'error':
        console.error('[WORKFLOW]', logData);
        break;
      default:
        console.log('[WORKFLOW]', logData);
    }

    return {
      metadata: { logLevel: level },
      output: { level, logged: true, message },
      success: true,
    };
  },
  inputSchema: {
    type: 'object',
    properties: {
      data: { type: 'object', description: 'Additional data to log' },
      level: { type: 'string', default: 'info', enum: ['debug', 'info', 'warn', 'error'] },
      message: { type: 'string', description: 'Message to log' },
    },
    required: ['message'],
  },
  tags: ['logging', 'debug', 'monitoring'],
  version: '1.0.0',
};

// Data transformation steps
export const transformDataStep: StepDefinition = {
  id: 'transform-data',
  name: 'Transform Data',
  category: 'data',
  description: 'Transform input data using JavaScript expressions',
  async handler(context: StepContext): Promise<StepResult> {
    const { sourceData = context.input, transformations } = context.input;
    const output: Record<string, any> = {};

    try {
      for (const [key, expression] of Object.entries(transformations)) {
        if (typeof expression === 'string') {
          // Simple property access or literal value
          if (expression.startsWith('$.')) {
            const path = expression.substring(2);
            output[key] = getNestedProperty(sourceData, path);
          } else {
            output[key] = expression;
          }
        } else {
          // Direct value assignment
          output[key] = expression;
        }
      }

      return {
        metadata: { transformedKeys: Object.keys(output) },
        output,
        success: true,
      };
    } catch (error) {
      return {
        error: `Data transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      };
    }
  },
  inputSchema: {
    type: 'object',
    properties: {
      sourceData: {
        type: 'object',
        description: 'Source data to transform',
      },
      transformations: {
        type: 'object',
        description: 'Object mapping output keys to transformation expressions',
      },
    },
    required: ['transformations'],
  },
  tags: ['transform', 'data', 'mapping'],
  version: '1.0.0',
};

export const filterDataStep: StepDefinition = {
  id: 'filter-data',
  name: 'Filter Data',
  category: 'data',
  description: 'Filter arrays or objects based on conditions',
  async handler(context: StepContext): Promise<StepResult> {
    const { condition, data } = context.input;

    try {
      let filtered: any;

      if (Array.isArray(data)) {
        filtered = data.filter((item) => evaluateCondition(item, condition));
      } else if (typeof data === 'object' && data !== null) {
        filtered = {};
        for (const [key, value] of Object.entries(data)) {
          if (evaluateCondition({ key, value }, condition)) {
            filtered[key] = value;
          }
        }
      } else {
        return {
          error: 'Data must be an array or object',
          success: false,
        };
      }

      return {
        metadata: {
          filteredLength: Array.isArray(filtered) ? filtered.length : Object.keys(filtered).length,
          originalLength: Array.isArray(data) ? data.length : Object.keys(data).length,
        },
        output: filtered,
        success: true,
      };
    } catch (error) {
      return {
        error: `Filter operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      };
    }
  },
  inputSchema: {
    type: 'object',
    properties: {
      condition: { type: 'string', description: 'Filter condition' },
      data: { description: 'Data to filter (array or object)' },
    },
    required: ['data', 'condition'],
  },
  tags: ['filter', 'data', 'array'],
  version: '1.0.0',
};

// HTTP steps
export const httpRequestStep: StepDefinition = {
  id: 'http-request',
  name: 'HTTP Request',
  category: 'http',
  description: 'Make HTTP requests to external APIs',
  async handler(context: StepContext): Promise<StepResult> {
    const { url, body, headers = {}, method = 'GET', timeout = 30000 } = context.input;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        method,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.text();
      let parsedData: any = responseData;

      try {
        parsedData = JSON.parse(responseData);
      } catch {
        // Keep as text if not valid JSON
      }

      return {
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
        metadata: {
          url,
          method,
          responseTime: Date.now() - context.metadata.startTime,
          status: response.status,
        },
        output: {
          data: parsedData,
          headers: Object.fromEntries(response.headers.entries()),
          status: response.status,
          statusText: response.statusText,
        },
        success: response.ok,
      };
    } catch (error) {
      return {
        error: `HTTP request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { url, method },
        success: false,
      };
    }
  },
  inputSchema: {
    type: 'object',
    properties: {
      url: { type: 'string', format: 'uri' },
      body: { description: 'Request body' },
      headers: { type: 'object' },
      method: { type: 'string', default: 'GET', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
      timeout: { type: 'number', default: 30000, maximum: 60000, minimum: 1000 },
    },
    required: ['url'],
  },
  retries: 2,
  tags: ['http', 'api', 'request', 'external'],
  timeout: 30000, // 30 second timeout
  version: '1.0.0',
};

// Conditional steps
export const conditionalStep: StepDefinition = {
  id: 'conditional',
  name: 'Conditional',
  category: 'control',
  description: 'Execute different paths based on conditions',
  async handler(context: StepContext): Promise<StepResult> {
    const { condition, data, ifFalse, ifTrue } = context.input;

    try {
      const result = evaluateCondition(data, condition);

      return {
        metadata: {
          condition,
          conditionResult: result,
        },
        nextSteps: result && ifTrue ? ['true-branch'] : ['false-branch'],
        output: result ? ifTrue : ifFalse,
        success: true,
      };
    } catch (error) {
      return {
        error: `Condition evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
      };
    }
  },
  inputSchema: {
    type: 'object',
    properties: {
      condition: { type: 'string', description: 'Condition to evaluate' },
      data: { description: 'Data to evaluate condition against' },
      ifFalse: { description: 'Value to return if condition is false' },
      ifTrue: { description: 'Value to return if condition is true' },
    },
    required: ['condition', 'data'],
  },
  tags: ['conditional', 'if', 'branch', 'logic'],
  version: '1.0.0',
};

// Helper functions
function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

function evaluateCondition(data: any, condition: string): boolean {
  // Simple condition evaluation - in production, use a safe expression evaluator
  try {
    // Support basic comparisons
    if (condition.includes('==')) {
      const [left, right] = condition.split('==').map((s) => s.trim());
      const leftValue = left.startsWith('$.') ? getNestedProperty(data, left.substring(2)) : left;
      const rightValue = right.startsWith('$.')
        ? getNestedProperty(data, right.substring(2))
        : right;
      return leftValue == rightValue;
    }

    if (condition.includes('!=')) {
      const [left, right] = condition.split('!=').map((s) => s.trim());
      const leftValue = left.startsWith('$.') ? getNestedProperty(data, left.substring(2)) : left;
      const rightValue = right.startsWith('$.')
        ? getNestedProperty(data, right.substring(2))
        : right;
      return leftValue != rightValue;
    }

    if (condition.includes('>')) {
      const [left, right] = condition.split('>').map((s) => s.trim());
      const leftValue = left.startsWith('$.')
        ? getNestedProperty(data, left.substring(2))
        : parseFloat(left);
      const rightValue = right.startsWith('$.')
        ? getNestedProperty(data, right.substring(2))
        : parseFloat(right);
      return leftValue > rightValue;
    }

    if (condition.includes('<')) {
      const [left, right] = condition.split('<').map((s) => s.trim());
      const leftValue = left.startsWith('$.')
        ? getNestedProperty(data, left.substring(2))
        : parseFloat(left);
      const rightValue = right.startsWith('$.')
        ? getNestedProperty(data, right.substring(2))
        : parseFloat(right);
      return leftValue < rightValue;
    }

    // Default: check if property exists and is truthy
    if (condition.startsWith('$.')) {
      const value = getNestedProperty(data, condition.substring(2));
      return !!value;
    }

    return false;
  } catch {
    return false;
  }
}

// Export all built-in steps
export const builtInSteps: StepDefinition[] = [
  delayStep,
  logStep,
  transformDataStep,
  filterDataStep,
  httpRequestStep,
  conditionalStep,
];
