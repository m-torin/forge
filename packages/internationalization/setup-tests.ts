import "@repo/testing/src/vitest/core/setup";
import { vi } from "vitest";

// Mock server-only
vi.mock("server-only", () => ({}));

// Mock dictionaries
vi.mock("./dictionaries/en.json", () => ({
  default: {
    web: {
      global: {
        primaryCta: "Book a call",
        secondaryCta: "Sign up",
      },
      header: {
        blog: "Blog",
        contact: "Contact",
        docs: "Docs",
        home: "Home",
        product: {
          description: "Managing a small business today is already tough.",
          pricing: "Pricing",
          title: "Product",
        },
        signIn: "Sign in",
        signUp: "Get started",
      },
    },
  },
}));

vi.mock("./dictionaries/es.json", () => ({
  default: {
    web: {
      global: {
        primaryCta: "Reservar una llamada",
        secondaryCta: "Registrarse",
      },
      header: {
        blog: "Blog",
        contact: "Contacto",
        docs: "Documentación",
        home: "Inicio",
        product: {
          description: "Administrar un pequeño negocio hoy ya es difícil.",
          pricing: "Precios",
          title: "Producto",
        },
        signIn: "Iniciar sesión",
        signUp: "Comenzar",
      },
    },
  },
}));

vi.mock("./dictionaries/de.json", () => ({
  default: {
    web: {
      global: {
        primaryCta: "Anruf buchen",
        secondaryCta: "Registrieren",
      },
      header: {
        blog: "Blog",
        contact: "Kontakt",
        docs: "Dokumentation",
        home: "Startseite",
        product: {
          description:
            "Die Verwaltung eines kleinen Unternehmens ist heute schon schwierig.",
          pricing: "Preise",
          title: "Produkt",
        },
        signIn: "Anmelden",
        signUp: "Loslegen",
      },
    },
  },
}));

vi.mock("./dictionaries/fr.json", () => ({
  default: {
    web: {
      global: {
        primaryCta: "Réserver un appel",
        secondaryCta: "S'inscrire",
      },
      header: {
        blog: "Blog",
        contact: "Contact",
        docs: "Documentation",
        home: "Accueil",
        product: {
          description:
            "Gérer une petite entreprise aujourd'hui est déjà difficile.",
          pricing: "Tarifs",
          title: "Produit",
        },
        signIn: "Se connecter",
        signUp: "Commencer",
      },
    },
  },
}));

vi.mock("./dictionaries/pt.json", () => ({
  default: {
    web: {
      global: {
        primaryCta: "Agendar uma chamada",
        secondaryCta: "Cadastrar-se",
      },
      header: {
        blog: "Blog",
        contact: "Contato",
        docs: "Documentação",
        home: "Início",
        product: {
          description: "Gerenciar um pequeno negócio hoje já é difícil.",
          pricing: "Preços",
          title: "Produto",
        },
        signIn: "Entrar",
        signUp: "Começar",
      },
    },
  },
}));

vi.mock("./dictionaries/zh.json", () => ({
  default: {
    web: {
      global: {
        primaryCta: "预约通话",
        secondaryCta: "注册",
      },
      header: {
        blog: "博客",
        contact: "联系我们",
        docs: "文档",
        home: "首页",
        product: {
          description: "如今，管理小型企业已经很困难了。",
          pricing: "价格",
          title: "产品",
        },
        signIn: "登录",
        signUp: "开始使用",
      },
    },
  },
}));

// Mock languine.json
vi.mock("./languine.json", () => ({
  default: {
    files: {
      json: {
        include: ["dictionaries/[locale].json"],
      },
    },
    locale: {
      source: "en",
      targets: ["es", "de", "zh", "fr", "pt"],
    },
  },
}));

// Mock next/server
vi.mock("next/server", () => ({
  NextResponse: {
    redirect: vi.fn().mockImplementation((url) => ({
      url,
      status: 307,
      statusText: "Temporary Redirect",
    })),
  },
}));

// Mock @formatjs/intl-localematcher
vi.mock("@formatjs/intl-localematcher", () => ({
  match: vi.fn().mockImplementation((languages, locales, defaultLocale) => {
    // Simple mock implementation that returns the first matching locale or the default
    const matchedLocale = languages.find((lang: string) =>
      locales.includes(lang),
    );
    return matchedLocale || defaultLocale;
  }),
}));

// Mock negotiator
vi.mock("negotiator", () => ({
  default: vi.fn().mockImplementation(() => ({
    languages: vi.fn().mockReturnValue(["en-US", "en", "es"]),
  })),
}));
