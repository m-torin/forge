/**
 * DOM Integration for Feature Flags v4
 * Implements data-variant-state attributes (replaces data-variant-values from v3)
 * Provides CSS integration and visual debugging support
 */

import { logInfo, logWarn } from '@repo/observability';
import type { FlagValuesType } from './types';

/**
 * Configuration for DOM integration
 */
interface DomIntegrationConfig {
  /** Prefix for data attributes (default: 'data-variant-state') */
  attributePrefix?: string;

  /** Whether to enable debug mode with visual indicators */
  debugMode?: boolean;

  /** CSS class prefix for flag-based classes */
  cssClassPrefix?: string;

  /** Whether to update document root classes */
  updateRootClasses?: boolean;

  /** Custom element selector to update (default: document.body) */
  targetSelector?: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<DomIntegrationConfig> = {
  attributePrefix: 'data-variant-state',
  debugMode: false,
  cssClassPrefix: 'flag-',
  updateRootClasses: true,
  targetSelector: 'body',
};

/**
 * Current DOM integration configuration
 */
let currentConfig: Required<DomIntegrationConfig> = { ...DEFAULT_CONFIG };

/**
 * Configure DOM integration settings
 *
 * @param config - Configuration options
 *
 * @example
 * ```typescript
 * import { configureDomIntegration } from '@repo/feature-flags';
 *
 * configureDomIntegration({
 *   debugMode: true,
 *   cssClassPrefix: 'feature-',
 *   updateRootClasses: true
 * });
 * ```
 */
export function configureDomIntegration(config: DomIntegrationConfig): void {
  currentConfig = { ...currentConfig, ...config };

  logInfo('DOM integration configured', {
    attributePrefix: currentConfig.attributePrefix,
    debugMode: currentConfig.debugMode,
    cssClassPrefix: currentConfig.cssClassPrefix,
    updateRootClasses: currentConfig.updateRootClasses,
  });
}

/**
 * Update DOM with flag values using data-variant-state attributes
 * This is the v4 equivalent of data-variant-values from v3
 *
 * @param flagValues - Object containing flag keys and their resolved values
 * @param options - Additional options for DOM updates
 *
 * @example
 * ```typescript
 * import { updateDomWithFlagStates } from '@repo/feature-flags';
 *
 * const flagValues = {
 *   'show-banner': true,
 *   'theme': 'dark',
 *   'sidebar-variant': 'collapsed'
 * };
 *
 * updateDomWithFlagStates(flagValues);
 * // Results in:
 * // <body data-variant-state-show-banner="true"
 * //       data-variant-state-theme="dark"
 * //       data-variant-state-sidebar-variant="collapsed"
 * //       class="flag-show-banner-true flag-theme-dark flag-sidebar-variant-collapsed">
 * ```
 */
export function updateDomWithFlagStates(
  flagValues: FlagValuesType,
  options: {
    /** Override target element selector */
    targetSelector?: string;

    /** Whether to trigger custom events */
    triggerEvents?: boolean;

    /** Additional CSS classes to add */
    additionalClasses?: string[];
  } = {},
): void {
  if (typeof document === 'undefined') {
    logWarn('DOM not available - skipping flag state updates');
    return;
  }

  const {
    targetSelector = currentConfig.targetSelector,
    triggerEvents = true,
    additionalClasses = [],
  } = options;

  try {
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
      logWarn('Target element not found for DOM updates', { targetSelector });
      return;
    }

    logInfo('Updating DOM with flag states', {
      flagCount: Object.keys(flagValues).length,
      targetSelector,
      flagKeys: Object.keys(flagValues),
    });

    // Remove existing flag-related attributes and classes
    removeExistingFlagAttributes(targetElement);
    removeExistingFlagClasses(targetElement);

    // Add new data-variant-state attributes
    const addedAttributes: string[] = [];
    const addedClasses: string[] = [];

    for (const [flagKey, flagValue] of Object.entries(flagValues)) {
      // Add data-variant-state attribute (v4 standard)
      const attributeName = `${currentConfig.attributePrefix}-${sanitizeFlagKey(flagKey)}`;
      const attributeValue = serializeFlagValue(flagValue);

      targetElement.setAttribute(attributeName, attributeValue);
      addedAttributes.push(attributeName);

      // Add CSS class for styling
      const cssClass = `${currentConfig.cssClassPrefix}${sanitizeFlagKey(flagKey)}-${sanitizeFlagValue(flagValue)}`;
      targetElement.classList.add(cssClass);
      addedClasses.push(cssClass);

      // Also add a simpler class for boolean flags
      if (typeof flagValue === 'boolean') {
        const booleanClass = `${currentConfig.cssClassPrefix}${sanitizeFlagKey(flagKey)}`;
        if (flagValue) {
          targetElement.classList.add(booleanClass);
          addedClasses.push(booleanClass);
        }
      }
    }

    // Add any additional classes
    for (const additionalClass of additionalClasses) {
      targetElement.classList.add(additionalClass);
      addedClasses.push(additionalClass);
    }

    // Add debug indicators if enabled
    if (currentConfig.debugMode) {
      addDebugIndicators(targetElement, flagValues);
    }

    // Update root classes if enabled
    if (currentConfig.updateRootClasses && targetElement === document.body) {
      updateRootElementClasses(flagValues);
    }

    // Trigger custom events
    if (triggerEvents) {
      const event = new CustomEvent('flag-states-updated', {
        detail: {
          flagValues,
          addedAttributes,
          addedClasses,
          targetElement: targetSelector,
        },
      });
      document.dispatchEvent(event);
    }

    logInfo('DOM flag states updated successfully', {
      attributeCount: addedAttributes.length,
      classCount: addedClasses.length,
      debugMode: currentConfig.debugMode,
    });
  } catch (error) {
    logWarn('Failed to update DOM with flag states', {
      error: error instanceof Error ? error.message : 'Unknown error',
      flagCount: Object.keys(flagValues).length,
    });
  }
}

/**
 * Remove existing flag-related data attributes
 */
function removeExistingFlagAttributes(element: Element): void {
  const attributesToRemove: string[] = [];

  // Find all attributes that match our prefix
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    if (attr.name.startsWith(currentConfig.attributePrefix)) {
      attributesToRemove.push(attr.name);
    }
  }

  // Remove the attributes
  for (const attrName of attributesToRemove) {
    element.removeAttribute(attrName);
  }
}

/**
 * Remove existing flag-related CSS classes
 */
function removeExistingFlagClasses(element: Element): void {
  const classesToRemove: string[] = [];

  // Find all classes that match our prefix
  element.classList.forEach(className => {
    if (className.startsWith(currentConfig.cssClassPrefix)) {
      classesToRemove.push(className);
    }
  });

  // Remove the classes
  for (const className of classesToRemove) {
    element.classList.remove(className);
  }
}

/**
 * Sanitize flag key for use in DOM attributes and CSS classes
 */
function sanitizeFlagKey(flagKey: string): string {
  return flagKey
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Serialize flag value for DOM attribute
 */
function serializeFlagValue(value: any): string {
  if (typeof value === 'boolean') {
    return value.toString();
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return 'null';
  }
  // For complex objects, JSON stringify
  return JSON.stringify(value);
}

/**
 * Sanitize flag value for use in CSS class names
 */
function sanitizeFlagValue(value: any): string {
  const serialized = serializeFlagValue(value);
  return serialized
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Add debug indicators when debug mode is enabled
 */
function addDebugIndicators(element: Element, flagValues: FlagValuesType): void {
  // Add debug class
  element.classList.add(`${currentConfig.cssClassPrefix}debug`);

  // Create or update debug info element
  let debugElement = document.querySelector('.flag-debug-info');
  if (!debugElement) {
    debugElement = document.createElement('div');
    debugElement.className = 'flag-debug-info';
    debugElement.setAttribute(
      'style',
      `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 999999;
      max-width: 300px;
      max-height: 400px;
      overflow-y: auto;
    `,
    );
    document.body.appendChild(debugElement);
  }

  // Update debug content safely to prevent XSS
  const flagEntriesText = Object.entries(flagValues)
    .map(([key, value]) => `${key}: ${serializeFlagValue(value)}`)
    .join('\n');

  // Create DOM elements safely
  debugElement.innerHTML = `
    <strong>🚩 Feature Flags Debug</strong><br>
    <small>data-variant-state attributes:</small><br>
    <pre></pre>
    <small>Click to dismiss</small>
  `;

  // Safely set text content to prevent XSS
  const preElement = debugElement.querySelector('pre');
  if (preElement) {
    preElement.textContent = flagEntriesText;
  }

  // Add click to dismiss
  debugElement.addEventListener('click', () => {
    debugElement?.remove();
  });
}

/**
 * Update root element (html) classes for global styling
 */
function updateRootElementClasses(flagValues: FlagValuesType): void {
  const rootElement = document.documentElement;
  if (!rootElement) return;

  // Remove existing flag classes from root
  removeExistingFlagClasses(rootElement);

  // Add new flag classes to root
  for (const [flagKey, flagValue] of Object.entries(flagValues)) {
    const cssClass = `${currentConfig.cssClassPrefix}${sanitizeFlagKey(flagKey)}-${sanitizeFlagValue(flagValue)}`;
    rootElement.classList.add(cssClass);

    // Add simpler class for boolean flags
    if (typeof flagValue === 'boolean' && flagValue) {
      rootElement.classList.add(`${currentConfig.cssClassPrefix}${sanitizeFlagKey(flagKey)}`);
    }
  }
}

/**
 * Get current DOM flag state from attributes
 * Useful for reading existing state or debugging
 *
 * @param targetSelector - Element selector to read from
 * @returns Object with current flag states from DOM
 */
export function getCurrentDomFlagStates(targetSelector: string = 'body'): FlagValuesType {
  if (typeof document === 'undefined') {
    return {};
  }

  const element = document.querySelector(targetSelector);
  if (!element) {
    return {};
  }

  const flagStates: FlagValuesType = {};
  const attributePrefix = currentConfig.attributePrefix + '-';

  // Read all data-variant-state attributes
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    if (attr.name.startsWith(attributePrefix)) {
      const flagKey = attr.name.substring(attributePrefix.length);
      const flagValue = deserializeFlagValue(attr.value);
      flagStates[flagKey] = flagValue;
    }
  }

  return flagStates;
}

/**
 * Deserialize flag value from DOM attribute
 */
function deserializeFlagValue(value: string): any {
  // Handle special cases
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (value === 'undefined') return undefined;

  // Try to parse as number
  const numValue = Number(value);
  if (!isNaN(numValue) && isFinite(numValue)) {
    return numValue;
  }

  // Try to parse as JSON
  try {
    return JSON.parse(value);
  } catch {
    // Return as string
    return value;
  }
}

/**
 * Create CSS helper utilities for flag-based styling
 * Generates CSS custom properties and utility classes
 *
 * @example
 * ```typescript
 * const css = generateFlagBasedCSS({
 *   'theme': 'dark',
 *   'sidebar': 'collapsed'
 * });
 *
 * // Returns CSS with custom properties and classes
 * ```
 */
export function generateFlagBasedCSS(flagValues: FlagValuesType): string {
  const cssCustomProperties = Object.entries(flagValues)
    .map(([key, value]) => {
      const sanitizedKey = sanitizeFlagKey(key);
      const serializedValue = serializeFlagValue(value);
      return `  --flag-${sanitizedKey}: '${serializedValue}';`;
    })
    .join('\n');

  const cssClasses = Object.entries(flagValues)
    .map(([key, value]) => {
      const sanitizedKey = sanitizeFlagKey(key);
      const sanitizedValue = sanitizeFlagValue(value);
      const className = `${currentConfig.cssClassPrefix}${sanitizedKey}-${sanitizedValue}`;
      return `.${className} { /* Add your styles for ${sanitizedKey} */ }`;
    })
    .join('\n');

  const rootSection = ':root {\n' + cssCustomProperties + '\n}';
  return rootSection + '\n\n' + cssClasses;
}

/**
 * Remove all flag-related DOM modifications
 * Useful for cleanup or testing
 */
export function clearDomFlagStates(targetSelector: string = 'body'): void {
  if (typeof document === 'undefined') {
    return;
  }

  const element = document.querySelector(targetSelector);
  if (!element) {
    return;
  }

  // Remove attributes and classes
  removeExistingFlagAttributes(element);
  removeExistingFlagClasses(element);

  // Remove from root element too
  if (currentConfig.updateRootClasses) {
    removeExistingFlagClasses(document.documentElement);
  }

  // Remove debug indicators
  const debugElement = document.querySelector('.flag-debug-info');
  if (debugElement) {
    debugElement.remove();
  }

  logInfo('DOM flag states cleared', { targetSelector });
}

/**
 * Watch for flag changes and automatically update DOM
 * Sets up a mutation observer to keep DOM in sync
 *
 * @param callback - Function to call when DOM updates occur
 * @returns Function to stop watching
 */
export function watchFlagStateChanges(callback?: (flagStates: FlagValuesType) => void): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  const observer = new MutationObserver(mutations => {
    let hasChanges = false;

    for (const mutation of mutations) {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName?.startsWith(currentConfig.attributePrefix)
      ) {
        hasChanges = true;
        break;
      }
    }

    if (hasChanges && callback) {
      const currentStates = getCurrentDomFlagStates();
      callback(currentStates);
    }
  });

  // Start observing
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: [currentConfig.attributePrefix],
  });

  logInfo('Started watching flag state changes');

  // Return cleanup function
  return () => {
    observer.disconnect();
    logInfo('Stopped watching flag state changes');
  };
}
