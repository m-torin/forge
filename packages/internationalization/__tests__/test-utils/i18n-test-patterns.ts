/**
 * I18n Test Patterns and Utilities
 *
 * Reusable test patterns for internationalization testing.
 * Provides consistent testing approaches across all i18n test files.
 */

import { expect, test, vi } from 'vitest';
import type { Dictionary, Locale } from '../../src/shared/dictionary-loader';

// ============================================================================
// CORE I18N TEST PATTERNS
// ============================================================================

/**
 * Standard pattern for testing all supported locales
 */
export function testAllLocales<T>(
  operation: (locale: Locale) => T,
  assertion: (result: T, locale: Locale) => void,
  supportedLocales: Locale[] = ['en', 'fr', 'es', 'pt', 'de'],
) {
  supportedLocales.forEach(locale => {
    test(`should work correctly for ${locale} locale`, () => {
      const result = operation(locale);
      assertion(result, locale);
    });
  });
}

/**
 * Pattern for testing dictionary operations across locales
 */
export function testDictionaryOperations(
  dictionaryProvider: (locale: Locale) => Dictionary,
  validationFn: (dictionary: Dictionary, locale: Locale) => void,
  supportedLocales: Locale[] = ['en', 'fr', 'es', 'pt', 'de'],
) {
  supportedLocales.forEach(locale => {
    test(`should provide valid dictionary for ${locale}`, () => {
      const dictionary = dictionaryProvider(locale);
      validationFn(dictionary, locale);
    });
  });
}

/**
 * Pattern for testing middleware behavior across different request scenarios
 */
export function testMiddlewareScenarios(
  middlewareFactory: (config: any) => any,
  scenarios: Array<{
    name: string;
    config: any;
    request: any;
    expectedResult: any;
    customAssertions?: (result: any, request: any) => void;
  }>,
) {
  scenarios.forEach(scenario => {
    test(`should handle ${scenario.name}`, () => {
      const middleware = middlewareFactory(scenario.config);
      const result = middleware(scenario.request);

      if (scenario.customAssertions) {
        scenario.customAssertions(result, scenario.request);
      } else {
        expect(result).toStrictEqual(scenario.expectedResult);
      }
    });
  });
}

/**
 * Pattern for testing locale detection from various sources
 */
export function testLocaleDetection(
  detectionFn: (source: any) => Locale,
  testCases: Array<{
    name: string;
    source: any;
    expected: Locale;
    fallback?: Locale;
  }>,
) {
  testCases.forEach(testCase => {
    test(`should detect ${testCase.expected} locale from ${testCase.name}`, () => {
      const result = detectionFn(testCase.source);
      expect(result).toBe(testCase.expected);
    });
  });
}

// ============================================================================
// MOCK CREATION PATTERNS
// ============================================================================

/**
 * Creates a standardized mock request for middleware testing
 */
export function createMockRequest(
  overrides: {
    acceptLanguage?: string;
    pathname?: string;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
  } = {},
) {
  return {
    headers: {
      'accept-language': overrides.acceptLanguage || 'en-US,en;q=0.9',
      ...overrides.headers,
    },
    cookies: overrides.cookies || {},
    nextUrl: {
      pathname: overrides.pathname || '/',
      search: '',
      hash: '',
    },
    method: 'GET',
    url: `https://example.com${overrides.pathname || '/'}`,
  };
}

/**
 * Creates a standardized mock dictionary
 */
export function createMockDictionary(
  locale: Locale = 'en',
  overrides: Partial<Dictionary> = {},
): Dictionary {
  const baseDictionaries = {
    en: {
      common: { hello: 'Hello', goodbye: 'Goodbye' },
      navigation: { home: 'Home', about: 'About' },
      forms: { submit: 'Submit', cancel: 'Cancel' },
    },
    fr: {
      common: { hello: 'Bonjour', goodbye: 'Au revoir' },
      navigation: { home: 'Accueil', about: 'À propos' },
      forms: { submit: 'Soumettre', cancel: 'Annuler' },
    },
    es: {
      common: { hello: 'Hola', goodbye: 'Adiós' },
      navigation: { home: 'Inicio', about: 'Acerca de' },
      forms: { submit: 'Enviar', cancel: 'Cancelar' },
    },
    pt: {
      common: { hello: 'Olá', goodbye: 'Tchau' },
      navigation: { home: 'Início', about: 'Sobre' },
      forms: { submit: 'Enviar', cancel: 'Cancelar' },
    },
    de: {
      common: { hello: 'Hallo', goodbye: 'Auf Wiedersehen' },
      navigation: { home: 'Startseite', about: 'Über uns' },
      forms: { submit: 'Absenden', cancel: 'Abbrechen' },
    },
  };

  return {
    ...(baseDictionaries as any)[locale],
    ...overrides,
  };
}

/**
 * Creates a mock i18n configuration
 */
export function createMockI18nConfig(overrides: any = {}) {
  return {
    locales: ['en', 'fr', 'es', 'pt', 'de'],
    defaultLocale: 'en',
    fallbackLocale: 'en',
    cookieName: 'locale',
    headerName: 'x-locale',
    ...overrides,
  };
}

// ============================================================================
// VALIDATION PATTERNS
// ============================================================================

/**
 * Validates that a locale is supported
 */
export function validateLocale(
  locale: string,
  supportedLocales: Locale[] = ['en', 'fr', 'es', 'pt', 'de'],
) {
  expect(supportedLocales).toContain(locale);
}

/**
 * Validates dictionary structure
 */
export function validateDictionary(dictionary: any) {
  expect(dictionary).toBeDefined();
  expect(typeof dictionary).toBe('object');
  expect(dictionary).not.toBeNull();
  expect(Array.isArray(dictionary)).toBeFalsy();
  expect(Object.keys(dictionary).length).toBeGreaterThan(0);
}

/**
 * Validates that a dictionary has required translation keys
 */
export function validateTranslationKeys(dictionary: Dictionary, requiredKeys: string[]) {
  requiredKeys.forEach(key => {
    const keys = key.split('.');
    let current = dictionary;

    for (const k of keys) {
      expect(current).toHaveProperty(k);
      current = (current as any)[k];
    }

    expect(typeof current).toBe('string');
    expect((current as any).length).toBeGreaterThan(0);
  });
}

/**
 * Validates URL structure for i18n routing
 */
export function validateI18nUrl(url: string, locale: Locale) {
  if (locale === 'en') {
    // English might not have locale prefix
    expect(url).toMatch(/^\/(?!(?:en|fr|es|pt|de)\/)/);
  } else {
    expect(url).toMatch(new RegExp(`^/${locale}/`));
  }
}

/**
 * Validates Accept-Language header format
 */
export function validateAcceptLanguageHeader(header: string) {
  // Should match format like "en-US,en;q=0.9,fr;q=0.8"
  const acceptLanguagePattern =
    /^[a-z]{2}(?:-[A-Z]{2})?(?:;q=\d\.\d)?(?:,[a-z]{2}(?:-[A-Z]{2})?(?:;q=\d\.\d)?)*$/;
  expect(header).toMatch(acceptLanguagePattern);
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Asserts that a component renders with correct locale-specific text
 */
export function assertLocaleSpecificText(
  container: HTMLElement,
  expectedTexts: Record<Locale, string>,
  currentLocale: Locale,
) {
  const expectedText = expectedTexts[currentLocale];
  expect(container).toHaveTextContent(new RegExp(expectedText) as any);
}

/**
 * Asserts that middleware response contains correct locale information
 */
export function assertMiddlewareResponse(
  response: any,
  expectedLocale: Locale,
  expectedRedirect?: string,
) {
  if (expectedRedirect) {
    expect(response.status).toBe(307);
    expect(response.headers.get('Location')).toBe(expectedRedirect);
  } else {
    expect(response.status).toBe(200);
  }

  // Check for locale in response headers or cookies
  if (response.headers) {
    const localeHeader = response.headers.get('x-locale');
    if (localeHeader) {
      expect(localeHeader).toBe(expectedLocale);
    }
  }
}

/**
 * Asserts that error handling provides proper fallbacks
 */
export function assertErrorFallback(
  errorHandler: () => any,
  expectedFallback: any,
  expectedErrorType?: string,
) {
  const result = errorHandler();

  if (expectedErrorType) {
    expect(result).toBeInstanceOf(Error);
    expect(result.message).toContain(expectedErrorType);
  } else {
    expect(result).toStrictEqual(expectedFallback);
  }
}

// ============================================================================
// PERFORMANCE TESTING PATTERNS
// ============================================================================

/**
 * Measures and validates i18n operation performance
 */
export function measureI18nPerformance<T>(
  operation: () => T,
  maxDuration: number = 10, // 10ms default
  iterations: number = 100,
): { result: T; averageTime: number; totalTime: number } {
  const start = performance.now();
  let result!: T;

  for (let i = 0; i < iterations; i++) {
    result = operation();
  }

  const end = performance.now();
  const totalTime = end - start;
  const averageTime = totalTime / iterations;

  expect(averageTime).toBeLessThan(maxDuration);

  return { result, averageTime, totalTime };
}

/**
 * Tests dictionary loading performance
 */
export function testDictionaryPerformance(
  dictionaryLoader: (locale: Locale) => Dictionary,
  maxLoadTime: number = 5, // 5ms default
  locales: Locale[] = ['en', 'fr', 'es', 'pt', 'de'],
) {
  locales.forEach(locale => {
    test(`should load ${locale} dictionary quickly`, () => {
      const { averageTime } = measureI18nPerformance(
        () => dictionaryLoader(locale),
        maxLoadTime,
        50, // Lower iterations for file loading
      );

      expect(averageTime).toBeLessThan(maxLoadTime);
    });
  });
}

// ============================================================================
// ERROR SCENARIO GENERATORS
// ============================================================================

/**
 * Generates common error scenarios for i18n testing
 */
export function generateI18nErrorScenarios() {
  return [
    {
      name: 'missing dictionary file',
      setup: () => {
        // Mock file not found
        vi.mocked(require).mockImplementation(() => {
          throw new Error('Module not found');
        });
      },
      expectedError: 'Module not found',
      expectedFallback: 'en',
    },
    {
      name: 'malformed dictionary JSON',
      setup: () => {
        // Mock invalid JSON
        vi.mocked(require).mockImplementation(() => {
          throw new SyntaxError('Unexpected token in JSON');
        });
      },
      expectedError: 'Unexpected token in JSON',
      expectedFallback: {},
    },
    {
      name: 'unsupported locale',
      setup: () => {
        // No setup needed
      },
      operation: (locale: string) => {
        if (!['en', 'fr', 'es', 'pt', 'de'].includes(locale)) {
          return 'en'; // Fallback to English
        }
        return locale;
      },
      expectedFallback: 'en',
    },
    {
      name: 'empty Accept-Language header',
      setup: () => {
        // Mock empty header
      },
      operation: (header: string) => {
        return header || 'en'; // Fallback to English
      },
      expectedFallback: 'en',
    },
  ];
}

// ============================================================================
// BULK TESTING UTILITIES
// ============================================================================

/**
 * Tests multiple locales with the same operation
 */
export function testLocalesBulk<T>(
  operation: (locale: Locale) => T,
  assertion: (result: T, locale: Locale) => void,
  locales: Locale[] = ['en', 'fr', 'es', 'pt', 'de'],
) {
  const results = locales.map(locale => ({
    locale,
    result: operation(locale),
  }));

  results.forEach(({ locale, result }) => {
    assertion(result, locale);
  });

  return results;
}

/**
 * Tests dictionary consistency across all locales
 */
export function testDictionaryConsistency(
  dictionaryProvider: (locale: Locale) => Dictionary,
  requiredKeys: string[],
  locales: Locale[] = ['en', 'fr', 'es', 'pt', 'de'],
) {
  const dictionaries = locales.map(locale => ({
    locale,
    dictionary: dictionaryProvider(locale),
  }));

  // Check that all dictionaries have the same structure
  dictionaries.forEach(({ locale, dictionary }) => {
    validateTranslationKeys(dictionary, requiredKeys);
  });

  return dictionaries;
}

// ============================================================================
// COMPONENT TESTING PATTERNS
// ============================================================================

/**
 * Tests component rendering across different locales
 */
export function testComponentI18n(
  renderComponent: (locale: Locale) => HTMLElement,
  expectedTexts: Record<Locale, string>,
  locales: Locale[] = ['en', 'fr', 'es', 'pt', 'de'],
) {
  locales.forEach(locale => {
    test(`should render correctly in ${locale}`, () => {
      const container = renderComponent(locale);
      assertLocaleSpecificText(container, expectedTexts, locale);
    });
  });
}

/**
 * Tests that links are properly localized
 */
export function testLocalizedLinks(
  linkProvider: (locale: Locale, href: string) => string,
  testUrls: string[],
  locales: Locale[] = ['en', 'fr', 'es', 'pt', 'de'],
) {
  locales.forEach(locale => {
    testUrls.forEach(url => {
      test(`should localize ${url} for ${locale}`, () => {
        const localizedUrl = linkProvider(locale, url);
        validateI18nUrl(localizedUrl, locale);
      });
    });
  });
}
