import type { Dictionary } from '../index';

type ExtendedDictionary<T extends Record<string, any>> = Dictionary & T;

export function createDictionary<T extends Record<string, any>>(
  getDictionary: (locale: string) => Promise<Dictionary>,
  getAppDictionary: (locale: string) => Promise<T>,
) {
  return async (locale: string): Promise<ExtendedDictionary<T>> => {
    const [baseDictionary, appDictionary] = await Promise.all([
      getDictionary(locale),
      getAppDictionary(locale),
    ]);

    return {
      ...baseDictionary,
      ...appDictionary,
    };
  };
}
