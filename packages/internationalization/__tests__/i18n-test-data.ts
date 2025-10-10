/**
 * Centralized I18n Test Data Generators
 *
 * Provides consistent test data generation across internationalization test suites.
 * Reduces duplication and ensures realistic test scenarios.
 */

import type { Dictionary, Locale } from "../../src/shared/dictionary-loader";

// ================================================================================================
// COMMON TEST DATA PATTERNS
// ================================================================================================

const testPatterns = {
  // Supported locales
  locales: ["en", "fr", "es", "pt", "de"] as const,

  // Locale formats
  localeFormats: [
    "en",
    "en-US",
    "en-GB",
    "fr",
    "fr-FR",
    "fr-CA",
    "es",
    "es-ES",
    "es-MX",
    "pt",
    "pt-BR",
    "pt-PT",
    "de",
    "de-DE",
    "de-AT",
  ],

  // Invalid locales
  invalidLocales: [
    "invalid",
    "xx",
    "en-XX",
    "fr-XX",
    "",
    null,
    undefined,
    123,
    {},
    [],
  ],

  // Accept-Language headers
  acceptLanguageHeaders: [
    "en-US,en;q=0.9",
    "fr-FR,fr;q=0.9,en;q=0.8",
    "es-ES,es;q=0.9,en;q=0.8",
    "pt-BR,pt;q=0.9,en;q=0.8",
    "de-DE,de;q=0.9,en;q=0.8",
    "zh-CN,zh;q=0.9,en;q=0.8", // Unsupported
    "ja-JP,ja;q=0.9,en;q=0.8", // Unsupported
    "ru-RU,ru;q=0.9,en;q=0.8", // Unsupported
    "",
    "invalid-header",
    "*",
  ],

  // URL patterns
  urlPatterns: [
    "/",
    "/about",
    "/contact",
    "/products",
    "/services",
    "/en/about",
    "/fr/about",
    "/es/about",
    "/pt/about",
    "/de/about",
    "/api/data",
    "/static/images/logo.png",
    "/_next/static/chunks/main.js",
  ],

  // Dictionary keys
  dictionaryKeys: [
    "common.hello",
    "common.goodbye",
    "common.welcome",
    "common.loading",
    "common.error",
    "common.success",
    "navigation.home",
    "navigation.about",
    "navigation.contact",
    "navigation.products",
    "navigation.services",
    "forms.submit",
    "forms.cancel",
    "forms.save",
    "forms.delete",
    "forms.edit",
    "invalid.key",
    "missing.nested.key",
    "",
    "common.",
    ".hello",
  ],

  // Translation placeholders
  translationPlaceholders: [
    "Hello {{name}}",
    "Welcome {{name}} to {{site}}",
    "You have {{count}} message",
    "You have {{count}} messages",
    "Price: {{price, currency}}",
    "Date: {{date, date}}",
    "Time: {{time, time}}",
    "Hello {{name, capitalize}}",
    "Complex {{nested.value}} interpolation",
    "Missing {{placeholder}}",
  ],

  // Error messages
  errorMessages: [
    "Dictionary file not found",
    "Failed to load dictionary",
    "Invalid locale code",
    "Malformed dictionary data",
    "Network error",
    "Permission denied",
    "File system error",
    "JSON parse error",
    "Module not found",
    "Import failed",
  ],
};

// ================================================================================================
// REALISTIC TEST DATA
// ================================================================================================

/**
 * Realistic dictionary test data
 */
const dictionaryTestData = {
  // Complete dictionary structures
  dictionaries: {
    en: {
      common: {
        hello: "Hello",
        goodbye: "Goodbye",
        welcome: "Welcome",
        loading: "Loading...",
        error: "Error",
        success: "Success",
        yes: "Yes",
        no: "No",
        ok: "OK",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        create: "Create",
        update: "Update",
        search: "Search",
        filter: "Filter",
        sort: "Sort",
        reset: "Reset",
        submit: "Submit",
        close: "Close",
        open: "Open",
        next: "Next",
        previous: "Previous",
        first: "First",
        last: "Last",
      },
      navigation: {
        home: "Home",
        about: "About",
        contact: "Contact",
        products: "Products",
        services: "Services",
        blog: "Blog",
        help: "Help",
        support: "Support",
        faq: "FAQ",
        terms: "Terms",
        privacy: "Privacy",
        sitemap: "Sitemap",
      },
      forms: {
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email",
        phone: "Phone",
        address: "Address",
        city: "City",
        state: "State",
        country: "Country",
        zipCode: "ZIP Code",
        message: "Message",
        subject: "Subject",
        category: "Category",
        priority: "Priority",
        status: "Status",
        date: "Date",
        time: "Time",
        quantity: "Quantity",
        price: "Price",
        total: "Total",
      },
      errors: {
        required: "This field is required",
        invalid: "Invalid value",
        tooShort: "Too short",
        tooLong: "Too long",
        invalidEmail: "Invalid email address",
        invalidPhone: "Invalid phone number",
        invalidUrl: "Invalid URL",
        invalidDate: "Invalid date",
        invalidTime: "Invalid time",
        invalidNumber: "Invalid number",
        notFound: "Not found",
        unauthorized: "Unauthorized",
        forbidden: "Forbidden",
        serverError: "Server error",
        networkError: "Network error",
      },
    },
    fr: {
      common: {
        hello: "Bonjour",
        goodbye: "Au revoir",
        welcome: "Bienvenue",
        loading: "Chargement...",
        error: "Erreur",
        success: "Succès",
        yes: "Oui",
        no: "Non",
        ok: "OK",
        cancel: "Annuler",
        save: "Enregistrer",
        delete: "Supprimer",
        edit: "Modifier",
        create: "Créer",
        update: "Mettre à jour",
        search: "Rechercher",
        filter: "Filtrer",
        sort: "Trier",
        reset: "Réinitialiser",
        submit: "Soumettre",
        close: "Fermer",
        open: "Ouvrir",
        next: "Suivant",
        previous: "Précédent",
        first: "Premier",
        last: "Dernier",
      },
      navigation: {
        home: "Accueil",
        about: "À propos",
        contact: "Contact",
        products: "Produits",
        services: "Services",
        blog: "Blog",
        help: "Aide",
        support: "Support",
        faq: "FAQ",
        terms: "Conditions",
        privacy: "Confidentialité",
        sitemap: "Plan du site",
      },
      forms: {
        firstName: "Prénom",
        lastName: "Nom",
        email: "E-mail",
        phone: "Téléphone",
        address: "Adresse",
        city: "Ville",
        state: "État",
        country: "Pays",
        zipCode: "Code postal",
        message: "Message",
        subject: "Sujet",
        category: "Catégorie",
        priority: "Priorité",
        status: "Statut",
        date: "Date",
        time: "Heure",
        quantity: "Quantité",
        price: "Prix",
        total: "Total",
      },
      errors: {
        required: "Ce champ est obligatoire",
        invalid: "Valeur invalide",
        tooShort: "Trop court",
        tooLong: "Trop long",
        invalidEmail: "Adresse e-mail invalide",
        invalidPhone: "Numéro de téléphone invalide",
        invalidUrl: "URL invalide",
        invalidDate: "Date invalide",
        invalidTime: "Heure invalide",
        invalidNumber: "Numéro invalide",
        notFound: "Introuvable",
        unauthorized: "Non autorisé",
        forbidden: "Interdit",
        serverError: "Erreur serveur",
        networkError: "Erreur réseau",
      },
    },
  },

  // Partial dictionaries for testing merging
  partialDictionaries: {
    en: {
      custom: {
        brandName: "Our Brand",
        tagline: "Excellence in Everything",
        copyright: "© 2024 Our Company",
      },
    },
    fr: {
      custom: {
        brandName: "Notre Marque",
        tagline: "Excellence en Tout",
        copyright: "© 2024 Notre Entreprise",
      },
    },
  },

  // Incomplete dictionaries for testing fallbacks
  incompleteDictionaries: {
    en: {
      common: {
        hello: "Hello",
        goodbye: "Goodbye",
      },
    },
    fr: {
      common: {
        hello: "Bonjour",
        // Missing goodbye
      },
    },
  },

  // Large dictionaries for performance testing
  largeDictionaries: {
    en: Array.from({ length: 1000 }, (_, i) => [
      `key${i}`,
      `Value ${i}`,
    ]).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
    fr: Array.from({ length: 1000 }, (_, i) => [
      `key${i}`,
      `Valeur ${i}`,
    ]).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
  },
};

/**
 * Middleware test data
 */
const middlewareTestData = {
  // Request scenarios
  requests: [
    {
      name: "English user from US",
      headers: { "accept-language": "en-US,en;q=0.9" },
      url: "https://example.com/",
      expectedLocale: "en",
    },
    {
      name: "French user from France",
      headers: { "accept-language": "fr-FR,fr;q=0.9,en;q=0.8" },
      url: "https://example.com/",
      expectedLocale: "fr",
    },
    {
      name: "Spanish user from Spain",
      headers: { "accept-language": "es-ES,es;q=0.9,en;q=0.8" },
      url: "https://example.com/",
      expectedLocale: "es",
    },
    {
      name: "Portuguese user from Brazil",
      headers: { "accept-language": "pt-BR,pt;q=0.9,en;q=0.8" },
      url: "https://example.com/",
      expectedLocale: "pt",
    },
    {
      name: "German user from Germany",
      headers: { "accept-language": "de-DE,de;q=0.9,en;q=0.8" },
      url: "https://example.com/",
      expectedLocale: "de",
    },
    {
      name: "Chinese user (unsupported)",
      headers: { "accept-language": "zh-CN,zh;q=0.9,en;q=0.8" },
      url: "https://example.com/",
      expectedLocale: "en", // Fallback
    },
    {
      name: "User with no language preference",
      headers: {},
      url: "https://example.com/",
      expectedLocale: "en", // Default
    },
    {
      name: "User with invalid language header",
      headers: { "accept-language": "invalid-header" },
      url: "https://example.com/",
      expectedLocale: "en", // Fallback
    },
  ],

  // Configuration scenarios
  configurations: [
    {
      name: "Default configuration",
      config: {
        locales: ["en", "fr", "es", "pt", "de"],
        defaultLocale: "en",
      },
    },
    {
      name: "Minimal configuration",
      config: {
        locales: ["en"],
        defaultLocale: "en",
      },
    },
    {
      name: "Extended configuration",
      config: {
        locales: ["en", "fr", "es", "pt", "de", "it", "ru"],
        defaultLocale: "en",
        fallbackLocale: "en",
        cookieName: "locale",
        headerName: "x-locale",
      },
    },
  ],

  // Edge cases
  edgeCases: [
    {
      name: "Empty Accept-Language header",
      headers: { "accept-language": "" },
      expectedLocale: "en",
    },
    {
      name: "Malformed Accept-Language header",
      headers: { "accept-language": "en-US;q=invalid" },
      expectedLocale: "en",
    },
    {
      name: "Multiple quality values",
      headers: { "accept-language": "fr;q=0.9,en;q=0.8,de;q=0.7" },
      expectedLocale: "fr",
    },
    {
      name: "Wildcard language",
      headers: { "accept-language": "*" },
      expectedLocale: "en",
    },
  ],
};

/**
 * Component test data
 */
const componentTestData = {
  // Link component scenarios
  links: [
    {
      name: "Simple link",
      props: { href: "/about", children: "About" },
      locale: "en",
      expectedHref: "/en/about",
      expectedText: "About",
    },
    {
      name: "Link with French locale",
      props: { href: "/about", children: "À propos" },
      locale: "fr",
      expectedHref: "/fr/about",
      expectedText: "À propos",
    },
    {
      name: "External link",
      props: { href: "https://example.com", children: "External" },
      locale: "en",
      expectedHref: "https://example.com",
      expectedText: "External",
    },
    {
      name: "Link with query parameters",
      props: { href: "/search?q=test", children: "Search" },
      locale: "en",
      expectedHref: "/en/search?q=test",
      expectedText: "Search",
    },
    {
      name: "Link with fragment",
      props: { href: "/page#section", children: "Section" },
      locale: "en",
      expectedHref: "/en/page#section",
      expectedText: "Section",
    },
  ],

  // I18n provider scenarios
  providers: [
    {
      name: "Default provider",
      props: { locale: "en" },
      expectedLocale: "en",
    },
    {
      name: "French provider",
      props: { locale: "fr" },
      expectedLocale: "fr",
    },
    {
      name: "Provider with custom dictionary",
      props: { locale: "en", dictionary: { custom: { hello: "Hi" } } },
      expectedLocale: "en",
      expectedDictionary: { custom: { hello: "Hi" } },
    },
  ],
};

/**
 * Utility test data
 */
const utilityTestData = {
  // Dictionary extension scenarios
  extension: [
    {
      name: "Simple extension",
      base: { common: { hello: "Hello" } },
      extension: { common: { goodbye: "Goodbye" } },
      expected: { common: { hello: "Hello", goodbye: "Goodbye" } },
    },
    {
      name: "Nested extension",
      base: { common: { greetings: { hello: "Hello" } } },
      extension: { common: { greetings: { goodbye: "Goodbye" } } },
      expected: {
        common: { greetings: { hello: "Hello", goodbye: "Goodbye" } },
      },
    },
    {
      name: "Override values",
      base: { common: { hello: "Hello" } },
      extension: { common: { hello: "Hi" } },
      expected: { common: { hello: "Hi" } },
    },
    {
      name: "Empty extension",
      base: { common: { hello: "Hello" } },
      extension: {},
      expected: { common: { hello: "Hello" } },
    },
    {
      name: "Empty base",
      base: {},
      extension: { common: { hello: "Hello" } },
      expected: { common: { hello: "Hello" } },
    },
  ],

  // Locale normalization scenarios
  normalization: [
    {
      name: "Basic locale",
      input: "en",
      expected: "en",
    },
    {
      name: "Locale with country",
      input: "en-US",
      expected: "en-US",
    },
    {
      name: "Lowercase conversion",
      input: "EN-US",
      expected: "en-US",
    },
    {
      name: "Underscore to dash",
      input: "en_US",
      expected: "en-US",
    },
    {
      name: "Invalid locale",
      input: "invalid",
      expected: "en", // Fallback
    },
    {
      name: "Empty locale",
      input: "",
      expected: "en", // Fallback
    },
  ],
};

/**
 * Edge case test data
 */
const edgeCaseTestData = {
  // Special characters in translations
  specialCharacters: [
    'Hello "World"',
    "Hello 'World'",
    "Hello <World>",
    "Hello & World",
    "Hello\n World",
    "Hello \t World",
    "Hello \\ World",
    "Hello / World",
    "Hello | World",
    "Hello @ World",
    "Hello # World",
    "Hello % World",
    "Hello ^ World",
    "Hello * World",
    "Hello + World",
    "Hello = World",
    "Hello ? World",
    "Hello ! World",
    "Hello ~ World",
    "Hello ` World",
    "Hello € World",
    "Hello £ World",
    "Hello ¥ World",
    "Hello © World",
    "Hello ® World",
    "Hello ™ World",
  ],

  // Unicode and international characters
  unicode: [
    "café",
    "naïve",
    "résumé",
    "Beijing 北京",
    "Tokyo 東京",
    "Moscow Москва",
    "Paris 🇫🇷",
    "emoji test 🎉🚀⭐",
    "Arabic العربية",
    "Chinese 中文",
    "Japanese 日本語",
    "Korean 한국어",
    "Russian Русский",
    "Thai ไทย",
    "Hebrew עברית",
    "Hindi हिन्दी",
    "Greek Ελληνικά",
    "Turkish Türkçe",
    "Vietnamese Tiếng Việt",
  ],

  // Large values
  largeValues: [
    "a".repeat(1000),
    "a".repeat(10000),
    "a".repeat(100000),
    Array.from({ length: 1000 }, (_, i) => `word${i}`).join(" "),
    Array.from({ length: 100 }, (_, i) => `sentence${i}.`).join(" "),
  ],

  // Empty and null values
  emptyValues: ["", null, undefined, {}, [], 0, false, NaN],
};

/**
 * Performance test data
 */
const performanceTestData = {
  // Large dictionary loading
  largeDictionaries: {
    small: Array.from({ length: 100 }, (_, i) => [
      `key${i}`,
      `value${i}`,
    ]).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
    medium: Array.from({ length: 1000 }, (_, i) => [
      `key${i}`,
      `value${i}`,
    ]).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
    large: Array.from({ length: 10000 }, (_, i) => [
      `key${i}`,
      `value${i}`,
    ]).reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {}),
  },

  // Concurrent operations
  concurrentOperations: {
    locales: ["en", "fr", "es", "pt", "de"],
    iterations: [1, 10, 100, 1000],
    batchSizes: [1, 5, 10, 50, 100],
  },

  // Memory usage patterns
  memoryPatterns: {
    smallObjects: Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      value: `value${i}`,
    })),
    largeObjects: Array.from({ length: 100 }, (_, i) => ({
      id: i,
      data: Array.from({ length: 100 }, (_, j) => `data${i}-${j}`),
    })),
  },
};

/**
 * Creates test data with specific patterns
 */
export const createTestData = {
  /**
   * Creates a dictionary with specific characteristics
   */
  dictionary: (locale: Locale = "en", overrides: Partial<Dictionary> = {}) => ({
    ...dictionaryTestData.dictionaries[locale],
    ...overrides,
  }),

  /**
   * Creates a middleware request with specific characteristics
   */
  middlewareRequest: (overrides: any = {}) => ({
    headers: {
      "accept-language": "en-US,en;q=0.9",
      ...overrides.headers,
    },
    nextUrl: {
      pathname: "/",
      ...overrides.nextUrl,
    },
    ...overrides,
  }),

  /**
   * Creates a component props object with specific characteristics
   */
  componentProps: (overrides: any = {}) => ({
    locale: "en",
    dictionary: dictionaryTestData.dictionaries.en,
    ...overrides,
  }),

  /**
   * Creates error scenarios
   */
  errorScenario: (type: string, message: string) => ({
    type,
    message,
    timestamp: new Date().toISOString(),
    stack: new Error().stack,
  }),

  /**
   * Creates performance test data
   */
  performanceData: (size: "small" | "medium" | "large" = "small") => ({
    dictionary: performanceTestData.largeDictionaries[size],
    operations: performanceTestData.concurrentOperations.iterations[0],
    startTime: performance.now(),
  }),
};
