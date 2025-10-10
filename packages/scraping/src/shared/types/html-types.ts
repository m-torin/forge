/**
 * HTML parser provider type definitions
 */

// Cheerio specific types
export interface CheerioConfig {
  baseUrl?: string;
  followRedirect?: boolean;
  headers?: Record<string, string>;
  maxRedirects?: number;
  retryAttempts?: number;
  retryDelay?: number;
  timeout?: number;
  userAgent?: string;
}

export interface CheerioOptions {
  decodeEntities?: boolean;
  lowerCaseAttributeNames?: boolean;
  lowerCaseTags?: boolean;
  recognizeCDATA?: boolean;
  recognizeSelfClosing?: boolean;
  xmlMode?: boolean;
}

// Node Fetch specific types
export interface NodeFetchConfig {
  agent?: any;
  compress?: boolean;
  followRedirect?: boolean;
  headers?: Record<string, string>;
  highWaterMark?: number;
  insecureHTTPParser?: boolean;
  maxRedirects?: number;
  timeout?: number;
}

export interface NodeFetchOptions {
  body?: any;
  compress?: boolean;
  method?: string;
  redirect?: "error" | "follow" | "manual";
  signal?: AbortSignal;
  size?: number;
}
