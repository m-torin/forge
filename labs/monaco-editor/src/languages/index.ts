// src/languages/index.ts
export * from './javascript';
export * from './typescript';
export * from './python';
export * from './r';
export * from './sql';

export type SupportedLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'r'
  | 'sql';

export const isSupportedLanguage = (
  language: string,
): language is SupportedLanguage => {
  return ['javascript', 'typescript', 'python', 'r', 'sql'].includes(language);
};
