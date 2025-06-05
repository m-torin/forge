/**
 * Browser provider type definitions
 */

export interface BrowserViewport {
  deviceScaleFactor?: number;
  hasTouch?: boolean;
  height: number;
  isMobile?: boolean;
  width: number;
}

export interface BrowserCookie {
  domain?: string;
  expires?: number;
  httpOnly?: boolean;
  name: string;
  path?: string;
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
  value: string;
}

// Playwright specific types
export interface PlaywrightConfig {
  acceptDownloads?: boolean;
  browser?: 'chromium' | 'firefox' | 'webkit';
  colorScheme?: 'light' | 'dark' | 'no-preference';
  devtools?: boolean;
  geolocation?: { longitude: number; latitude: number };
  headless?: boolean;
  httpCredentials?: { username: string; password: string };
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
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
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
  headless?: boolean | 'new';
  ignoreDefaultArgs?: boolean | string[];
  pipe?: boolean;
  product?: 'chrome' | 'firefox';
  slowMo?: number;
  userDataDir?: string;
}

export interface PuppeteerOptions {
  referer?: string;
  timeout?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
}

// Hero specific types
export interface HeroConfig {
  blockedResourceTypes?: string[];
  locale?: string;
  secretAgent?: any; // Hero uses SecretAgent under the hood
  showChrome?: boolean;
  timezoneId?: string;
  userAgent?: string;
  viewport?: BrowserViewport;
}

export interface HeroOptions {
  timeoutMs?: number;
  waitForPaintingStable?: boolean;
}