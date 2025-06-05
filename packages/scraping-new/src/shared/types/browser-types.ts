/**
 * Browser automation specific types
 */

import type { ScrapeOptions, ScrapeResult } from './scraping-types';

/**
 * Browser provider types
 */
export type BrowserProvider = 'playwright' | 'puppeteer' | 'hero';

/**
 * Browser launch options
 */
export interface BrowserLaunchOptions {
  headless?: boolean | 'new';
  devtools?: boolean;
  args?: string[];
  executablePath?: string;
  slowMo?: number;
  timeout?: number;
  ignoreDefaultArgs?: boolean | string[];
  env?: Record<string, string>;
  handleSIGINT?: boolean;
  handleSIGTERM?: boolean;
  handleSIGHUP?: boolean;
  dumpio?: boolean;
}

/**
 * Browser context options
 */
export interface BrowserContextOptions {
  viewport?: {
    width: number;
    height: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
  };
  userAgent?: string;
  locale?: string;
  timezone?: string;
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  permissions?: string[];
  extraHTTPHeaders?: Record<string, string>;
  offline?: boolean;
  httpCredentials?: {
    username: string;
    password: string;
  };
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
  colorScheme?: 'light' | 'dark' | 'no-preference';
  reducedMotion?: 'reduce' | 'no-preference';
  forcedColors?: 'active' | 'none';
}

/**
 * Page navigation options
 */
export interface BrowserNavigationOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
  timeout?: number;
  referer?: string;
}

/**
 * Browser interaction options
 */
export interface BrowserInteractionOptions {
  delay?: number;
  timeout?: number;
  force?: boolean;
  noWaitAfter?: boolean;
  trial?: boolean;
}

/**
 * Browser scraping options
 */
export interface BrowserScrapeOptions extends ScrapeOptions {
  provider?: BrowserProvider;
  launchOptions?: BrowserLaunchOptions;
  contextOptions?: BrowserContextOptions;
  navigationOptions?: BrowserNavigationOptions;
  interactions?: BrowserInteraction[];
  persistSession?: boolean;
  sessionId?: string;
  autoClose?: boolean;
  recordVideo?: boolean;
  recordTrace?: boolean;
}

/**
 * Browser interaction step
 */
export interface BrowserInteraction {
  type:
    | 'click'
    | 'type'
    | 'select'
    | 'hover'
    | 'scroll'
    | 'wait'
    | 'navigate'
    | 'screenshot'
    | 'pdf';
  selector?: string;
  value?: string;
  options?: BrowserInteractionOptions;
  waitFor?: {
    selector?: string;
    function?: string;
    timeout?: number;
  };
}

/**
 * Browser scraping result
 */
export interface BrowserScrapeResult extends ScrapeResult {
  provider: BrowserProvider;
  sessionId?: string;
  interactions?: number;
  screenshots?: Buffer[];
  videos?: Buffer[];
  traces?: any[];
  console?: any[];
  network?: any[];
}

/**
 * Browser session information
 */
export interface BrowserSession {
  id: string;
  provider: BrowserProvider;
  startTime: number;
  lastActivity: number;
  persistent: boolean;
  contextOptions: BrowserContextOptions;
  pages: number;
  isActive: boolean;
}

/**
 * Browser resource blocking
 */
export interface BrowserResourceBlocking {
  types?: string[];
  urls?: string[];
  patterns?: RegExp[];
  exceptions?: string[];
}

/**
 * Browser performance metrics
 */
export interface BrowserPerformanceMetrics {
  navigationStart: number;
  loadEventEnd: number;
  domContentLoadedEventEnd: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

/**
 * Browser provider configuration
 */
export interface BrowserProviderConfig {
  maxConcurrentPages?: number;
  pagePool?: {
    min: number;
    max: number;
    acquireTimeout: number;
    createTimeout: number;
    destroyTimeout: number;
    idleTimeout: number;
  };
  defaultOptions?: {
    launch?: BrowserLaunchOptions;
    context?: BrowserContextOptions;
    navigation?: BrowserNavigationOptions;
  };
  resourceBlocking?: BrowserResourceBlocking;
  monitoring?: {
    performance?: boolean;
    console?: boolean;
    network?: boolean;
    coverage?: boolean;
  };
}
