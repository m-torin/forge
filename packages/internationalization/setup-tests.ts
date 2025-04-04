import '@repo/testing/src/vitest/core/setup';
import { vi } from 'vitest';

// Mock server-only
vi.mock('server-only', () => ({}));

// Mock dictionaries
vi.mock('./dictionaries/en.json', () => ({
  default: {
    web: {
      global: {
        primaryCta: 'Book a call',
        secondaryCta: 'Sign up',
      },
      header: {
        home: 'Home',
        product: {
          title: 'Product',
          description: 'Managing a small business today is already tough.',
          pricing: 'Pricing',
        },
        blog: 'Blog',
        docs: 'Docs',
        contact: 'Contact',
        signIn: 'Sign in',
        signUp: 'Get started',
      },
    },
  },
}));

vi.mock('./dictionaries/es.json', () => ({
  default: {
    web: {
      global: {
        primaryCta: 'Reservar una llamada',
        secondaryCta: 'Registrarse',
      },
      header: {
        home: 'Inicio',
        product: {
          title: 'Producto',
          description: 'Administrar un pequeño negocio hoy ya es difícil.',
          pricing: 'Precios',
        },
        blog: 'Blog',
        docs: 'Documentación',
        contact: 'Contacto',
        signIn: 'Iniciar sesión',
        signUp: 'Comenzar',
      },
    },
  },
}));

vi.mock('./dictionaries/de.json', () => ({
  default: {
    web: {
      global: {
        primaryCta: 'Anruf buchen',
        secondaryCta: 'Registrieren',
      },
      header: {
        home: 'Startseite',
        product: {
          title: 'Produkt',
          description:
            'Die Verwaltung eines kleinen Unternehmens ist heute schon schwierig.',
          pricing: 'Preise',
        },
        blog: 'Blog',
        docs: 'Dokumentation',
        contact: 'Kontakt',
        signIn: 'Anmelden',
        signUp: 'Loslegen',
      },
    },
  },
}));

vi.mock('./dictionaries/fr.json', () => ({
  default: {
    web: {
      global: {
        primaryCta: 'Réserver un appel',
        secondaryCta: "S'inscrire",
      },
      header: {
        home: 'Accueil',
        product: {
          title: 'Produit',
          description:
            "Gérer une petite entreprise aujourd'hui est déjà difficile.",
          pricing: 'Tarifs',
        },
        blog: 'Blog',
        docs: 'Documentation',
        contact: 'Contact',
        signIn: 'Se connecter',
        signUp: 'Commencer',
      },
    },
  },
}));

vi.mock('./dictionaries/pt.json', () => ({
  default: {
    web: {
      global: {
        primaryCta: 'Agendar uma chamada',
        secondaryCta: 'Cadastrar-se',
      },
      header: {
        home: 'Início',
        product: {
          title: 'Produto',
          description: 'Gerenciar um pequeno negócio hoje já é difícil.',
          pricing: 'Preços',
        },
        blog: 'Blog',
        docs: 'Documentação',
        contact: 'Contato',
        signIn: 'Entrar',
        signUp: 'Começar',
      },
    },
  },
}));

vi.mock('./dictionaries/zh.json', () => ({
  default: {
    web: {
      global: {
        primaryCta: '预约通话',
        secondaryCta: '注册',
      },
      header: {
        home: '首页',
        product: {
          title: '产品',
          description: '如今，管理小型企业已经很困难了。',
          pricing: '价格',
        },
        blog: '博客',
        docs: '文档',
        contact: '联系我们',
        signIn: '登录',
        signUp: '开始使用',
      },
    },
  },
}));

// Mock languine.json
vi.mock('./languine.json', () => ({
  default: {
    locale: {
      source: 'en',
      targets: ['es', 'de', 'zh', 'fr', 'pt'],
    },
    files: {
      json: {
        include: ['dictionaries/[locale].json'],
      },
    },
  },
}));

// Mock next/server
vi.mock('next/server', () => ({
  NextResponse: {
    redirect: vi.fn().mockImplementation((url) => ({
      url,
      status: 307,
      statusText: 'Temporary Redirect',
    })),
  },
}));

// Mock @formatjs/intl-localematcher
vi.mock('@formatjs/intl-localematcher', () => ({
  match: vi.fn().mockImplementation((languages, locales, defaultLocale) => {
    // Simple mock implementation that returns the first matching locale or the default
    const matchedLocale = languages.find((lang: string) =>
      locales.includes(lang),
    );
    return matchedLocale || defaultLocale;
  }),
}));

// Mock negotiator
vi.mock('negotiator', () => ({
  default: vi.fn().mockImplementation(() => ({
    languages: vi.fn().mockReturnValue(['en-US', 'en', 'es']),
  })),
}));
