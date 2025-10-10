/**
 * Export routing configuration and types
 * This allows apps to import routing config without server-only restrictions
 */

export { locales, routing, type Locale } from "./routing";
export type {
  DomainConfig,
  LocalePrefix,
  LocalePrefixConfig,
  RoutingConfig,
} from "./types";
