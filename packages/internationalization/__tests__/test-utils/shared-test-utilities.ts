/**
 * Shared test utilities for internationalization tests
 * Reduces code duplication and provides consistent test patterns
 */

import { render, screen } from "@testing-library/react";
import { expect, vi } from "vitest";
import type { Dictionary, Locale } from "../../src/shared/dictionary-loader";

// ============================================================================
// MOCK UTILITIES
// ============================================================================

/**
 * Creates consistent mock for dictionary loading
 */
export function createDictionaryLoaderMock() {
  return {
    getLocales: vi.fn(() => ["en", "fr", "es", "pt", "de"]),
    getDictionary: vi.fn((locale: string) => {
      const dictionaries = {
        en: { common: { hello: "Hello", goodbye: "Goodbye" } },
        fr: { common: { hello: "Bonjour", goodbye: "Au revoir" } },
        es: { common: { hello: "Hola", goodbye: "Adiós" } },
        pt: { common: { hello: "Olá", goodbye: "Tchau" } },
        de: { common: { hello: "Hallo", goodbye: "Auf Wiedersehen" } },
      };
      return (
        dictionaries[locale as keyof typeof dictionaries] || dictionaries.en
      );
    }),
    isLocaleSupported: vi.fn((locale: string) =>
      ["en", "fr", "es", "pt", "de"].includes(locale),
    ),
    normalizeDictionary: vi.fn((dict: any) => dict),
  };
}

/**
 * Creates consistent mock for middleware functionality
 */
export function createMiddlewareMock() {
  return {
    createI18nMiddleware: vi.fn((config: any) => {
      return vi.fn((request: any) => {
        const acceptLanguage = request.headers["accept-language"] || "en";
        const detectedLocale = acceptLanguage.split(",")[0].split("-")[0];
        const supportedLocales = config.locales || [
          "en",
          "fr",
          "es",
          "pt",
          "de",
        ];
        const locale = supportedLocales.includes(detectedLocale)
          ? detectedLocale
          : config.defaultLocale;

        return {
          status: 200,
          headers: { "x-locale": locale },
          locale,
        };
      });
    }),
    detectLocale: vi.fn(
      (acceptLanguage: string, supportedLocales: string[]) => {
        const detected = acceptLanguage.split(",")[0].split("-")[0];
        return supportedLocales.includes(detected) ? detected : "en";
      },
    ),
    parseAcceptLanguage: vi.fn((header: string) => {
      return header.split(",").map((lang) => ({
        code: lang.split(";")[0].trim(),
        quality: lang.includes("q=") ? parseFloat(lang.split("q=")[1]) : 1,
      }));
    }),
  };
}

/**
 * Creates consistent mock for Next.js navigation
 */
export function createNextNavigationMock() {
  return {
    useParams: vi.fn(() => ({ locale: "en" })),
    usePathname: vi.fn(() => "/"),
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    })),
    useSearchParams: vi.fn(() => ({
      get: vi.fn(),
      has: vi.fn(),
      toString: vi.fn(() => ""),
    })),
    redirect: vi.fn(),
    notFound: vi.fn(),
  };
}

/**
 * Standard mock setup for all i18n tests
 */
export function setupI18nMocks() {
  return {
    dictionaryLoader: createDictionaryLoaderMock(),
    middleware: createMiddlewareMock(),
    navigation: createNextNavigationMock(),
  };
}

// ============================================================================
// TEST DATA FACTORIES
// ============================================================================

/**
 * Creates base dictionary for testing
 */
export function createBaseDictionary(
  locale: Locale = "en",
  overrides: Partial<Dictionary> = {},
): Dictionary {
  const baseDictionaries = {
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
    es: {
      common: {
        hello: "Hola",
        goodbye: "Adiós",
        welcome: "Bienvenido",
        loading: "Cargando...",
        error: "Error",
        success: "Éxito",
        yes: "Sí",
        no: "No",
        ok: "OK",
        cancel: "Cancelar",
        save: "Guardar",
        delete: "Eliminar",
        edit: "Editar",
        create: "Crear",
        update: "Actualizar",
        search: "Buscar",
        filter: "Filtrar",
        sort: "Ordenar",
        reset: "Restablecer",
        submit: "Enviar",
        close: "Cerrar",
        open: "Abrir",
        next: "Siguiente",
        previous: "Anterior",
        first: "Primero",
        last: "Último",
      },
      navigation: {
        home: "Inicio",
        about: "Acerca de",
        contact: "Contacto",
        products: "Productos",
        services: "Servicios",
        blog: "Blog",
        help: "Ayuda",
        support: "Soporte",
        faq: "FAQ",
        terms: "Términos",
        privacy: "Privacidad",
        sitemap: "Mapa del sitio",
      },
      forms: {
        firstName: "Nombre",
        lastName: "Apellido",
        email: "Correo",
        phone: "Teléfono",
        address: "Dirección",
        city: "Ciudad",
        state: "Estado",
        country: "País",
        zipCode: "Código postal",
        message: "Mensaje",
        subject: "Asunto",
        category: "Categoría",
        priority: "Prioridad",
        status: "Estado",
        date: "Fecha",
        time: "Hora",
        quantity: "Cantidad",
        price: "Precio",
        total: "Total",
      },
      errors: {
        required: "Este campo es obligatorio",
        invalid: "Valor inválido",
        tooShort: "Demasiado corto",
        tooLong: "Demasiado largo",
        invalidEmail: "Correo electrónico inválido",
        invalidPhone: "Número de teléfono inválido",
        invalidUrl: "URL inválida",
        invalidDate: "Fecha inválida",
        invalidTime: "Hora inválida",
        invalidNumber: "Número inválido",
        notFound: "No encontrado",
        unauthorized: "No autorizado",
        forbidden: "Prohibido",
        serverError: "Error del servidor",
        networkError: "Error de red",
      },
    },
    pt: {
      common: {
        hello: "Olá",
        goodbye: "Tchau",
        welcome: "Bem-vindo",
        loading: "Carregando...",
        error: "Erro",
        success: "Sucesso",
        yes: "Sim",
        no: "Não",
        ok: "OK",
        cancel: "Cancelar",
        save: "Salvar",
        delete: "Excluir",
        edit: "Editar",
        create: "Criar",
        update: "Atualizar",
        search: "Pesquisar",
        filter: "Filtrar",
        sort: "Ordenar",
        reset: "Redefinir",
        submit: "Enviar",
        close: "Fechar",
        open: "Abrir",
        next: "Próximo",
        previous: "Anterior",
        first: "Primeiro",
        last: "Último",
      },
      navigation: {
        home: "Início",
        about: "Sobre",
        contact: "Contato",
        products: "Produtos",
        services: "Serviços",
        blog: "Blog",
        help: "Ajuda",
        support: "Suporte",
        faq: "FAQ",
        terms: "Termos",
        privacy: "Privacidade",
        sitemap: "Mapa do site",
      },
      forms: {
        firstName: "Nome",
        lastName: "Sobrenome",
        email: "E-mail",
        phone: "Telefone",
        address: "Endereço",
        city: "Cidade",
        state: "Estado",
        country: "País",
        zipCode: "CEP",
        message: "Mensagem",
        subject: "Assunto",
        category: "Categoria",
        priority: "Prioridade",
        status: "Status",
        date: "Data",
        time: "Hora",
        quantity: "Quantidade",
        price: "Preço",
        total: "Total",
      },
      errors: {
        required: "Este campo é obrigatório",
        invalid: "Valor inválido",
        tooShort: "Muito curto",
        tooLong: "Muito longo",
        invalidEmail: "Endereço de e-mail inválido",
        invalidPhone: "Número de telefone inválido",
        invalidUrl: "URL inválida",
        invalidDate: "Data inválida",
        invalidTime: "Hora inválida",
        invalidNumber: "Número inválido",
        notFound: "Não encontrado",
        unauthorized: "Não autorizado",
        forbidden: "Proibido",
        serverError: "Erro do servidor",
        networkError: "Erro de rede",
      },
    },
    de: {
      common: {
        hello: "Hallo",
        goodbye: "Auf Wiedersehen",
        welcome: "Willkommen",
        loading: "Wird geladen...",
        error: "Fehler",
        success: "Erfolg",
        yes: "Ja",
        no: "Nein",
        ok: "OK",
        cancel: "Abbrechen",
        save: "Speichern",
        delete: "Löschen",
        edit: "Bearbeiten",
        create: "Erstellen",
        update: "Aktualisieren",
        search: "Suchen",
        filter: "Filter",
        sort: "Sortieren",
        reset: "Zurücksetzen",
        submit: "Absenden",
        close: "Schließen",
        open: "Öffnen",
        next: "Weiter",
        previous: "Zurück",
        first: "Erste",
        last: "Letzte",
      },
      navigation: {
        home: "Startseite",
        about: "Über uns",
        contact: "Kontakt",
        products: "Produkte",
        services: "Dienstleistungen",
        blog: "Blog",
        help: "Hilfe",
        support: "Support",
        faq: "FAQ",
        terms: "Bedingungen",
        privacy: "Datenschutz",
        sitemap: "Sitemap",
      },
      forms: {
        firstName: "Vorname",
        lastName: "Nachname",
        email: "E-Mail",
        phone: "Telefon",
        address: "Adresse",
        city: "Stadt",
        state: "Bundesland",
        country: "Land",
        zipCode: "Postleitzahl",
        message: "Nachricht",
        subject: "Betreff",
        category: "Kategorie",
        priority: "Priorität",
        status: "Status",
        date: "Datum",
        time: "Zeit",
        quantity: "Menge",
        price: "Preis",
        total: "Gesamt",
      },
      errors: {
        required: "Dieses Feld ist erforderlich",
        invalid: "Ungültiger Wert",
        tooShort: "Zu kurz",
        tooLong: "Zu lang",
        invalidEmail: "Ungültige E-Mail-Adresse",
        invalidPhone: "Ungültige Telefonnummer",
        invalidUrl: "Ungültige URL",
        invalidDate: "Ungültiges Datum",
        invalidTime: "Ungültige Zeit",
        invalidNumber: "Ungültige Nummer",
        notFound: "Nicht gefunden",
        unauthorized: "Nicht autorisiert",
        forbidden: "Verboten",
        serverError: "Serverfehler",
        networkError: "Netzwerkfehler",
      },
    },
  };

  return {
    ...baseDictionaries[locale],
    ...overrides,
  };
}

/**
 * Creates middleware request for testing
 */
export function createMiddlewareRequest(
  overrides: {
    acceptLanguage?: string;
    pathname?: string;
    headers?: Record<string, string>;
    cookies?: Record<string, string>;
    method?: string;
    url?: string;
  } = {},
) {
  return {
    headers: {
      "accept-language": overrides.acceptLanguage || "en-US,en;q=0.9",
      "user-agent": "Mozilla/5.0 (compatible; test)",
      ...overrides.headers,
    },
    cookies: overrides.cookies || {},
    nextUrl: {
      pathname: overrides.pathname || "/",
      search: "",
      hash: "",
      origin: "https://example.com",
      href: `https://example.com${overrides.pathname || "/"}`,
    },
    method: overrides.method || "GET",
    url: overrides.url || `https://example.com${overrides.pathname || "/"}`,
    ip: "192.168.1.1",
    geo: {
      country: "US",
      region: "CA",
      city: "San Francisco",
    },
  };
}

/**
 * Creates i18n configuration for testing
 */
export function createI18nConfig(overrides: any = {}) {
  return {
    locales: ["en", "fr", "es", "pt", "de"],
    defaultLocale: "en",
    fallbackLocale: "en",
    cookieName: "locale",
    headerName: "x-locale",
    pathnames: {
      "/": "/",
      "/about": {
        en: "/about",
        fr: "/a-propos",
        es: "/acerca-de",
        pt: "/sobre",
        de: "/ueber-uns",
      },
      "/contact": {
        en: "/contact",
        fr: "/contact",
        es: "/contacto",
        pt: "/contato",
        de: "/kontakt",
      },
    },
    ...overrides,
  };
}

/**
 * Creates component props for testing
 */
export function createComponentProps(overrides: any = {}) {
  return {
    locale: "en",
    dictionary: createBaseDictionary("en"),
    className: "test-component",
    "data-testid": "i18n-component",
    ...overrides,
  };
}

// ============================================================================
// ASSERTION HELPERS
// ============================================================================

/**
 * Validates standard i18n component structure
 */
export function validateI18nComponent(
  renderResult: any,
  expectedLocale: Locale,
  expectedText: string,
  expectedTestId?: string,
) {
  if (expectedTestId) {
    expect(screen.getByTestId(expectedTestId)).toBeInTheDocument();
  }

  expect(screen.getByText(expectedText)).toBeInTheDocument();

  // Check if locale is properly set in the component
  const component = renderResult.container.querySelector("[data-locale]");
  if (component) {
    expect(component).toHaveAttribute("data-locale", expectedLocale);
  }
}

/**
 * Validates that dictionary contains required keys
 */
export function validateDictionaryKeys(
  dictionary: Dictionary,
  requiredKeys: string[],
) {
  requiredKeys.forEach((key) => {
    const keys = key.split(".");
    let current = dictionary;

    for (const k of keys) {
      expect(current).toHaveProperty(k);
      expect(current[k]).toBeDefined();
      current = current[k];
    }

    expect(typeof current).toBe("string");
    expect(current.length).toBeGreaterThan(0);
  });
}

/**
 * Validates locale consistency across dictionaries
 */
export function validateLocaleConsistency(
  dictionaries: Record<Locale, Dictionary>,
  referenceKeys: string[],
) {
  const locales = Object.keys(dictionaries) as Locale[];

  referenceKeys.forEach((key) => {
    locales.forEach((locale) => {
      const keys = key.split(".");
      let current = dictionaries[locale];

      for (const k of keys) {
        expect(current).toHaveProperty(k);
        current = current[k];
      }

      expect(typeof current).toBe("string");
      expect(current.length).toBeGreaterThan(0);
    });
  });
}

/**
 * Validates middleware response structure
 */
export function validateMiddlewareResponse(
  response: any,
  expectedStatus: number,
  expectedHeaders?: Record<string, string>,
) {
  expect(response.status).toBe(expectedStatus);

  if (expectedHeaders) {
    Object.entries(expectedHeaders).forEach(([key, value]) => {
      if (response.headers) {
        expect(response.headers[key] || response.headers.get?.(key)).toBe(
          value,
        );
      }
    });
  }
}

// ============================================================================
// TEST SCENARIO GENERATORS
// ============================================================================

/**
 * Generates test scenarios for all supported locales
 */
export function generateLocaleTestScenarios<T>(
  operation: (locale: Locale) => T,
  validation: (result: T, locale: Locale) => void,
  supportedLocales: Locale[] = ["en", "fr", "es", "pt", "de"],
) {
  return supportedLocales.map((locale) => ({
    name: `${locale} locale`,
    locale,
    test: () => {
      const result = operation(locale);
      validation(result, locale);
    },
  }));
}

/**
 * Generates test scenarios for middleware configurations
 */
export function generateMiddlewareTestScenarios() {
  return [
    {
      name: "English Accept-Language",
      request: createMiddlewareRequest({ acceptLanguage: "en-US,en;q=0.9" }),
      expectedLocale: "en",
    },
    {
      name: "French Accept-Language",
      request: createMiddlewareRequest({
        acceptLanguage: "fr-FR,fr;q=0.9,en;q=0.8",
      }),
      expectedLocale: "fr",
    },
    {
      name: "Spanish Accept-Language",
      request: createMiddlewareRequest({
        acceptLanguage: "es-ES,es;q=0.9,en;q=0.8",
      }),
      expectedLocale: "es",
    },
    {
      name: "Portuguese Accept-Language",
      request: createMiddlewareRequest({
        acceptLanguage: "pt-BR,pt;q=0.9,en;q=0.8",
      }),
      expectedLocale: "pt",
    },
    {
      name: "German Accept-Language",
      request: createMiddlewareRequest({
        acceptLanguage: "de-DE,de;q=0.9,en;q=0.8",
      }),
      expectedLocale: "de",
    },
    {
      name: "Unsupported Accept-Language",
      request: createMiddlewareRequest({ acceptLanguage: "zh-CN,zh;q=0.9" }),
      expectedLocale: "en", // Fallback
    },
    {
      name: "Empty Accept-Language",
      request: createMiddlewareRequest({ acceptLanguage: "" }),
      expectedLocale: "en", // Default
    },
    {
      name: "Malformed Accept-Language",
      request: createMiddlewareRequest({ acceptLanguage: "invalid-header" }),
      expectedLocale: "en", // Fallback
    },
  ];
}

/**
 * Generates error test scenarios for i18n operations
 */
export function generateI18nErrorScenarios() {
  return [
    {
      name: "Dictionary file not found",
      setup: () => {
        vi.mocked(require).mockImplementation(() => {
          throw new Error("ENOENT: no such file or directory");
        });
      },
      expectedError: "ENOENT",
      expectedFallback: {},
    },
    {
      name: "Invalid JSON in dictionary",
      setup: () => {
        vi.mocked(require).mockImplementation(() => {
          throw new SyntaxError("Unexpected token in JSON");
        });
      },
      expectedError: "Unexpected token",
      expectedFallback: {},
    },
    {
      name: "Network error loading dictionary",
      setup: () => {
        vi.mocked(fetch).mockRejectedValue(new Error("Network error"));
      },
      expectedError: "Network error",
      expectedFallback: {},
    },
    {
      name: "Invalid locale code",
      operation: (locale: string) => {
        const supportedLocales = ["en", "fr", "es", "pt", "de"];
        return supportedLocales.includes(locale) ? locale : "en";
      },
      expectedFallback: "en",
    },
  ];
}

// ============================================================================
// PERFORMANCE TEST HELPERS
// ============================================================================

/**
 * Measures execution time of i18n operations
 */
export async function measureI18nExecutionTime<T>(
  operation: () => T | Promise<T>,
  iterations: number = 1000,
): Promise<{ result: T; averageTime: number; totalTime: number }> {
  const start = performance.now();
  let result!: T;

  for (let i = 0; i < iterations; i++) {
    result = await operation();
  }

  const end = performance.now();
  const totalTime = end - start;
  const averageTime = totalTime / iterations;

  return {
    result,
    averageTime,
    totalTime,
  };
}

/**
 * Validates i18n performance benchmarks
 */
export function validateI18nPerformance(
  averageTime: number,
  maxAllowedTime: number = 5, // 5ms default for i18n operations
  operation: string = "i18n operation",
) {
  expect(averageTime).toBeLessThan(maxAllowedTime);

  if (averageTime > maxAllowedTime * 0.8) {
    console.warn(
      `Performance warning: ${operation} took ${averageTime.toFixed(2)}ms (threshold: ${maxAllowedTime}ms)`,
    );
  }
}

// ============================================================================
// COMPONENT TESTING UTILITIES
// ============================================================================

/**
 * Renders component with i18n context
 */
export function renderWithI18n(
  component: React.ReactElement,
  locale: Locale = "en",
  dictionary?: Dictionary,
) {
  const mockUseParams = vi.fn(() => ({ locale }));

  // Mock Next.js navigation hooks
  vi.mocked(vi.importActual("next/navigation")).mockImplementation(() => ({
    useParams: mockUseParams,
    usePathname: vi.fn(() => "/"),
    useRouter: vi.fn(() => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
    })),
  }));

  return render(component);
}

/**
 * Tests component across all locales
 */
export function testComponentAcrossLocales(
  componentFactory: (locale: Locale) => React.ReactElement,
  expectedTexts: Record<Locale, string>,
  supportedLocales: Locale[] = ["en", "fr", "es", "pt", "de"],
) {
  supportedLocales.forEach((locale) => {
    test(`should render correctly in ${locale}`, () => {
      const component = componentFactory(locale);
      const { container } = renderWithI18n(component, locale);

      const expectedText = expectedTexts[locale];
      expect(container).toHaveTextContent(new RegExp(expectedText));
    });
  });
}

/**
 * Creates test utilities for component testing
 */
export function createComponentTestUtils(defaultLocale: Locale = "en") {
  return {
    renderWithLocale: (
      component: React.ReactElement,
      locale: Locale = defaultLocale,
    ) => {
      return renderWithI18n(component, locale);
    },

    expectTranslation: (key: string, expectedText: string) => {
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    },

    expectLocaleAttribute: (element: HTMLElement, expectedLocale: Locale) => {
      expect(element).toHaveAttribute("data-locale", expectedLocale);
    },

    expectLocalizedUrl: (element: HTMLElement, expectedPattern: RegExp) => {
      const href = element.getAttribute("href");
      expect(href).toMatch(expectedPattern);
    },
  };
}
