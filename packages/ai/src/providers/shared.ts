/**
 * Shared Provider Utilities
 * Common constants and helpers used across all AI providers
 * Maximum DRY without over-abstraction
 */

/**
 * Common temperature presets used across providers
 * Single source of truth for temperature values
 */
export const TEMPS = {
  PRECISE: 0, // Deterministic, no randomness
  VERY_LOW: 0.1, // Near-deterministic, minimal variation
  FACTUAL: 0.2, // Low creativity, high accuracy
  LOW_CREATIVE: 0.3, // Slightly creative, mostly factual
  MODERATE: 0.5, // Moderate balance
  BALANCED: 0.7, // Default for most use cases
  HIGH_CREATIVE: 0.8, // Higher creativity
  CREATIVE: 0.9, // High creativity, more variety
} as const;

/**
 * Common token limit presets
 * Standardized across providers where applicable
 */
export const TOKENS = {
  TINY: 256, // Very short responses
  SHORT: 1024, // Quick responses
  MEDIUM: 2048, // Standard responses
  LONG: 4096, // Detailed responses
  EXTENDED: 8192, // Extended context
  MAX: 16384, // Maximum for most models
} as const;

/**
 * Common topP values for nucleus sampling
 * Controls diversity of token selection
 */
export const TOP_P = {
  DETERMINISTIC: 1.0, // Use all tokens above threshold
  FOCUSED: 0.95, // Slightly restricted vocabulary
  BALANCED: 0.98, // Good balance of diversity
} as const;

/**
 * Common mode configurations shared across providers
 * These return raw configs - providers wrap them appropriately
 */
export const commonModes = {
  /**
   * Precise mode - deterministic outputs
   * Used for: factual queries, data extraction, classification
   */
  precise: () => ({
    temperature: TEMPS.PRECISE,
    topP: TOP_P.DETERMINISTIC,
  }),

  /**
   * Code mode - optimized for programming
   * Used for: code generation, refactoring, debugging
   */
  code: () => ({
    temperature: TEMPS.FACTUAL,
    topP: TOP_P.FOCUSED,
  }),

  /**
   * Creative mode - higher variability
   * Used for: creative writing, brainstorming, ideation
   */
  creative: () => ({
    temperature: TEMPS.CREATIVE,
    topP: TOP_P.BALANCED,
  }),

  /**
   * Research mode - balanced accuracy
   * Used for: research, analysis, comprehensive responses
   */
  research: () => ({
    temperature: TEMPS.FACTUAL,
    maxOutputTokens: TOKENS.LONG,
  }),

  /**
   * Quick mode - fast responses
   * Used for: simple queries, quick checks, validations
   */
  quick: () => ({
    temperature: TEMPS.MODERATE,
    maxOutputTokens: TOKENS.SHORT,
  }),
};

/**
 * Type for temperature preset keys
 */
export type TemperaturePreset = keyof typeof TEMPS;

/**
 * Type for token preset keys
 */
export type TokenPreset = keyof typeof TOKENS;

/**
 * Type for topP preset keys
 */
export type TopPPreset = keyof typeof TOP_P;

/**
 * Type for common mode keys
 */
export type CommonMode = keyof typeof commonModes;
