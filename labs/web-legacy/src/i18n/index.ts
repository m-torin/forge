import { getDictionary as getBaseDictionary } from '@repo/internationalization/server';
import { createDictionary } from '@repo/internationalization/server/next';

async function getAppDictionary(locale: string) {
  const normalizedLocale = locale.split('-')[0]; // Handle fr-CA -> fr
  try {
    const dict = await import(`./dictionaries/${normalizedLocale}.json`);
    return dict.default;
  } catch {
    // Fallback to English if locale not found
    const dict = await import('./dictionaries/en.json');
    return dict.default;
  }
}

export const getDictionary = createDictionary(getBaseDictionary, getAppDictionary);
