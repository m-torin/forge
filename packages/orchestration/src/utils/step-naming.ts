/**
 * Step naming utilities for QStash workflow compatibility
 * 
 * QStash has specific requirements for step names to ensure proper classification:
 * - Step names should be static and predictable
 * - Dynamic variables in step names can cause "unclassified step detected" errors
 * - Special characters should be avoided
 * - Template literals with runtime variables are problematic
 */

/**
 * Sanitizes a step name to ensure QStash compatibility
 * 
 * @param stepName - The step name to sanitize
 * @returns A QStash-compatible step name
 */
export function sanitizeStepName(stepName: string): string {
  // Remove or replace special characters that might cause issues
  return stepName
    .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace special chars with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .toLowerCase(); // Ensure consistent casing
}

/**
 * Creates a safe step name for batch processing
 * 
 * Instead of using dynamic indices like `process-${index}`, use static names
 * 
 * @param baseName - Base name for the step
 * @param batchNumber - Optional batch number (will be sanitized)
 * @returns A safe step name
 */
export function createBatchStepName(baseName: string, batchNumber?: number): string {
  if (batchNumber !== undefined) {
    // Use a fixed format that QStash can classify
    return sanitizeStepName(`${baseName}-batch-${batchNumber}`);
  }
  return sanitizeStepName(baseName);
}

/**
 * Creates a safe step name for iterative processing
 * 
 * Instead of using dynamic content, use static descriptive names
 * 
 * @param operation - The operation being performed
 * @param stage - Optional stage identifier
 * @returns A safe step name
 */
export function createOperationStepName(operation: string, stage?: string): string {
  const parts = [operation, stage].filter(Boolean);
  return sanitizeStepName(parts.join('-'));
}

/**
 * Validates that a step name is QStash-compatible
 * 
 * @param stepName - The step name to validate
 * @returns True if the step name is safe, false otherwise
 */
export function isValidStepName(stepName: string): boolean {
  // Check for problematic patterns
  const hasTemplateVariables = stepName.includes('${') || stepName.includes('`');
  const hasSpecialChars = /[^a-zA-Z0-9-_]/.test(stepName);
  const isEmptyOrWhitespace = !stepName.trim();
  
  return !hasTemplateVariables && !hasSpecialChars && !isEmptyOrWhitespace;
}

/**
 * Step naming patterns that should be avoided
 */
export const PROBLEMATIC_PATTERNS = {
  TEMPLATE_LITERALS: /\$\{.*\}/,
  DYNAMIC_VARIABLES: /\${.*}/,
  SPECIAL_CHARS: /[^a-zA-Z0-9-_]/,
  URLS: /https?:\/\//,
  DOTS: /\./,
  SLASHES: /\//,
} as const;

/**
 * Recommended step naming conventions
 */
export const STEP_NAMING_CONVENTIONS = {
  // Use descriptive, static names
  GOOD_EXAMPLES: [
    'fetch-data',
    'process-batch',
    'validate-input',
    'send-notification',
    'update-progress',
    'finalize-results',
  ],
  
  // Avoid dynamic content in step names
  BAD_EXAMPLES: [
    'process-${item.id}',
    'scrape-${url}',
    'batch-${index}',
    'update-progress-${batchNumber}',
  ],
  
  // Preferred patterns for common scenarios
  BATCH_PROCESSING: 'process-batch',
  DATA_FETCHING: 'fetch-data',
  VALIDATION: 'validate-input',
  NOTIFICATION: 'send-notification',
  PROGRESS_UPDATE: 'update-progress',
  ERROR_HANDLING: 'handle-error',
  CLEANUP: 'cleanup-resources',
} as const;

/**
 * Helper function to get a recommended step name for common operations
 * 
 * @param operationType - The type of operation
 * @returns A recommended step name
 */
export function getRecommendedStepName(operationType: keyof typeof STEP_NAMING_CONVENTIONS): string {
  return STEP_NAMING_CONVENTIONS[operationType] || sanitizeStepName(String(operationType));
}

/**
 * Utility to replace dynamic step names with static ones in development
 * This helps developers identify and fix problematic step names
 * 
 * @param dynamicStepName - The dynamic step name that needs fixing
 * @param suggestions - Array of suggested static alternatives
 */
export function suggestStaticStepName(
  dynamicStepName: string,
  suggestions: string[] = []
): {
  original: string;
  isProblematic: boolean;
  suggestions: string[];
  recommended: string;
} {
  const isProblematic = !isValidStepName(dynamicStepName);
  
  const defaultSuggestions = [
    'process-item',
    'execute-operation',
    'handle-request',
    'process-batch',
  ];
  
  const allSuggestions = [...suggestions, ...defaultSuggestions];
  const recommended = sanitizeStepName(dynamicStepName.replace(/\$\{.*?\}/g, 'item'));
  
  return {
    original: dynamicStepName,
    isProblematic,
    suggestions: allSuggestions,
    recommended,
  };
}