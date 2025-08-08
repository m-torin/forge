/**
 * Browser provider type definitions
 */

export interface BrowserCookie {
  domain?: string;
  expires?: number;
  httpOnly?: boolean;
  name: string;
  path?: string;
  sameSite?: 'Lax' | 'None' | 'Strict';
  secure?: boolean;
  value: string;
}

export interface BrowserViewport {
  deviceScaleFactor?: number;
  hasTouch?: boolean;
  height: number;
  isMobile?: boolean;
  width: number;
}

// Hero specific types
export interface HeroConfig {
  blockedResourceTypes?: string[];
  locale?: string;
  secretAgent?: any;
  showChrome?: boolean;
  timezoneId?: string;
  userAgent?: string;
  viewport?: BrowserViewport;
}

export interface HeroOptions {
  timeoutMs?: number;
  waitForPaintingStable?: boolean;
}

// Playwright specific types
export interface PlaywrightConfig {
  acceptDownloads?: boolean;
  browser?: 'chromium' | 'firefox' | 'webkit';
  colorScheme?: 'dark' | 'light' | 'no-preference';
  devtools?: boolean;
  geolocation?: { latitude: number; longitude: number };
  headless?: boolean;
  httpCredentials?: { password: string; username: string };
  ignoreHTTPSErrors?: boolean;
  locale?: string;
  offline?: boolean;
  permissions?: string[];
  slowMo?: number;
  timezoneId?: string;
}

export interface PlaywrightOptions {
  force?: boolean;
  noWaitAfter?: boolean;
  referer?: string;
  strictSelectors?: boolean;
  timeout?: number;
  waitUntil?: 'commit' | 'domcontentloaded' | 'load' | 'networkidle';
}

// Puppeteer specific types
export interface PuppeteerConfig {
  args?: string[];
  defaultViewport?: BrowserViewport | null;
  devtools?: boolean;
  dumpio?: boolean;
  env?: Record<string, string | undefined>;
  executablePath?: string;
  handleSIGHUP?: boolean;
  handleSIGINT?: boolean;
  handleSIGTERM?: boolean;
  headless?: 'new' | boolean;
  ignoreDefaultArgs?: boolean | string[];
  pipe?: boolean;
  product?: 'chrome' | 'firefox';
  slowMo?: number;
  userDataDir?: string;
}

export interface PuppeteerOptions {
  referer?: string;
  timeout?: number;
  waitUntil?: 'domcontentloaded' | 'load' | 'networkidle0' | 'networkidle2';
}
