import {
  ComputeResult,
  generateEventId,
  createComputeSuccess,
  createComputeError,
} from '#/flows/nodes/internal';
import { logError } from '@repo/observability';

/**
 * Timeout duration for code execution in milliseconds
 */
const EXECUTION_TIMEOUT = 5000; // 5 seconds

/**
 * Base metadata interface for Python editor
 */
interface BaseJsEditorMetadata {
  code: string;
}

/**
 * Type guard to check if metadata contains required code property
 */
const hasCodeMetadata = (
  metadata: unknown,
): metadata is BaseJsEditorMetadata => {
  return typeof (metadata as BaseJsEditorMetadata)?.code === 'string';
};

/**
 * Evaluates Python code with the provided input data
 * @param code - Python code to execute
 * @param input - Input data available to the code
 * @returns Promise resolving to the execution result
 */
const evaluateCode = async (code: string, input: Record<string, any>) => {
  try {
    const wrappedCode = `
      try {
        ${code}
      } catch (error) {
        throw new Error(\`Runtime error: \${error.message}\`);
      }
    `;

    // Create a safe function from the code string
    const AsyncFunction = Object.getPrototypeOf(
      async function () {},
    ).constructor;
    const fn = new AsyncFunction('input', wrappedCode);

    // Execute with timeout
    const result = await Promise.race([
      // Code execution
      fn(input),
      // Timeout rejection
      new Promise((_resolve, reject) =>
        setTimeout(
          () => reject(new Error('Code execution timed out')),
          EXECUTION_TIMEOUT,
        ),
      ),
    ]);

    // Validate result is serializable
    JSON.stringify(result);

    return result;
  } catch (error) {
    throw new Error(
      `Code execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
};

/**
 * Sanitizes input data by ensuring it's JSON-serializable
 * @param input - Input data to sanitize
 * @returns Sanitized input data
 */
const sanitizeInput = (input: Record<string, any>): Record<string, any> => {
  // Deep clone and validate input
  try {
    return JSON.parse(JSON.stringify(input));
  } catch {
    throw new Error('Invalid input data structure');
  }
};

/**
 * Main compute function for Python editor node
 * Generic T allows for different node/values types while ensuring they have metadata
 * @param input - Input data from connected nodes
 * @param config - Node/values configuration containing metadata
 * @returns Promise resolving to compute result
 */
export const computeFunction = async <T extends { metadata?: unknown }>(
  input: Record<string, any>,
  config: T,
): Promise<ComputeResult> => {
  try {
    // Handle disabled state if it exists on the config
    if (
      'isEnabled' in config &&
      !(config as { isEnabled: boolean }).isEnabled
    ) {
      return createComputeSuccess({
        eventIds: [],
        processedData: {},
      });
    }

    // Validate metadata exists and contains code
    if (!config.metadata || !hasCodeMetadata(config.metadata)) {
      throw new Error('Invalid or missing code in metadata');
    }

    // Sanitize input and execute code
    const safeInput = sanitizeInput(input);
    const result = await evaluateCode(config.metadata.code, safeInput);
    const eventId = generateEventId('pythonEditor');

    return createComputeSuccess({
      eventIds: [eventId],
      processedData: {
        [eventId]: result,
      },
    });
  } catch (error) {
    logError('Python evaluation error', { error });
    return createComputeError(error);
  }
};

/**
 * Wrapper for the compute function to maintain compatibility with node system
 */
export const computeWrapper = computeFunction;
