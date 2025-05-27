import { getDictionary as getBaseDictionary } from "@repo/internationalization";
import {
  createDictionary,
  type ExtendedDictionary,
} from "@repo/internationalization/extend";

import type en from "../dictionaries/en.json";

export type TemplateDictionary = typeof en;
export type FullDictionary = ExtendedDictionary<TemplateDictionary>;

const templateDictionaries: Record<string, () => Promise<TemplateDictionary>> =
  {
    de: () => import("../dictionaries/en.json").then((mod) => mod.default),
    en: () => import("../dictionaries/en.json").then((mod) => mod.default),
    es: () => import("../dictionaries/es.json").then((mod) => mod.default),
    // Add more languages as needed, fallback to English
    fr: () => import("../dictionaries/en.json").then((mod) => mod.default),
    ja: () => import("../dictionaries/en.json").then((mod) => mod.default),
    zh: () => import("../dictionaries/en.json").then((mod) => mod.default),
  };

async function getTemplateDictionary(
  locale: string,
): Promise<TemplateDictionary> {
  const normalizedLocale = locale.split("-")[0];
  const loader =
    templateDictionaries[normalizedLocale] || templateDictionaries.en;
  return loader();
}

export const getDictionary = createDictionary(
  getBaseDictionary,
  getTemplateDictionary,
);
