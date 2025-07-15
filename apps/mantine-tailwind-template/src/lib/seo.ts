/**
 * SEO Configuration and Utilities
 *
 * Integrates @repo/seo with the existing i18n and feature flag systems
 */

// import { SEOManager } from '@repo/seo';
import type { Locale } from '#/lib/i18n';
import { env } from '#/root/env';
import type { Metadata } from 'next';

// TODO: SEO Manager - uncomment when @repo/seo is available
// export const seoManager = new SEOManager({
//   applicationName: 'Mantine + Tailwind Template',
//   author: {
//     name: 'Template Author',
//     url: 'https://github.com/your-repo/mantine-tailwind-template'
//   },
//   publisher: 'Template Team',
//   twitterHandle: '@template_dev',
//   keywords: [
//     'Next.js',
//     'Mantine',
//     'Tailwind CSS',
//     'React',
//     'TypeScript',
//     'Template',
//     'Starter Kit',
//     'Full Stack'
//   ],
//   themeColor: '#228be6', // Mantine blue
// });

// Locale-specific SEO configurations
const localeConfigs = {
  en: {
    locale: 'en_US',
    siteName: 'Mantine + Tailwind Template',
    description:
      'A modern Next.js template combining Mantine UI components with Tailwind CSS utilities',
  },
  es: {
    locale: 'es_ES',
    siteName: 'Plantilla Mantine + Tailwind',
    description:
      'Una plantilla moderna de Next.js que combina componentes Mantine UI con utilidades Tailwind CSS',
  },
  de: {
    locale: 'de_DE',
    siteName: 'Mantine + Tailwind Vorlage',
    description:
      'Eine moderne Next.js-Vorlage, die Mantine UI-Komponenten mit Tailwind CSS-Utilities kombiniert',
  },
  fr: {
    locale: 'fr_FR',
    siteName: 'Modèle Mantine + Tailwind',
    description:
      'Un modèle Next.js moderne combinant les composants Mantine UI avec les utilitaires Tailwind CSS',
  },
  pt: {
    locale: 'pt_PT',
    siteName: 'Template Mantine + Tailwind',
    description:
      'Um template Next.js moderno combinando componentes Mantine UI com utilitários Tailwind CSS',
  },
} as const;

// Generate metadata for homepage with feature flags context
export function createHomeMetadata(
  locale: Locale,
  flagResults: {
    showLangSwitcher: boolean;
    welcomeVariant: string;
    enhancedCards: boolean;
    showBanner: boolean;
  },
  userContext?: {
    isAuthenticated: boolean;
    userName?: string;
    role?: string;
  },
): Metadata {
  const config = localeConfigs[locale as keyof typeof localeConfigs];
  const isPersonalized = userContext?.isAuthenticated;

  // Personalized title for authenticated users
  const title =
    isPersonalized && userContext?.userName
      ? `Welcome back, ${userContext.userName} | ${config.siteName}`
      : `Home | ${config.siteName}`;

  // Enhanced description based on feature flags and auth state
  let description = config.description;
  if (flagResults.showBanner && flagResults.enhancedCards) {
    description += ' | Featuring enhanced UI components and beta features';
  }
  if (isPersonalized) {
    description += ` | Personalized experience for ${userContext?.role || 'user'}`;
  }

  return {
    title,
    description,
    keywords: [
      'Next.js',
      'Mantine',
      'Tailwind CSS',
      'React',
      'TypeScript',
      `welcome-${flagResults.welcomeVariant}`,
      ...(flagResults.showLangSwitcher ? ['i18n', 'multilingual'] : []),
      ...(flagResults.enhancedCards ? ['enhanced-ui', 'feature-flags'] : []),
      ...(isPersonalized ? ['personalized', 'authenticated'] : ['anonymous']),
    ],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        es: '/es',
        de: '/de',
        fr: '/fr',
        pt: '/pt',
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: config.locale,
      siteName: config.siteName,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// Generate metadata for auth pages
export function createAuthMetadata(
  locale: Locale,
  page: 'login' | 'profile',
  userContext?: {
    isAuthenticated: boolean;
    userName?: string;
  },
): Metadata {
  const config = localeConfigs[locale as keyof typeof localeConfigs];

  const titles = {
    login: 'Sign In',
    profile: userContext?.userName ? `${userContext.userName}'s Profile` : 'Profile',
  };

  const descriptions = {
    login: 'Sign in to access personalized features and enhanced functionality',
    profile: 'Manage your account settings and preferences',
  };

  return {
    title: titles[page],
    description: descriptions[page],
    robots: page === 'profile' ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: `/${locale}/${page}`,
      languages: {
        en: `/en/${page}`,
        es: `/es/${page}`,
        de: `/de/${page}`,
        fr: `/fr/${page}`,
        pt: `/pt/${page}`,
      },
    },
    openGraph: {
      title: `${titles[page]} | ${config.siteName}`,
      description: descriptions[page],
      type: 'website',
      locale: config.locale,
    },
  };
}

// Base metadata for the application
export function createBaseMetadata(locale: Locale): Metadata {
  const config = localeConfigs[locale as keyof typeof localeConfigs];

  return {
    title: {
      template: `%s | ${config.siteName}`,
      default: config.siteName,
    },
    description: config.description,
    alternates: {
      languages: {
        en: '/en',
        es: '/es',
        de: '/de',
        fr: '/fr',
        pt: '/pt',
      },
    },
    openGraph: {
      siteName: config.siteName,
      locale: config.locale,
      type: 'website',
    },
  };
}

// Structured data for the organization
export function createOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mantine + Tailwind Template',
    description: 'A modern Next.js template combining Mantine UI with Tailwind CSS',
    url: env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000',
    sameAs: ['https://github.com/your-repo/mantine-tailwind-template'],
    founder: {
      '@type': 'Person',
      name: 'Template Author',
    },
  };
}

// Website structured data
export function createWebsiteStructuredData(locale: Locale) {
  const config = localeConfigs[locale as keyof typeof localeConfigs];

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.siteName,
    description: config.description,
    url: env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000',
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Breadcrumb structured data
export function createBreadcrumbStructuredData(
  locale: Locale,
  items: Array<{ name: string; url: string }>,
) {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}

// Software application structured data (for the template itself)
export function createSoftwareApplicationStructuredData(locale: Locale) {
  const config = localeConfigs[locale as keyof typeof localeConfigs];

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: config.siteName,
    description: config.description,
    applicationCategory: 'DeveloperTool',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Person',
      name: 'Template Author',
    },
    programmingLanguage: ['TypeScript', 'JavaScript', 'CSS'],
    runtimePlatform: 'Next.js',
    codeRepository: 'https://github.com/your-repo/mantine-tailwind-template',
  };
}

// User profile structured data (for authenticated users)
export function createUserProfileStructuredData(
  userName: string,
  userRole: string,
  _locale: Locale,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: userName,
    jobTitle: userRole === 'admin' ? 'Administrator' : 'User',
    memberOf: {
      '@type': 'Organization',
      name: 'Mantine + Tailwind Template',
    },
  };
}

// FAQ structured data for common template questions
export function createTemplatesFAQStructuredData(locale: Locale) {
  const faqs = {
    en: [
      {
        question: 'What is this Mantine Tailwind template?',
        answer:
          'A modern Next.js template that combines Mantine UI components with Tailwind CSS utilities for rapid development.',
      },
      {
        question: 'How do I get started?',
        answer:
          'Clone the repository, install dependencies with pnpm install, and run pnpm dev to start the development server.',
      },
      {
        question: 'Does it support multiple languages?',
        answer:
          'Yes, the template includes internationalization support for English, Spanish, German, French, and Portuguese.',
      },
    ],
    es: [
      {
        question: '¿Qué es esta plantilla Mantine Tailwind?',
        answer:
          'Una plantilla moderna de Next.js que combina componentes Mantine UI con utilidades Tailwind CSS para desarrollo rápido.',
      },
    ],
    de: [
      {
        question: 'Was ist diese Mantine Tailwind Vorlage?',
        answer:
          'Eine moderne Next.js-Vorlage, die Mantine UI-Komponenten mit Tailwind CSS-Utilities für schnelle Entwicklung kombiniert.',
      },
    ],
    fr: [
      {
        question: "Qu'est-ce que ce modèle Mantine Tailwind?",
        answer:
          'Un modèle Next.js moderne qui combine les composants Mantine UI avec les utilitaires Tailwind CSS pour un développement rapide.',
      },
    ],
    pt: [
      {
        question: 'O que é este template Mantine Tailwind?',
        answer:
          'Um template Next.js moderno que combina componentes Mantine UI com utilitários Tailwind CSS para desenvolvimento rápido.',
      },
    ],
  } as const;

  const localeFaqs = faqs[locale as keyof typeof faqs] || faqs.en;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: localeFaqs.map((faq: { question: string; answer: string }) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
