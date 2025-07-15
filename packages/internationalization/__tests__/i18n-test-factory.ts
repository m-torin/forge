/**
 * Internationalization Test Factory
 *
 * Centralized factory for creating consistent i18n tests, reducing repetitive patterns.
 * This factory provides common test scenarios and data generators for internationalization.
 */

import type { Locale } from '#/shared/dictionary-loader';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, test, vi } from 'vitest';

// ================================================================================================
// CENTRALIZED MOCK SYSTEM
// ================================================================================================

/**
 * Centralized mock factories for consistent i18n testing
 */
export const mockFactories = {
  createDictionaryMocks: () => ({
    'en.json': {
      common: {
        hello: 'Hello',
        goodbye: 'Goodbye',
        welcome: 'Welcome',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
      },
      navigation: {
        home: 'Home',
        about: 'About',
        contact: 'Contact',
        products: 'Products',
        services: 'Services',
      },
      forms: {
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
      },
    },
    'fr.json': {
      common: {
        hello: 'Bonjour',
        goodbye: 'Au revoir',
        welcome: 'Bienvenue',
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
      },
      navigation: {
        home: 'Accueil',
        about: 'À propos',
        contact: 'Contact',
        products: 'Produits',
        services: 'Services',
      },
      forms: {
        submit: 'Soumettre',
        cancel: 'Annuler',
        save: 'Enregistrer',
        delete: 'Supprimer',
        edit: 'Modifier',
      },
    },
    'es.json': {
      common: {
        hello: 'Hola',
        goodbye: 'Adiós',
        welcome: 'Bienvenido',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
      },
      navigation: {
        home: 'Inicio',
        about: 'Acerca de',
        contact: 'Contacto',
        products: 'Productos',
        services: 'Servicios',
      },
      forms: {
        submit: 'Enviar',
        cancel: 'Cancelar',
        save: 'Guardar',
        delete: 'Eliminar',
        edit: 'Editar',
      },
    },
    'pt.json': {
      common: {
        hello: 'Olá',
        goodbye: 'Tchau',
        welcome: 'Bem-vindo',
        loading: 'Carregando...',
        error: 'Erro',
        success: 'Sucesso',
      },
      navigation: {
        home: 'Início',
        about: 'Sobre',
        contact: 'Contato',
        products: 'Produtos',
        services: 'Serviços',
      },
      forms: {
        submit: 'Enviar',
        cancel: 'Cancelar',
        save: 'Salvar',
        delete: 'Excluir',
        edit: 'Editar',
      },
    },
    'de.json': {
      common: {
        hello: 'Hallo',
        goodbye: 'Auf Wiedersehen',
        welcome: 'Willkommen',
        loading: 'Wird geladen...',
        error: 'Fehler',
        success: 'Erfolg',
      },
      navigation: {
        home: 'Startseite',
        about: 'Über uns',
        contact: 'Kontakt',
        products: 'Produkte',
        services: 'Dienstleistungen',
      },
      forms: {
        submit: 'Absenden',
        cancel: 'Abbrechen',
        save: 'Speichern',
        delete: 'Löschen',
        edit: 'Bearbeiten',
      },
    },
  }),

  createMiddlewareMocks: () => ({
    '@formatjs/intl-localematcher': {
      match: vi.fn((locales, supported) => supported[0] || 'en'),
    },
    negotiator: {
      default: vi.fn().mockImplementation(() => ({
        languages: vi.fn(() => ['en', 'fr']),
      })),
    },
    'next-international/middleware': {
      createI18nMiddleware: vi.fn(() => vi.fn()),
    },
  }),

  createNextJsMocks: () => ({
    'next/navigation': {
      useParams: vi.fn(() => ({ locale: 'en' })),
      usePathname: vi.fn(() => '/'),
      useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
      })),
    },
    'next/link': {
      default: vi.fn(({ children, href, ...props }) =>
        createElement('a', { href, ...props }, children),
      ),
    },
    'next/headers': {
      headers: vi.fn(() => ({
        get: vi.fn(() => 'en-US,en;q=0.9'),
      })),
    },
  }),

  createConfigurationMocks: () => ({
    'languine.json': {
      locale: {
        source: 'en',
        targets: ['fr', 'es', 'pt', 'de'],
      },
      ns: ['common', 'navigation', 'forms'],
      dictionary: 'locales',
    },
  }),
};

// ================================================================================================
// I18N TEST PATTERNS
// ================================================================================================

/**
 * Comprehensive DRY patterns for internationalization testing
 */
export const i18nTestPatterns = {
  /**
   * Test module exports with consistent patterns
   */
  testModuleExports: (
    moduleName: string,
    importPath: string,
    expectedExports: Array<{
      name: string;
      type: 'function' | 'object' | 'class' | 'constant';
      required?: boolean;
    }>,
  ) => {
    describe(`${moduleName} module exports`, () => {
      test('should export all expected items', async () => {
        const module = await import(importPath);

        expectedExports.forEach(exportItem => {
          if (exportItem.required !== false) {
            expect(module).toHaveProperty(exportItem.name);
            expect(module[exportItem.name]).toBeDefined();

            if (exportItem.type === 'function') {
              expect(typeof module[exportItem.name]).toBe('function');
            } else if (exportItem.type === 'object') {
              expect(typeof module[exportItem.name]).toBe('object');
            }
          }
        });
      });

      test('should not export unexpected items', async () => {
        const module = await import(importPath);
        const exportNames = Object.keys(module);
        const expectedNames = expectedExports.map(exp => exp.name);

        exportNames.forEach(name => {
          if (!expectedNames.includes(name)) {
            // Allow common JavaScript exports
            const allowedUnexpected = ['default', '__esModule'];
            expect(allowedUnexpected).toContain(name);
          }
        });
      });
    });
  },

  /**
   * Test dictionary functionality with multiple locales
   */
  testDictionaryOperations: (
    scenarios: Array<{
      name: string;
      locale: Locale;
      operation: string;
      operationArgs?: any[];
      setup?: () => void;
      expectedResult?: any;
      expectedType?: string;
      customAssertions?: (result: any) => void;
    }>,
  ) => {
    describe('dictionary operations', () => {
      scenarios.forEach(scenario => {
        test(`should ${scenario.name} for locale ${scenario.locale}`, async () => {
          if (scenario.setup) {
            scenario.setup();
          }

          const dictionaries = mockFactories.createDictionaryMocks();
          const mockGetDictionary = vi.fn((locale: string) => {
            return dictionaries[`${locale}.json`] || dictionaries['en.json'];
          });

          const result = mockGetDictionary(scenario.locale);

          if (scenario.expectedType) {
            expect(typeof result).toBe(scenario.expectedType);
          }

          if (scenario.expectedResult) {
            expect(result).toEqual(scenario.expectedResult);
          }

          if (scenario.customAssertions) {
            scenario.customAssertions(result);
          }
        });
      });
    });
  },

  /**
   * Test middleware with different configurations
   */
  testMiddlewarePatterns: (
    scenarios: Array<{
      name: string;
      middlewareConfig: any;
      requestData: {
        acceptLanguage?: string;
        pathname?: string;
        headers?: Record<string, string>;
      };
      expectedLocale: string;
      expectedBehavior: string;
      setup?: () => void;
      customAssertions?: (result: any) => void;
    }>,
  ) => {
    describe('middleware patterns', () => {
      scenarios.forEach(scenario => {
        test(`should ${scenario.expectedBehavior} when ${scenario.name}`, async () => {
          if (scenario.setup) {
            scenario.setup();
          }

          const mockMiddleware = vi.fn();
          const mockCreateMiddleware = vi.fn(() => mockMiddleware);

          const middleware = mockCreateMiddleware(scenario.middlewareConfig);

          const mockRequest = {
            headers: {
              'accept-language': scenario.requestData.acceptLanguage || 'en',
              ...scenario.requestData.headers,
            },
            nextUrl: {
              pathname: scenario.requestData.pathname || '/',
            },
          };

          expect(middleware).toBeDefined();
          expect(typeof middleware).toBe('function');
          expect(mockCreateMiddleware).toHaveBeenCalledWith(scenario.middlewareConfig);

          if (scenario.customAssertions) {
            scenario.customAssertions({ middleware, request: mockRequest });
          }
        });
      });
    });
  },

  /**
   * Test locale bulk operations
   */
  testLocaleBulkOperations: (
    scenarios: Array<{
      name: string;
      locales: Locale[];
      operation: (locale: Locale) => any;
      expectedResults: any[];
      assertion: (results: any[]) => void;
    }>,
  ) => {
    describe('locale bulk operations', () => {
      scenarios.forEach(scenario => {
        test(`should ${scenario.name}`, async () => {
          const results = scenario.locales.map(locale => scenario.operation(locale));

          expect(results).toHaveLength(scenario.expectedResults.length);
          scenario.assertion(results);
        });
      });
    });
  },

  /**
   * Test component internationalization
   */
  testComponentI18n: (
    scenarios: Array<{
      name: string;
      componentName: string;
      component: any;
      props: any;
      locale: Locale;
      expectedText?: string;
      expectedAttributes?: Record<string, any>;
      setup?: () => void;
      customAssertions?: (container: HTMLElement) => void;
    }>,
  ) => {
    describe('component internationalization', () => {
      scenarios.forEach(scenario => {
        test(`should ${scenario.name} in ${scenario.locale}`, () => {
          if (scenario.setup) {
            scenario.setup();
          }

          const mockUseParams = vi.fn(() => ({ locale: scenario.locale }));
          vi.mocked(
            mockFactories.createNextJsMocks()['next/navigation'].useParams,
          ).mockImplementation(mockUseParams);

          const { container } = render(createElement(scenario.component, scenario.props));

          if (scenario.expectedText) {
            expect(screen.getByText(scenario.expectedText)).toBeInTheDocument();
          }

          if (scenario.customAssertions) {
            scenario.customAssertions(container);
          }
        });
      });
    });
  },

  /**
   * Test utility functions
   */
  testUtilityFunctions: (
    scenarios: Array<{
      name: string;
      utilityName: string;
      testCases: Array<{
        description: string;
        input: any;
        expected: any;
        setup?: () => void;
        shouldThrow?: boolean;
        expectedError?: string;
      }>;
    }>,
  ) => {
    scenarios.forEach(scenario => {
      describe(`${scenario.name} utility`, () => {
        scenario.testCases.forEach(testCase => {
          test(`should ${testCase.description}`, () => {
            if (testCase.setup) {
              testCase.setup();
            }

            const mockUtility = vi.fn(input => {
              if (testCase.shouldThrow) {
                throw new Error(testCase.expectedError || 'Test error');
              }

              if (typeof input === 'object' && input !== null) {
                return { ...input, processed: true };
              }
              return input;
            });

            if (testCase.shouldThrow) {
              expect(() => mockUtility(testCase.input)).toThrow(testCase.expectedError);
            } else {
              const result = mockUtility(testCase.input);

              if (typeof testCase.expected === 'function') {
                expect(result).toEqual(testCase.expected(testCase.input));
              } else {
                expect(result).toEqual(testCase.expected);
              }
            }
          });
        });
      });
    });
  },

  /**
   * Test error handling patterns
   */
  testErrorHandling: (
    scenarios: Array<{
      name: string;
      errorType: string;
      setup: () => void;
      operation: () => any;
      expectedError?: string;
      expectedFallback?: any;
      customAssertions?: (error: any) => void;
    }>,
  ) => {
    describe('error handling', () => {
      scenarios.forEach(scenario => {
        test(`should handle ${scenario.errorType} gracefully`, () => {
          scenario.setup();

          if (scenario.expectedError) {
            expect(() => scenario.operation()).toThrow(scenario.expectedError);
          } else {
            const result = scenario.operation();

            if (scenario.expectedFallback) {
              expect(result).toEqual(scenario.expectedFallback);
            }

            if (scenario.customAssertions) {
              scenario.customAssertions(result);
            }
          }
        });
      });
    });
  },

  /**
   * Test performance patterns
   */
  testPerformance: (
    scenarios: Array<{
      name: string;
      operation: () => any;
      maxDuration: number;
      iterations?: number;
      setup?: () => void;
    }>,
  ) => {
    describe('performance', () => {
      scenarios.forEach(scenario => {
        test(`should ${scenario.name} efficiently`, async () => {
          if (scenario.setup) {
            scenario.setup();
          }

          const iterations = scenario.iterations || 1;
          const start = performance.now();

          for (let i = 0; i < iterations; i++) {
            scenario.operation();
          }

          const duration = performance.now() - start;
          expect(duration).toBeLessThan(scenario.maxDuration);
        });
      });
    });
  },
};

// ================================================================================================
// COMMON TEST SCENARIO GENERATORS
// ================================================================================================

/**
 * Common test scenario generators
 */
export const createScenarios = {
  /**
   * Creates scenarios for all supported locales
   */
  allLocales: (
    operation: (locale: Locale) => any,
    assertion: (locale: Locale, result: any) => void,
  ) => {
    const locales: Locale[] = ['en', 'fr', 'es', 'pt', 'de'];
    return locales.map(locale => ({
      name: `handle locale ${locale}`,
      locale,
      operation: 'test',
      customAssertions: (result: any) => assertion(locale, result),
    }));
  },

  /**
   * Creates middleware scenarios for common cases
   */
  middlewareCommon: () => [
    {
      name: 'request has English Accept-Language',
      middlewareConfig: {
        locales: ['en', 'fr', 'es', 'pt', 'de'],
        defaultLocale: 'en',
      },
      requestData: {
        acceptLanguage: 'en-US,en;q=0.9',
        pathname: '/',
      },
      expectedLocale: 'en',
      expectedBehavior: 'detect English locale',
    },
    {
      name: 'request has French Accept-Language',
      middlewareConfig: {
        locales: ['en', 'fr', 'es', 'pt', 'de'],
        defaultLocale: 'en',
      },
      requestData: {
        acceptLanguage: 'fr-FR,fr;q=0.9',
        pathname: '/',
      },
      expectedLocale: 'fr',
      expectedBehavior: 'detect French locale',
    },
    {
      name: 'request has unsupported Accept-Language',
      middlewareConfig: {
        locales: ['en', 'fr', 'es', 'pt', 'de'],
        defaultLocale: 'en',
      },
      requestData: {
        acceptLanguage: 'zh-CN,zh;q=0.9',
        pathname: '/',
      },
      expectedLocale: 'en',
      expectedBehavior: 'fallback to default locale',
    },
    {
      name: 'request has no Accept-Language',
      middlewareConfig: {
        locales: ['en', 'fr', 'es', 'pt', 'de'],
        defaultLocale: 'en',
      },
      requestData: {
        acceptLanguage: '',
        pathname: '/',
      },
      expectedLocale: 'en',
      expectedBehavior: 'use default locale',
    },
  ],

  /**
   * Creates error scenarios for common cases
   */
  errorCommon: () => [
    {
      name: 'missing dictionary file',
      errorType: 'missing dictionary',
      setup: () => {
        // Mock file not found
      },
      operation: () => {
        throw new Error('Dictionary file not found');
      },
      expectedError: 'Dictionary file not found',
    },
    {
      name: 'malformed dictionary data',
      errorType: 'malformed data',
      setup: () => {
        // Mock malformed data
      },
      operation: () => null,
      expectedFallback: null,
    },
    {
      name: 'invalid locale code',
      errorType: 'invalid locale',
      setup: () => {
        // Mock invalid locale
      },
      operation: () => 'en', // Fallback to English
      expectedFallback: 'en',
    },
  ],
};

/**
 * Creates mock implementations for testing
 */
export const createMockImplementations = {
  /**
   * Creates a mock dictionary loader
   */
  dictionaryLoader: (dictionaries = mockFactories.createDictionaryMocks()) => ({
    getLocales: vi.fn(() => ['en', 'fr', 'es', 'pt', 'de']),
    getDictionary: vi.fn((locale: string) => {
      return dictionaries[`${locale}.json`] || dictionaries['en.json'];
    }),
    isLocaleSupported: vi.fn((locale: string) => {
      return ['en', 'fr', 'es', 'pt', 'de'].includes(locale);
    }),
  }),

  /**
   * Creates a mock middleware
   */
  middleware: (config: any) => ({
    createMiddleware: vi.fn(() => vi.fn((request: any) => ({ status: 200 }))),
    detectLocale: vi.fn(() => 'en'),
    config,
  }),

  /**
   * Creates a mock i18n client
   */
  i18nClient: (locale: Locale = 'en') => ({
    t: vi.fn((key: string) => key),
    locale,
    changeLocale: vi.fn(),
    getLocale: vi.fn(() => locale),
    isReady: vi.fn(() => true),
  }),
};
