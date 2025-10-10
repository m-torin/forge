/**
 * Schema Validation for RAG Responses
 * Provides validation, quality assessment, and error handling for structured RAG outputs
 */

import { logInfo, logWarn } from "@repo/observability/server/next";
import { z } from "zod/v3";

/**
 * Validation result for schema compliance
 */
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
  qualityScore: number;
  metadata: {
    schemaName?: string;
    validationTime: number;
    fieldsCovered: number;
    totalFields: number;
  };
}

/**
 * Quality assessment metrics for RAG responses
 */
export interface QualityMetrics {
  completeness: number; // 0-1, how complete is the response
  confidence: number; // 0-1, confidence in the response quality
  sourceReliability: number; // 0-1, reliability of sources used
  structuralIntegrity: number; // 0-1, how well the response follows the schema
  contentRelevance: number; // 0-1, relevance of content to the query
}

/**
 * Configuration for response validation
 */
export interface ValidationConfig {
  strictMode?: boolean;
  requireMinimumQuality?: number;
  logValidationResults?: boolean;
  customValidators?: Record<string, (value: any) => boolean>;
}

/**
 * Schema validator for RAG responses
 */
export class RAGSchemaValidator {
  constructor(private config: ValidationConfig = {}) {}

  /**
   * Validate response against schema with quality assessment
   */
  async validateResponse<T extends z.ZodType>(
    response: unknown,
    schema: T,
    context?: {
      query?: string;
      sources?: Array<{ score: number; metadata?: any }>;
      schemaName?: string;
    },
  ): Promise<ValidationResult<z.infer<T>>> {
    const startTime = Date.now();
    const result: ValidationResult<z.infer<T>> = {
      isValid: false,
      errors: [],
      warnings: [],
      qualityScore: 0,
      metadata: {
        schemaName: context?.schemaName,
        validationTime: 0,
        fieldsCovered: 0,
        totalFields: 0,
      },
    };

    try {
      // Basic schema validation
      const parsed = schema.parse(response);
      result.data = parsed;
      result.isValid = true;

      // Assess response quality
      const qualityMetrics = await this.assessQuality(parsed, schema, context);
      result.qualityScore = this.calculateOverallQuality(qualityMetrics);

      // Count fields for completeness
      const fieldStats = this.analyzeFieldCoverage(parsed, schema);
      result.metadata.fieldsCovered = fieldStats.covered;
      result.metadata.totalFields = fieldStats.total;

      // Check quality thresholds
      if (
        this.config.requireMinimumQuality &&
        result.qualityScore < this.config.requireMinimumQuality
      ) {
        result.warnings.push(
          `Quality score ${result.qualityScore.toFixed(2)} below required ${this.config.requireMinimumQuality}`,
        );
      }

      // Content-specific validations
      await this.performContentValidation(parsed, result);
    } catch (error) {
      result.isValid = false;

      if (error instanceof z.ZodError) {
        result.errors = error.issues.map(
          (err: any) => `${err.path.join(".")}: ${err.message}`,
        );
      } else {
        result.errors = [
          error instanceof Error ? error.message : "Unknown validation error",
        ];
      }

      // In non-strict mode, try to extract partial data
      if (!this.config.strictMode) {
        try {
          const partialData = this.extractPartialData(response, schema);
          if (partialData) {
            result.data = partialData as z.infer<T>;
            result.warnings.push(
              "Partial data extracted despite validation errors",
            );
          }
        } catch {
          // Ignore partial extraction failures
        }
      }
    }

    result.metadata.validationTime = Date.now() - startTime;

    // Log results if configured
    if (this.config.logValidationResults) {
      this.logValidationResult(result, context);
    }

    return result;
  }

  /**
   * Assess the quality of a validated response
   */
  private async assessQuality<T>(
    response: T,
    schema: z.ZodType,
    context?: {
      query?: string;
      sources?: Array<{ score: number; metadata?: any }>;
    },
  ): Promise<QualityMetrics> {
    const metrics: QualityMetrics = {
      completeness: 1.0,
      confidence: 1.0,
      sourceReliability: 1.0,
      structuralIntegrity: 1.0,
      contentRelevance: 1.0,
    };

    // Assess completeness
    metrics.completeness = this.assessCompleteness(response);

    // Assess confidence (if confidence field exists)
    if (
      typeof response === "object" &&
      response !== null &&
      "confidence" in response
    ) {
      const confidenceValue = (response as any).confidence;
      if (
        typeof confidenceValue === "number" &&
        confidenceValue >= 0 &&
        confidenceValue <= 1
      ) {
        metrics.confidence = confidenceValue;
      }
    }

    // Assess source reliability
    if (context?.sources) {
      const avgSourceScore =
        context.sources.reduce((sum, s) => sum + s.score, 0) /
        context.sources.length;
      metrics.sourceReliability = Math.min(avgSourceScore * 1.2, 1.0); // Boost slightly, cap at 1.0
    }

    // Assess structural integrity
    metrics.structuralIntegrity = this.assessStructuralIntegrity(
      response,
      schema,
    );

    // Assess content relevance (basic heuristics)
    if (context?.query && typeof response === "object" && response !== null) {
      metrics.contentRelevance = this.assessContentRelevance(
        response,
        context.query,
      );
    }

    return metrics;
  }

  /**
   * Calculate overall quality score from individual metrics
   */
  private calculateOverallQuality(metrics: QualityMetrics): number {
    const weights = {
      completeness: 0.25,
      confidence: 0.2,
      sourceReliability: 0.2,
      structuralIntegrity: 0.15,
      contentRelevance: 0.2,
    };

    return (
      metrics.completeness * weights.completeness +
      metrics.confidence * weights.confidence +
      metrics.sourceReliability * weights.sourceReliability +
      metrics.structuralIntegrity * weights.structuralIntegrity +
      metrics.contentRelevance * weights.contentRelevance
    );
  }

  /**
   * Assess completeness of response fields
   */
  private assessCompleteness(response: any): number {
    if (typeof response !== "object" || response === null) {
      return 0.5;
    }

    let totalFields = 0;
    let filledFields = 0;

    const countFields = (obj: any) => {
      for (const [_key, value] of Object.entries(obj)) {
        totalFields++;

        if (value !== null && value !== undefined && value !== "") {
          if (Array.isArray(value)) {
            filledFields += value.length > 0 ? 1 : 0;
          } else if (typeof value === "object") {
            // Recursively check nested objects
            const nestedResult = this.assessCompleteness(value);
            filledFields += nestedResult;
          } else {
            filledFields++;
          }
        }
      }
    };

    countFields(response);
    return totalFields > 0 ? filledFields / totalFields : 1.0;
  }

  /**
   * Assess structural integrity of the response
   */
  private assessStructuralIntegrity(response: any, _schema: z.ZodType): number {
    // This is a simplified assessment - in a full implementation,
    // we would analyze the schema structure more deeply

    if (typeof response !== "object" || response === null) {
      return 0.3;
    }

    // Check for required fields based on common patterns
    let score = 1.0;

    // Penalize for missing common required fields
    const commonRequiredFields = ["answer", "content", "result"];
    const hasRequiredField = commonRequiredFields.some(
      (field) => field in response,
    );

    if (!hasRequiredField) {
      score -= 0.3;
    }

    // Check for consistent data types
    for (const [key, value] of Object.entries(response)) {
      if (
        key === "confidence" &&
        (typeof value !== "number" || value < 0 || value > 1)
      ) {
        score -= 0.2;
      }
      if (key.includes("score") && typeof value !== "number") {
        score -= 0.1;
      }
    }

    return Math.max(score, 0);
  }

  /**
   * Assess content relevance to the query
   */
  private assessContentRelevance(response: any, query: string): number {
    // Basic keyword matching and length assessment
    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3);

    if (queryWords.length === 0) {
      return 0.8; // Default score if no significant query words
    }

    let matchCount = 0;
    const responseText = JSON.stringify(response).toLowerCase();

    for (const word of queryWords) {
      if (responseText.includes(word)) {
        matchCount++;
      }
    }

    const keywordRelevance = matchCount / queryWords.length;

    // Also consider response length (too short might indicate incomplete response)
    const responseLength = responseText.length;
    const lengthFactor =
      responseLength < 100 ? 0.7 : responseLength < 300 ? 0.85 : 1.0;

    return Math.min(keywordRelevance * lengthFactor, 1.0);
  }

  /**
   * Analyze field coverage in the response
   */
  private analyzeFieldCoverage(
    response: any,
    schema: z.ZodType,
  ): { covered: number; total: number } {
    // Simplified field counting - in practice, we'd introspect the schema
    let covered = 0;
    let total = 0;

    const countFields = (obj: any) => {
      if (typeof obj === "object" && obj !== null) {
        for (const [_key, value] of Object.entries(obj)) {
          total++;

          if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
              covered += value.length > 0 ? 1 : 0;
            } else if (typeof value === "string") {
              covered += value.trim().length > 0 ? 1 : 0;
            } else {
              covered++;
            }
          }

          if (typeof value === "object" && !Array.isArray(value)) {
            const nested = this.analyzeFieldCoverage(value, schema);
            covered += nested.covered;
            total += nested.total;
          }
        }
      }
    };

    countFields(response);
    return { covered, total };
  }

  /**
   * Perform content-specific validation checks
   */
  private async performContentValidation<T>(
    response: T,
    result: ValidationResult<T>,
  ): Promise<void> {
    if (typeof response !== "object" || response === null) {
      return;
    }

    const obj = response as any;

    // Check for common issues
    if ("answer" in obj && typeof obj.answer === "string") {
      if (obj.answer.length < 10) {
        result.warnings.push("Answer appears to be very short");
      }
      if (
        obj.answer.toLowerCase().includes("i don't know") &&
        obj.answer.length < 50
      ) {
        result.warnings.push("Response indicates lack of knowledge");
      }
    }

    if ("sources" in obj && Array.isArray(obj.sources)) {
      if (obj.sources.length === 0) {
        result.warnings.push("No sources provided in response");
      } else {
        const emptySources = obj.sources.filter(
          (s: any) => !s.content || s.content.trim().length === 0,
        );
        if (emptySources.length > 0) {
          result.warnings.push(
            `${emptySources.length} sources have empty content`,
          );
        }
      }
    }

    if ("confidence" in obj && typeof obj.confidence === "number") {
      if (obj.confidence < 0.3) {
        result.warnings.push("Very low confidence score");
      }
    }

    // Run custom validators if provided
    if (this.config.customValidators) {
      for (const [validatorName, validator] of Object.entries(
        this.config.customValidators,
      )) {
        try {
          if (!validator(response)) {
            result.warnings.push(`Custom validator '${validatorName}' failed`);
          }
        } catch (error) {
          result.warnings.push(
            `Custom validator '${validatorName}' threw error: ${error}`,
          );
        }
      }
    }
  }

  /**
   * Extract partial data from invalid response (best effort)
   */
  private extractPartialData<T extends z.ZodType>(
    response: unknown,
    _schema: T,
  ): Partial<z.infer<T>> | null {
    if (typeof response !== "object" || response === null) {
      return null;
    }

    // Simple extraction - return the object as-is but typed as partial
    return response as Partial<z.infer<T>>;
  }

  /**
   * Log validation results
   */
  private logValidationResult<T>(
    result: ValidationResult<T>,
    context?: { query?: string; schemaName?: string },
  ): void {
    const logData = {
      operation: "rag_response_validation",
      isValid: result.isValid,
      qualityScore: result.qualityScore,
      errors: result.errors.length,
      warnings: result.warnings.length,
      validationTime: result.metadata.validationTime,
      fieldsCovered: result.metadata.fieldsCovered,
      totalFields: result.metadata.totalFields,
      schemaName: context?.schemaName,
      query: context?.query?.substring(0, 100),
    };

    if (result.isValid) {
      logInfo("RAG response validation passed", logData);
    } else {
      logWarn("RAG response validation failed", {
        ...logData,
        errors: result.errors,
        warnings: result.warnings,
      });
    }
  }
}

/**
 * Pre-configured validators for common RAG schemas
 */
export const commonValidators = {
  /**
   * Validator for Q&A responses
   */
  qaResponse: new RAGSchemaValidator({
    requireMinimumQuality: 0.7,
    logValidationResults: true,
    customValidators: {
      hasSubstantialAnswer: (response: any) =>
        response?.answer &&
        typeof response.answer === "string" &&
        response.answer.length >= 20,
      hasReasonableConfidence: (response: any) =>
        response?.confidence && response.confidence >= 0.3,
    },
  }),

  /**
   * Validator for analysis responses
   */
  analysisResponse: new RAGSchemaValidator({
    requireMinimumQuality: 0.75,
    logValidationResults: true,
    customValidators: {
      hasKeyPoints: (response: any) =>
        response?.keyPoints &&
        Array.isArray(response.keyPoints) &&
        response.keyPoints.length > 0,
      hasSubstantialAnswer: (response: any) =>
        response?.answer && response.answer.length >= 50,
    },
  }),

  /**
   * Validator for fact extraction
   */
  factExtraction: new RAGSchemaValidator({
    requireMinimumQuality: 0.8,
    strictMode: true,
    logValidationResults: true,
    customValidators: {
      hasValidFacts: (response: any) =>
        response?.facts &&
        Array.isArray(response.facts) &&
        response.facts.every(
          (fact: any) => fact.statement && fact.confidence !== undefined,
        ),
    },
  }),
};

/**
 * Convenience function for validating responses
 */
export async function validateRAGResponse<T extends z.ZodType>(
  response: unknown,
  schema: T,
  validatorType: "qa" | "analysis" | "facts" | "custom" = "qa",
  customValidator?: RAGSchemaValidator,
  context?: {
    query?: string;
    sources?: Array<{ score: number; metadata?: any }>;
    schemaName?: string;
  },
): Promise<ValidationResult<z.infer<T>>> {
  let validator: RAGSchemaValidator;

  switch (validatorType) {
    case "qa":
      validator = commonValidators.qaResponse;
      break;
    case "analysis":
      validator = commonValidators.analysisResponse;
      break;
    case "facts":
      validator = commonValidators.factExtraction;
      break;
    case "custom":
      validator = customValidator || new RAGSchemaValidator();
      break;
    default:
      validator = commonValidators.qaResponse;
  }

  return validator.validateResponse(response, schema, context);
}

/**
 * Usage examples
 */
export const examples = {
  /**
   * Basic validation example
   */
  basic: `
import { validateRAGResponse, ragSchemas } from './schema-validation';

const response = await ragService.generateQA('What is TypeScript?');

const validation = await validateRAGResponse(
  response,
  ragSchemas.qa,
  'qa',
  undefined,
  {
    query: 'What is TypeScript?',
    sources: searchResults,
    schemaName: 'qa-response',
  }
);

if (validation.isValid) {
  console.log('Response is valid with quality score:', validation.qualityScore);
  return validation.data; // Fully typed and validated
} else {
  console.error('Validation failed:', validation.errors);
  console.warn('Warnings:', validation.warnings);

  // Still might have partial data in non-strict mode
  if (validation.data) {
    console.log('Using partial data');
    return validation.data;
  }
}
  `,

  /**
   * Custom validator example
   */
  customValidator: `
import { RAGSchemaValidator } from './schema-validation';

const customValidator = new RAGSchemaValidator({
  requireMinimumQuality: 0.85,
  strictMode: false,
  customValidators: {
    hasCodeExamples: (response) =>
      JSON.stringify(response).includes('\\\`\\\`\\\`'),
    hasSpecificFramework: (response) =>
      JSON.stringify(response).toLowerCase().includes('react'),
  },
});

const validation = await customValidator.validateResponse(
  response,
  myCustomSchema,
  { query: 'Show me React examples', schemaName: 'react-tutorial' }
);
  `,

  /**
   * Quality assessment only
   */
  qualityAssessment: `
// Just assess quality without strict validation
const validator = new RAGSchemaValidator({
  strictMode: false,
  requireMinimumQuality: 0.6,
});

const result = await validator.validateResponse(response, schema);

console.log(\\\`Quality breakdown:
  Overall Score: \\\${result.qualityScore.toFixed(2)}
  Fields Covered: \\\${result.metadata.fieldsCovered}/\\\${result.metadata.totalFields}
  Validation Time: \\\${result.metadata.validationTime}ms
  Warnings: \\\${result.warnings.length}
\\\`);
  `,
};
