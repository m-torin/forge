import {
  createDictionary,
  getDictionary as getBaseDictionary,
} from '@repo/internationalization/server/next';

import type { Locale } from '@repo/internationalization/server/next';

export type { Locale };

export type AppDictionary = {
  meta: {
    title: string;
    description: string;
  };
  header: {
    title: string;
  };
  home: {
    welcome: string;
    description: string;
    features: {
      nextjs: {
        title: string;
        description: string;
      };
      mantine: {
        title: string;
        description: string;
      };
      tailwind: {
        title: string;
        description: string;
      };
    };
  };
  ui: {
    colorScheme: {
      light: string;
      dark: string;
      auto: string;
    };
    language: string;
  };
};

async function getAppDictionary(locale: string): Promise<AppDictionary> {
  const dictionary = await import(`../dictionaries/${locale}.json`);
  return dictionary.default;
}

export const getDictionary = createDictionary(getBaseDictionary, getAppDictionary);
