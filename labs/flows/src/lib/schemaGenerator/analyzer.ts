// analyzer.ts

import type {
  SupportedLanguage,
  SchemaResult,
  AnalyzerOptions,
  AnalyzeFunction,
  SchemaVersion,
  AnalysisState,
} from './types';

import {
  analyzePython,
  analyzeR,
  analyzeSQL,
  analyzeTypeScript,
} from './languages';

import { createVersion, generateHash, cleanCode, timeout } from './utils';

export const DEFAULT_TIMEOUT = 5000;
export const DEFAULT_VERSION: SchemaVersion = createVersion(1, 0, 0);

export const createSchemaAnalyzer = (defaultOptions?: AnalyzerOptions) => {
  // Internal state
  let analysisState: AnalysisState = {
    processed: 0,
    failed: 0,
    checksum: '',
    version: DEFAULT_VERSION,
    lastSuccessfulPath: [],
    errors: new Map(),
  };

  // Immutable options
  const options = Object.freeze({
    preserveRaw: false,
    strict: true,
    timeout: DEFAULT_TIMEOUT,
    version: DEFAULT_VERSION,
    ...defaultOptions,
  });

  // Language analyzers map
  const analyzers: Record<SupportedLanguage, AnalyzeFunction> = {
    python: analyzePython,
    r: analyzeR,
    sql: analyzeSQL,
    typescript: analyzeTypeScript,
  };

  const updateAnalysisState = (
    success: boolean,
    path: string[] = [],
    error?: Error,
  ): void => {
    analysisState = {
      ...analysisState,
      processed: analysisState.processed + 1,
      failed: success ? analysisState.failed : analysisState.failed + 1,
      lastSuccessfulPath: success ? path : analysisState.lastSuccessfulPath,
      checksum: generateHash(analysisState),
      errors: error
        ? new Map([...analysisState.errors, [path.join('.'), error]])
        : analysisState.errors,
    };
  };

  const executeAnalysis = async (
    code: string,
    language: SupportedLanguage,
    analysisOptions: AnalyzerOptions,
  ): Promise<SchemaResult> => {
    const analyzer = analyzers[language];
    if (!analyzer) {
      throw new Error(`Unsupported language: ${language}`);
    }

    try {
      const result = await timeout(
        Promise.resolve(analyzer(code, analysisOptions)),
        analysisOptions.timeout ?? options.timeout,
      );

      // Ensure result has required fields
      if (!result.baseType || !result.specificType) {
        throw new Error('Invalid analyzer result - missing required fields');
      }

      // Update analysis state
      updateAnalysisState(true, [language, result.baseType]);

      // Add version and clean result if needed
      const finalResult = {
        ...result,
        language,
        confidence: result.confidence ?? 1,
        version: analysisOptions.version ?? options.version,
      };

      if (!analysisOptions.preserveRaw) {
        delete finalResult.raw;
      }

      return finalResult;
    } catch (error) {
      // Update analysis state with error
      updateAnalysisState(
        false,
        [language],
        error instanceof Error ? error : new Error('Unknown error'),
      );

      if (analysisOptions.strict) {
        throw error;
      }

      // Return failure schema in non-strict mode
      return {
        baseType: 'null',
        specificType: 'null',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        confidence: 0,
        language,
        version: analysisOptions.version ?? options.version,
      };
    }
  };

  return {
    analyze: (
      code: string,
      language: SupportedLanguage,
      overrideOptions?: Partial<AnalyzerOptions>,
    ): Promise<SchemaResult> => {
      if (!code?.trim()) {
        throw new Error('Code input cannot be empty');
      }

      const analysisOptions = {
        ...options,
        ...overrideOptions,
        version: overrideOptions?.version ?? options.version,
      };

      const cleanedCode = cleanCode(code);

      return executeAnalysis(cleanedCode, language, analysisOptions);
    },

    // Utility methods
    isSupported: (language: string): language is SupportedLanguage => {
      return language in analyzers;
    },

    getSupportedLanguages: (): readonly SupportedLanguage[] => {
      return Object.keys(analyzers) as SupportedLanguage[];
    },

    getOptions: () => ({ ...options }),

    getAnalysisState: () => ({ ...analysisState }),

    resetAnalysisState: () => {
      analysisState = {
        processed: 0,
        failed: 0,
        checksum: '',
        version: options.version ?? DEFAULT_VERSION,
        lastSuccessfulPath: [],
        errors: new Map(),
      };
    },

    getAnalyzer: (language: SupportedLanguage): AnalyzeFunction | undefined => {
      return analyzers[language];
    },
  };
};

// Export a default instance with standard options
export const defaultAnalyzer = createSchemaAnalyzer();

// Named exports for convenience
export const { analyze, isSupported, getSupportedLanguages, getOptions } =
  defaultAnalyzer;
