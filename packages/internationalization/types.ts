export interface I18nConfig {
  /**
   * The default locale to use when loading messages
   */
  defaultLocale: string;

  /**
   * List of namespaces to load messages for
   */
  namespaces: string[];
}
