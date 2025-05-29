## E-commerce Retailer Processors

### Amazon Processor Implementation

```typescript
// packages/scraper/src/retailers/amazon/amazon.processor.ts
import { Page } from '@playwright/test';
import { BaseRetailerProcessor } from '../base-retailer.ts';
import { Logger } from '@scraper/shared/utils/logger';

export class AmazonProcessor extends BaseRetailerProcessor {
  private logger = new Logger('AmazonProcessor');

  async navigate(page: Page, url: string): Promise<void> {
    // Amazon-specific navigation
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Wait for critical elements with fallbacks
    try {
      await page.waitForSelector('[data-action="dp-asin-title-click"]', {
        timeout: 5000,
      });
    } catch {
      // Fallback selectors
      await page.waitForSelector('#productTitle, .product-title-word-break', {
        timeout: 5000,
      });
    }

    // Handle Amazon's lazy loading
    await this.scrollPage(page);

    // Wait for price to load
    await page
      .waitForSelector('.a-price-whole, span.a-price', {
        timeout: 5000,
      })
      .catch(() => {
        this.logger.warn('Price not found on initial load');
      });

    // Random delay to appear human
    await page.waitForTimeout(1000 + Math.random() * 2000);
  }

  async extractProduct(page: Page): Promise<any> {
    return await page.evaluate(() => {
      const data: any = {};

      // Extract ASIN
      const asinElement = document.querySelector('[data-asin]');
      data.asin =
        asinElement?.getAttribute('data-asin') ||
        window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/)?.[1];

      // Extract title
      data.title =
        document.querySelector('#productTitle')?.textContent?.trim() ||
        document.querySelector('.product-title-word-break')?.textContent?.trim();

      // Extract price
      const priceWhole = document.querySelector('.a-price-whole');
      const priceFraction = document.querySelector('.a-price-fraction');
      if (priceWhole) {
        data.price = priceWhole.textContent + (priceFraction?.textContent || '');
      } else {
        // Fallback price extraction
        const priceElement = document.querySelector('span.a-price');
        data.price = priceElement?.textContent;
      }

      // Extract availability
      const availabilityElement = document.querySelector('#availability span');
      data.availability = availabilityElement?.textContent?.trim();

      // Extract rating
      const ratingElement = document.querySelector('span.a-icon-alt');
      if (ratingElement) {
        const ratingText = ratingElement.textContent;
        data.rating = parseFloat(ratingText?.match(/(\d+\.?\d*)/)?.[1] || '0');
      }

      // Extract review count
      const reviewElement = document.querySelector('#acrCustomerReviewText');
      if (reviewElement) {
        const reviewText = reviewElement.textContent;
        data.reviewCount = parseInt(reviewText?.replace(/[^\d]/g, '') || '0');
      }

      // Extract images
      const images: string[] = [];
      document.querySelectorAll('#altImages img').forEach((img) => {
        const src = img.getAttribute('src');
        if (src) {
          // Convert thumbnail to full size
          const fullSizeSrc = src.replace(/\._[^.]+_\./, '.');
          images.push(fullSizeSrc);
        }
      });
      data.images = images;

      // Extract description
      const featureBullets = Array.from(
        document.querySelectorAll('#feature-bullets span.a-list-item')
      )
        .map((el) => el.textContent?.trim())
        .filter(Boolean);
      data.description = featureBullets.join(' ');

      // Extract specifications
      const specs: any = {};
      document.querySelectorAll('#productDetails_techSpec_section_1 tr').forEach((row) => {
        const key = row.querySelector('th')?.textContent?.trim();
        const value = row.querySelector('td')?.textContent?.trim();
        if (key && value) {
          specs[key] = value;
        }
      });
      data.specifications = specs;

      // Additional Amazon-specific data
      data.seller = document.querySelector('#bylineInfo')?.textContent?.trim();
      data.category = Array.from(document.querySelectorAll('#wayfinding-breadcrumbs_feature_div a'))
        .map((el) => el.textContent?.trim())
        .filter(Boolean);

      return data;
    });
  }

  private async scrollPage(page: Page): Promise<void> {
    // Scroll to load lazy content
    await page.evaluate(async () => {
      const distance = 100;
      const delay = 100;
      const maxScroll = document.body.scrollHeight;

      for (let i = 0; i < maxScroll; i += distance) {
        window.scrollBy(0, distance);
        await new Promise((resolve) => setTimeout(resolve, delay));

        // Stop if we've loaded product details
        if (document.querySelector('#productDetails_feature_div')) {
          break;
        }
      }
    });
  }
}
```

### Advanced Anti-Detection Components

```typescript
// packages/scraper/src/browser/tls-fingerprint.ts
import { createHash } from 'crypto';
import { Logger } from '@scraper/shared/utils/logger';

export class TLSFingerprint {
  private logger = new Logger('TLSFingerprint');
  private fingerprints: Map<string, any> = new Map();

  constructor() {
    this.loadFingerprints();
  }

  private loadFingerprints() {
    // Real browser TLS fingerprints
    const chromeFingerprints = [
      {
        id: 'chrome_120',
        cipherSuites: [
          'TLS_AES_128_GCM_SHA256',
          'TLS_AES_256_GCM_SHA384',
          'TLS_CHACHA20_POLY1305_SHA256',
          'ECDHE-ECDSA-AES128-GCM-SHA256',
          'ECDHE-RSA-AES128-GCM-SHA256',
        ],
        extensions: ['renegotiation_info', 'server_name', 'extended_master_secret'],
        supportedVersions: ['TLSv1.3', 'TLSv1.2'],
        signatureAlgorithms: ['ecdsa_secp256r1_sha256', 'rsa_pss_rsae_sha256', 'rsa_pkcs1_sha256'],
      },
    ];

    chromeFingerprints.forEach((fp) => {
      this.fingerprints.set(fp.id, fp);
    });
  }

  async generate(): Promise<{ id: string; fingerprint: any }> {
    const fingerprints = Array.from(this.fingerprints.values());
    const selected = fingerprints[Math.floor(Math.random() * fingerprints.length)];

    // Add some randomization
    const fingerprint = {
      ...selected,
      extensions: this.shuffleArray([...selected.extensions]),
      random: createHash('md5').update(Date.now().toString()).digest('hex'),
    };

    return {
      id: selected.id,
      fingerprint,
    };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
```

```typescript
// packages/scraper/src/browser/webrtc-blocker.ts
export class WebRTCBlocker {
  async apply(context: any): Promise<void> {
    await context.addInitScript(() => {
      // Completely disable WebRTC
      const rtcPeerConnection =
        window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

      if (rtcPeerConnection) {
        // Override constructor to prevent connections
        window.RTCPeerConnection = function () {
          throw new Error('WebRTC is disabled');
        };
        window.webkitRTCPeerConnection = window.RTCPeerConnection;
        window.mozRTCPeerConnection = window.RTCPeerConnection;
      }

      // Block getUserMedia
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia = () => {
          return Promise.reject(new Error('getUserMedia is not available'));
        };
      }

      // Legacy API
      navigator.getUserMedia = undefined;
      navigator.webkitGetUserMedia = undefined;
      navigator.mozGetUserMedia = undefined;

      // Block WebRTC related APIs
      delete window.RTCPeerConnection;
      delete window.RTCSessionDescription;
      delete window.RTCIceCandidate;
      delete window.webkitRTCPeerConnection;
      delete window.mozRTCPeerConnection;
    });
  }
}
```

```typescript
// packages/scraper/src/anti-detection/fingerprint-generator.ts
import { createHash, randomBytes } from 'crypto';

export class FingerprintGenerator {
  private fontList = [
    'Arial',
    'Arial Black',
    'Arial Narrow',
    'Book Antiqua',
    'Bookman Old Style',
    'Calibri',
    'Cambria',
    'Cambria Math',
    'Century',
    'Century Gothic',
    'Comic Sans MS',
    'Consolas',
    'Courier',
    'Courier New',
    'Georgia',
    'Helvetica',
    'Impact',
    'Lucida Console',
    'Lucida Sans Unicode',
    'Microsoft Sans Serif',
    'Monaco',
    'Palatino Linotype',
    'Tahoma',
    'Times',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana',
  ];

  async generateAdvanced(options: any): Promise<any> {
    const baseFingerprint = {
      userAgent: this.generateUserAgent(options),
      screen: {
        width: options.screenResolution?.width || 1920,
        height: options.screenResolution?.height || 1080,
        availWidth: options.screenResolution?.width || 1920,
        availHeight: (options.screenResolution?.height || 1080) - 40, // Taskbar
        colorDepth: options.colorDepth || 24,
        pixelDepth: options.colorDepth || 24,
      },
      viewport: {
        width: (options.screenResolution?.width || 1920) - Math.floor(Math.random() * 100),
        height: (options.screenResolution?.height || 1080) - Math.floor(Math.random() * 200),
      },
      deviceMemory: options.deviceMemory || 8,
      hardwareConcurrency: options.hardwareConcurrency || 8,
      language: options.language || 'en-US',
      languages: this.generateLanguages(options.language),
      timezone: options.timezone || 'America/New_York',
      platform: options.platform || 'Win32',
      canvas: {
        noise: Math.random() * 0.0001, // Very small noise
        hash: this.generateCanvasHash(),
      },
      webgl: {
        vendor: 'Intel Inc.',
        renderer: this.generateWebGLRenderer(options.os),
      },
      fonts: this.generateFontList(options.os),
      audio: {
        sampleRate: 44100,
        channelCount: 2,
        noise: Math.random() * 0.00001,
      },
      deviceScaleFactor: this.calculateDeviceScaleFactor(options.screenResolution),
      touchSupport: {
        maxTouchPoints: 0,
        touchEvent: false,
        touchStart: false,
      },
      vendor: this.getVendor(options.os),
      cookieEnabled: true,
      doNotTrack: null,
      plugins: this.generatePlugins(options.os),
    };

    return baseFingerprint;
  }

  private generateUserAgent(options: any): string {
    const os = options.os || 'windows';
    const chromeVersion = 120 + Math.floor(Math.random() * 5);

    const userAgents = {
      windows: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Safari/537.36`,
      macos: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Safari/537.36`,
      linux: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion}.0.0.0 Safari/537.36`,
    };

    return userAgents[os] || userAgents.windows;
  }

  private generateLanguages(primary: string): string[] {
    const languages = [primary];

    if (primary === 'en-US') {
      languages.push('en');
    } else if (primary === 'en-GB') {
      languages.push('en');
    }

    return languages;
  }

  private generateWebGLRenderer(os: string): string {
    const renderers = {
      windows: [
        'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0)',
        'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 Ti Direct3D11 vs_5_0 ps_5_0)',
        'ANGLE (AMD, AMD Radeon RX 5700 XT Direct3D11 vs_5_0 ps_5_0)',
      ],
      macos: ['Apple M1', 'Intel Iris OpenGL Engine', 'AMD Radeon Pro 5500M OpenGL Engine'],
      linux: [
        'Mesa Intel(R) Xe Graphics (TGL GT2)',
        'NVIDIA GeForce GTX 1660 Ti/PCIe/SSE2',
        'AMD RENOIR (DRM 3.42.0, 5.13.0-52-generic, LLVM 12.0.0)',
      ],
    };

    const osRenderers = renderers[os] || renderers.windows;
    return osRenderers[Math.floor(Math.random() * osRenderers.length)];
  }

  private generateFontList(os: string): string[] {
    const baseFonts = [...this.fontList];

    // Add OS-specific fonts
    if (os === 'windows') {
      baseFonts.push('Segoe UI', 'MS Gothic', 'MS PGothic');
    } else if (os === 'macos') {
      baseFonts.push('Helvetica Neue', 'Apple Color Emoji', 'SF Pro Display');
    }

    // Randomize order and select subset
    const shuffled = baseFonts.sort(() => Math.random() - 0.5);
    const count = 20 + Math.floor(Math.random() * 10);

    return shuffled.slice(0, count);
  }

  private generateCanvasHash(): string {
    // Generate consistent but unique canvas fingerprint
    const data = randomBytes(32);
    return createHash('md5').update(data).digest('hex');
  }

  private calculateDeviceScaleFactor(resolution: any): number {
    if (!resolution) return 1;

    // High DPI displays
    if (resolution.width > 2560) return 2;
    if (resolution.width > 1920) return 1.5;

    return 1;
  }

  private getVendor(os: string): string {
    return os === 'macos' ? 'Apple Computer, Inc.' : '';
  }

  private generatePlugins(os: string): any[] {
    const plugins = [
      {
        name: 'PDF Viewer',
        filename: 'internal-pdf-viewer',
        description: 'Portable Document Format',
      },
    ];

    if (os === 'windows') {
      plugins.push({
        name: 'Chrome PDF Plugin',
        filename: 'internal-pdf-viewer',
        description: 'Portable Document Format',
      });
    }

    return plugins;
  }

  generate(options: any): any {
    // Simplified version for backward compatibility
    return this.generateAdvanced(options);
  }
}
```

// packages/scraper/src/api-discovery/api-discovery-engine.ts import { Page } from
'@playwright/test'; import { Logger } from '@scraper/shared/utils/logger'; import { Redis } from
'ioredis';

interface ApiEndpoint { retailer: string; type: string; url: string; method: string; headers?:
Record<string, string>; queryParams?: Record<string, string>; requestBody?: any; responseSchema?:
any; }

export class ApiDiscoveryEngine { private logger = new Logger('ApiDiscoveryEngine'); private redis:
Redis; private discoveredEndpoints: Map<string, ApiEndpoint[]> = new Map();

constructor() { this.redis = new Redis(); this.loadCachedEndpoints(); }

async discoverFromPage(page: Page, retailer: string): Promise<void> { // Intercept network requests
const endpoints: ApiEndpoint[] = [];

    page.on('request', request => {
      const url = request.url();
      const method = request.method();

      // Look for API patterns
      if (this.isApiRequest(url, retailer)) {
        const endpoint: ApiEndpoint = {
          retailer,
          type: this.detectEndpointType(url),
          url: this.normalizeUrl(url),
          method,
          headers: request.headers(),
          queryParams: this.extractQueryParams(url)
        };

        endpoints.push(endpoint);
      }
    });

    page.on('response', async response => {
      const request = response.request();
      const url = request.url();

      if (this.isApiRequest(url, retailer) && response.status() === 200) {
        try {
          const responseData = await response.json();

          // Find corresponding endpoint
          const endpoint = endpoints.find(e => e.url === this.normalizeUrl(url));
          if (endpoint) {
            endpoint.responseSchema = this.extractSchema(responseData);

            // Store successful endpoint
            await this.storeEndpoint(endpoint);
          }
        } catch (error) {
          // Not JSON response
        }
      }
    });

}

async getEndpoint(retailer: string, type: string): Promise<any> { const key =
`api:endpoints:${retailer}:${type}`; const cached = await this.redis.get(key);

    if (cached) {
      const endpoint = JSON.parse(cached);
      return {
        request: async (params: any) => {
          return this.makeApiRequest(endpoint, params);
        }
      };
    }

    return null;

}

private isApiRequest(url: string, retailer: string): boolean { const patterns = { amazon: [
/api\.amazon\.com/, /\/api\//, /\/(gp|dp)\/product-api/, /\/dataServices/ ], target: [
/redsky\.target\.com/, /\/redsky\/v\d+/, /\/api\/fulfillment/ ], walmart: [ /api\.walmart\.com/,
/\/api\/v\d+/, /\/terra-firma/ ] };

    const retailerPatterns = patterns[retailer] || [];
    return retailerPatterns.some(pattern => pattern.test(url));

}

private detectEndpointType(url: string): string { if (url.includes('product') ||
url.includes('item')) return 'product'; if (url.includes('price')) return 'price'; if
(url.includes('availability') || url.includes('inventory')) return 'availability'; if
(url.includes('review')) return 'reviews'; return 'unknown'; }

private normalizeUrl(url: string): string { const urlObj = new URL(url); // Remove query params for
base URL return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`; }

private extractQueryParams(url: string): Record<string, string> { const urlObj = new URL(url); const
params: Record<string, string> = {};

    urlObj.searchParams.forEach((value, key) => {
      // Filter out dynamic values
      if (!this.isDynamicParam(key, value)) {
        params[key] = value;
      }
    });

    return params;

}

private isDynamicParam(key: string, value: string): boolean { // Identify parameters that change per
request const dynamicPatterns = [ /timestamp/i, /nonce/i, /session/i, /random/i ];

    return dynamicPatterns.some(pattern => pattern.test(key));

}

private extractSchema(data: any): any { // Basic schema extraction const schema: any = {};

    for (const [key, value] of Object.entries(data)) {
      if (value === null) {
        schema[key] = 'null';
      } else if (Array.isArray(value)) {
        schema[key] = 'array';
      } else {
        schema[key] = typeof value;
      }
    }

    return schema;

}

private async storeEndpoint(endpoint: ApiEndpoint): Promise<void> { const key =
`api:endpoints:${endpoint.retailer}:${endpoint.type}`; await this.redis.set(key,
JSON.stringify(endpoint), 'EX', 86400 \* 7); // 7 days

    this.logger.info(`Discovered API endpoint: ${endpoint.retailer} - ${endpoint.type}`);

}

private async makeApiRequest(endpoint: ApiEndpoint, params: any): Promise<any> { // Construct URL
with parameters let url = endpoint.url;

    // Replace path parameters
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, value as string);
    }

    // Add query parameters
    const urlObj = new URL(url);
    for (const [key, value] of Object.entries(endpoint.queryParams || {})) {
      urlObj.searchParams.set(key, value);
    }

    // Make request
    const response = await fetch(urlObj.toString(), {
      method: endpoint.method,
      headers: endpoint.headers,
      body: endpoint.requestBody ? JSON.stringify(endpoint.requestBody) : undefined
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();

}

private async loadCachedEndpoints(): Promise<void> { const keys = await
this.redis.keys('api:endpoints:\*');

    for (const key of keys) {
      const endpoint = await this.redis.get(key);
      if (endpoint) {
        const parsed = JSON.parse(endpoint);

        if (!this.discoveredEndpoints.has(parsed.retailer)) {
          this.discoveredEndpoints.set(parsed.retailer, []);
        }

        this.discoveredEndpoints.get(parsed.retailer)!.push(parsed);
      }
    }

    this.logger.info(`Loaded ${keys.length} cached API endpoints`);

} }

````#### Day 7: Enhanced E-commerce Worker with Retailer-Specific Logic
```typescript
// packages/scraper/src/worker.ts
import { Job } from 'bullmq';
import { CamoufoxManager } from './browser/camoufox-manager';
import { PlaywrightStealthManager } from './browser/playwright-stealth-manager';
import { ResidentialProxyManager } from './proxy/residential-proxy-manager';
import { RetailerProcessorFactory } from './retailers/retailer-processor-factory';
import { ApiDiscoveryEngine } from './api-discovery/api-discovery-engine';
import { PrismaClient } from '@scraper/database';
import { Logger } from '@scraper/shared/utils/logger';
import { CircuitBreaker } from '@scraper/shared/utils/circuit-breaker';
import { RetryStrategy, getRetryStrategy } from '@scraper/shared/utils/retry-strategies';
import { createHash } from 'crypto';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);

export class EcommerceScraperWorker {
  private camoufoxManager: CamoufoxManager;
  private playwrightManager: PlaywrightStealthManager;
  private proxyManager: ResidentialProxyManager;
  private apiDiscovery: ApiDiscoveryEngine;
  private prisma: PrismaClient;
  private logger: Logger;
  private retailerCircuits: Map<string, CircuitBreaker> = new Map();
  private retailerProcessors: Map<string, any> = new Map();
  private memoryMonitorInterval: NodeJS.Timer;
  private lastGCTime = 0;
  private gcMinInterval = 30000; // 30 seconds minimum between GCs

  constructor() {
    this.camoufoxManager = new CamoufoxManager();
    this.playwrightManager = new PlaywrightStealthManager();
    this.proxyManager = new ResidentialProxyManager();
    this.apiDiscovery = new ApiDiscoveryEngine();
    this.prisma = new PrismaClient();
    this.logger = new Logger('EcommerceScraperWorker');
    this.initializeRetailerProcessors();
    this.startMemoryMonitoring();
  }

  private startMemoryMonitoring() {
    this.memoryMonitorInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
      const heapTotalMB = memUsage.heapTotal / 1024 / 1024;
      const externalMB = memUsage.external / 1024 / 1024;

      this.logger.debug(`Memory - Heap: ${heapUsedMB.toFixed(1)}/${heapTotalMB.toFixed(1)}MB, External: ${externalMB.toFixed(1)}MB`);

      // Check if we should trigger GC
      const totalMemory = 36 * 1024; // 36GB in MB
      const usagePercent = (heapUsedMB / totalMemory) * 100;

      if (usagePercent > 25 &&
          global.gc &&
          Date.now() - this.lastGCTime > this.gcMinInterval) {

        this.logger.info(`High memory usage (${usagePercent.toFixed(1)}%), triggering GC`);
        global.gc();
        this.lastGCTime = Date.now();
      }
    }, 5000); // Check every 5 seconds
  }

  private initializeRetailerProcessors() {
    // Load retailer-specific processors
    const retailers = ['amazon', 'target', 'walmart'];
    retailers.forEach(retailer => {
      const processor = RetailerProcessorFactory.create(retailer);
      this.retailerProcessors.set(retailer, processor);
    });
  }

  async processUrl(job: Job) {
    const { url, urlId, retailer, productId } = job.data;
    const startTime = Date.now();

    // Determine retailer from URL if not provided
    const detectedRetailer = retailer || this.detectRetailer(url);

    // Get or create circuit breaker for retailer
    if (!this.retailerCircuits.has(detectedRetailer)) {
      this.retailerCircuits.set(detectedRetailer, new CircuitBreaker({
        name: `retailer-${detectedRetailer}`,
        threshold: 5, // Lower threshold for e-commerce
        timeout: 600000 // 10 minutes
      }));
    }

    const circuit = this.retailerCircuits.get(detectedRetailer)!;

    let browserInstance;
    let proxySession;
    let page;

    try {
      // Execute within circuit breaker
      await circuit.execute(async () => {
        // Update URL status
        await this.prisma.scrapedUrl.update({
          where: { id: urlId },
          data: {
            status: 'PROCESSING',
            retryCount: { increment: job.attemptsMade > 0 ? 1 : 0 }
          }
        });

        // First, try to use discovered API endpoints
        const apiResult = await this.tryApiApproach(url, detectedRetailer, productId);
        if (apiResult.success) {
          await this.saveApiResult(urlId, apiResult.data, detectedRetailer);
          return;
        }

        // Get proxy session for retailer
        proxySession = await this.proxyManager.getProxy({
          retailer: detectedRetailer,
          sticky: true // Use sticky session for PDP
        });

        // Get browser instance with Camoufox
        try {
          const camoufoxResult = await this.camoufoxManager.getBrowser(detectedRetailer);
          browserInstance = camoufoxResult.browser;
          page = camoufoxResult.page;
        } catch (camoufoxError) {
          this.logger.warn('Camoufox failed, falling back to Playwright', camoufoxError);
          // Fallback to Playwright with stealth
          const playwrightResult = await this.playwrightManager.getBrowser(detectedRetailer);
          browserInstance = playwrightResult.browser;
          page = playwrightResult.page;
        }

        // Configure proxy for page
        const proxyUrl = await this.proxyManager.getProxyUrl(proxySession.proxy);
        await page.context().setProxy({ server: proxyUrl });

        // Apply retailer-specific navigation strategy
        const processor = this.retailerProcessors.get(detectedRetailer);
        const navigationResult = await processor.navigate(page, url);

        // Check for blocks/captchas
        const blocked = await this.checkForBlocking(page, detectedRetailer);
        if (blocked.isBlocked) {
          throw new Error(`Blocked: ${blocked.reason}`);
        }

        // Extract product data using retailer-specific logic
        const productData = await processor.extractProduct(page);

        // Validate extracted data
        if (!this.validateProductData(productData, detectedRetailer)) {
          throw new Error('Invalid product data extracted');
        }

        // Save product data
        await this.saveProductData(urlId, productData, detectedRetailer);

        // Record successful proxy usage
        await this.proxyManager.recordUsage(proxySession.sessionId, {
          success: true,
          statusCode: 200,
          responseTime: Date.now() - startTime,
          bytesTransferred: JSON.stringify(productData).length
        });

        this.logger.info(`Successfully scraped ${url} in ${Date.now() - startTime}ms`);
      });

    } catch (error) {# Enhanced E-commerce Web Scraping System Implementation Plan v3
## Apple Mac Studio M4 Max - Anti-Detection Optimized Architecture

## Executive Summary

This implementation plan provides a complete blueprint for building a production-ready e-commerce scraping system capable of processing 50,000 PDP (Product Detail Page) URLs daily from major retailers like Target, Amazon, and Walmart using your Apple Mac Studio M4 Max (36GB RAM). The system leverages PM2 process management, Camoufox (Firefox-based anti-detection browser) with Playwright fallback, TypeScript throughout, Node.js 22, Prisma ORM with optimized partitioning, Next.js 15 dashboard, premium residential proxy rotation, and pnpm 10 workspace architecture.

## System Overview

### Target Specifications
- **Daily Volume**: 50,000 PDP URLs (with burst capability to 75,000)
- **Target Sites**: Major e-commerce retailers (Amazon, Target, Walmart, etc.)
- **Concurrent Workers**: 4-6 browser instances (optimized for anti-detection)
- **Hardware**: Apple Mac Studio M4 Max (14-core CPU, 32-core GPU, 36GB unified memory)
- **Resource Limit**: 30% of total system resources
- **Success Rate Target**: >95% (accounting for sophisticated anti-bot systems)
- **Average Processing Time**: 2-8 seconds per URL (including anti-detection measures)
- **Proxy Infrastructure**: Premium residential proxies with intelligent rotation
- **Primary Browser**: Camoufox (Firefox-based anti-detection)
- **Fallback Strategy**: Camoufox → Playwright with stealth → Direct API

### Enhanced Architecture for E-commerce
````

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ │ Next.js 15 │────▶│ Redis/BullMQ
│◀────│ PM2 Workers │ │ Dashboard │ │ Job Queue │ │ (4-6 instances)│ └─────────────────┘
└─────────────────┘ └─────────────────┘ │ │ │ │ ┌────────┴────────┐ │ │ │ Circuit Breaker │ │ │ │
(Per Domain) │ │ │ └────────┬────────┘ │ │ │ │ │ ┌────────┴────────┐ │ │ │ API Discovery │ │ │ │
Engine │ │ │ └────────┬────────┘ │ │ │ │ └───────────────┬───────┴────────────────────────┘ │
┌──────▼──────┐ ┌─────────────────┐ │ PostgreSQL │◀───────│Premium Proxy │ │ (Partitioned)│
│Manager (Resi) │ └──────────────┘ └─────────────────┘

```

## Complete Project Structure

```

web-scraper-system/ ├── .env.example ├── .gitignore ├── docker-compose.yml ├── ecosystem.config.js
├── package.json ├── pnpm-lock.yaml ├── pnpm-workspace.yaml ├── tsconfig.base.json ├── packages/ │
├── shared/ │ │ ├── src/ │ │ │ ├── types/ │ │ │ │ ├── index.ts │ │ │ │ ├── scraping.types.ts │ │ │ │
├── queue.types.ts │ │ │ │ ├── proxy.types.ts │ │ │ │ └── ecommerce.types.ts │ │ │ ├── utils/ │ │ │
│ ├── logger.ts │ │ │ │ ├── metrics.ts │ │ │ │ ├── helpers.ts │ │ │ │ ├── circuit-breaker.ts │ │ │ │
├── retry-strategies.ts │ │ │ │ └── rate-limiter.ts │ │ │ ├── constants/ │ │ │ │ ├── index.ts │ │ │
│ └── retailer-configs.ts │ │ │ └── anti-detection/ │ │ │ ├── fingerprint-generator.ts │ │ │ └──
behavior-simulator.ts │ │ ├── package.json │ │ └── tsconfig.json │ ├── database/ │ │ ├── prisma/ │ │
│ ├── schema.prisma │ │ │ ├── migrations/ │ │ │ └── partitions/ │ │ │ └── setup-partitions.sql │ │
├── src/ │ │ │ ├── client.ts │ │ │ ├── services/ │ │ │ │ ├── url.service.ts │ │ │ │ ├──
product.service.ts │ │ │ │ ├── error.service.ts │ │ │ │ ├── proxy.service.ts │ │ │ │ ├──
session.service.ts │ │ │ │ └── api-endpoint.service.ts │ │ │ └── index.ts │ │ ├── package.json │ │
└── tsconfig.json │ ├── scraper/ │ │ ├── src/ │ │ │ ├── index.ts │ │ │ ├── worker.ts │ │ │ ├──
browser/ │ │ │ │ ├── camoufox-manager.ts │ │ │ │ ├── playwright-stealth-manager.ts │ │ │ │ ├──
browser-pool.ts │ │ │ │ ├── anti-detection-config.ts │ │ │ │ ├── cookie-manager.ts │ │ │ │ └──
resource-blocker.ts │ │ │ ├── proxy/ │ │ │ │ ├── residential-proxy-manager.ts │ │ │ │ ├──
proxy-rotator.ts │ │ │ │ ├── proxy-health.ts │ │ │ │ └── geo-targeting.ts │ │ │ ├── queue/ │ │ │ │
├── queue-manager.ts │ │ │ │ ├── job-processor.ts │ │ │ │ ├── retry-handler.ts │ │ │ │ └──
rate-limit-manager.ts │ │ │ ├── processors/ │ │ │ │ ├── base.processor.ts │ │ │ │ ├──
pdp.processor.ts │ │ │ │ ├── api.processor.ts │ │ │ │ ├── content-type-detector.ts │ │ │ │ └──
product-extractor.ts │ │ │ ├── retailers/ │ │ │ │ ├── base-retailer.ts │ │ │ │ ├── amazon/ │ │ │ │ │
├── amazon.processor.ts │ │ │ │ │ └── amazon.api-discovery.ts │ │ │ │ ├── target/ │ │ │ │ │ ├──
target.processor.ts │ │ │ │ │ └── target.api-discovery.ts │ │ │ │ └── walmart/ │ │ │ │ ├──
walmart.processor.ts │ │ │ │ └── walmart.api-discovery.ts │ │ │ ├── validation/ │ │ │ │ ├──
product-validator.ts │ │ │ │ └── data-deduplicator.ts │ │ │ └── monitoring/ │ │ │ ├──
metrics-collector.ts │ │ │ ├── health-check.ts │ │ │ ├── captcha-detector.ts │ │ │ └──
block-detector.ts │ │ ├── package.json │ │ └── tsconfig.json │ └── dashboard/ │ ├── app/ │ │ ├──
layout.tsx │ │ ├── page.tsx │ │ ├── dashboard/ │ │ │ ├── layout.tsx │ │ │ ├── page.tsx │ │ │ └──
components/ │ │ └── api/ │ │ ├── metrics/ │ │ ├── queue/ │ │ ├── proxy/ │ │ └── retailers/ │ ├──
components/ │ │ ├── real-time-metrics.tsx │ │ ├── queue-status.tsx │ │ ├── worker-health.tsx │ │ ├──
proxy-status.tsx │ │ ├── circuit-breaker-status.tsx │ │ ├── retailer-performance.tsx │ │ └──
captcha-alerts.tsx │ ├── lib/ │ │ ├── redis.ts │ │ └── prisma.ts │ ├── next.config.ts │ ├──
package.json │ └── tsconfig.json ├── scripts/ │ ├── setup.sh │ ├── deploy.sh │ ├── health-check.js │
├── optimize-macos.sh │ ├── warm-browser-pool.js │ ├── test-retailers.js │ └── api-discovery.js ├──
logs/ └── data/

````

## Enhanced Memory Allocation Plan for E-commerce Scraping

### Total System Memory: 36GB
- **Application Allocation**: 26GB (72%)
- **System Reserve**: 10GB (28%)

### E-commerce Optimized Memory Distribution

| Component | Memory Allocation | Details |
|-----------|------------------|---------|
| Camoufox Browser Pool | 11GB | 4 instances × 2.75GB each (Firefox-based) |
| Playwright Stealth Pool | 2GB | 2 instances × 1GB (fallback) |
| Node.js Workers | 3GB | 6 workers × 500MB heap |
| PM2 Overhead | 500MB | Process management + monitoring |
| BullMQ/Redis | 3GB | Queue management + caching |
| PostgreSQL | 3GB | Connection pool + JSONB operations |
| Residential Proxy Manager | 1.5GB | Proxy rotation + session management |
| Next.js Dashboard | 1GB | SSR + real-time updates |
| API Discovery Cache | 500MB | Discovered endpoints + patterns |
| Buffer/Overhead | 2.5GB | Memory spikes + garbage collection |
| **Total** | **26GB** | **72% of system memory** |

## Phase-by-Phase Implementation Guide

### Phase 1: Foundation Setup (Days 1-3)

#### Day 1: Environment Setup
```bash
# 1. Install system dependencies
brew install redis postgresql@15 node@22 pnpm

# 2. Configure system limits (run optimize-macos.sh)
./scripts/optimize-macos.sh

# 3. Initialize project with enhanced structure
mkdir web-scraper-system && cd web-scraper-system
pnpm init

# 4. Setup environment variables
cp .env.example .env
# Configure DATABASE_URL, REDIS_URL, PROXY_SERVICE_URL, etc.
````

#### Day 2: Enhanced Project Structure

```bash
# Create workspace configuration
cat > pnpm-workspace.yaml <<EOF
packages:
  - 'packages/*'
EOF

# Initialize all packages
for pkg in shared database scraper dashboard; do
  mkdir -p packages/$pkg
  cd packages/$pkg && pnpm init -y
  cd ../..
done

# Setup Next.js with latest features
cd packages/dashboard
pnpx create-next-app@latest . --typescript --tailwind --app
```

#### Day 3: Enhanced TypeScript Configuration

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "incremental": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "paths": {
      "@scraper/shared/*": ["./packages/shared/src/*"],
      "@scraper/database/*": ["./packages/database/src/*"]
    }
  }
}
```

### Phase 2: Core Infrastructure with Enhancements (Days 4-7)

#### Day 4: Enhanced Database Schema with Partitioning

```prisma
// packages/database/prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model ScrapedUrl {
  id              String      @id @default(cuid())
  url             String      @unique
  domain          String
  status          UrlStatus   @default(PENDING)
  httpStatusCode  Int?
  lastScrapedAt   DateTime?
  nextScrapeAt    DateTime?
  scrapeCount     Int         @default(0)
  retryCount      Int         @default(0)
  priority        Int         @default(0)
  contentType     String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  content         PageContent?
  errors          ScrapeError[]
  metrics         ScrapeMetrics[]
  sessions        SessionData[]

  @@index([status, nextScrapeAt])
  @@index([domain, status])
  @@index([priority, status])
  @@index([contentType])
}

model PageContent {
  id              String      @id @default(cuid())
  htmlContent     String?     @db.Text
  textContent     String?     @db.Text
  compressedHtml  Bytes?      // Compressed HTML for storage efficiency
  title           String?
  contentHash     String      @unique
  extractedData   Json?
  validatedData   Json?       // Post-validation clean data
  extractedAt     DateTime    @default(now())

  urlId           String      @unique
  url             ScrapedUrl  @relation(fields: [urlId], references: [id])

  @@index([contentHash])
  @@index([extractedAt])
}

model ProxyServer {
  id              String      @id @default(cuid())
  endpoint        String      @unique
  type            ProxyType
  username        String?
  password        String?
  location        String?
  isActive        Boolean     @default(true)
  successRate     Float       @default(100.0)
  avgResponseTime Int         @default(0)
  lastUsedAt      DateTime?
  lastHealthCheck DateTime    @default(now())
  failureCount    Int         @default(0)

  usageLogs       ProxyUsageLog[]

  @@index([type, isActive])
  @@index([successRate])
}

model ProxyUsageLog {
  id              String      @id @default(cuid())
  proxyId         String
  proxy           ProxyServer @relation(fields: [proxyId], references: [id])
  domain          String
  statusCode      Int?
  responseTime    Int         // milliseconds
  bytesTransferred Int
  success         Boolean
  errorMessage    String?
  usedAt          DateTime    @default(now())

  @@index([proxyId, usedAt])
  @@index([domain, usedAt])
}

model SessionData {
  id              String      @id @default(cuid())
  urlId           String
  url             ScrapedUrl  @relation(fields: [urlId], references: [id])
  cookies         Json
  localStorage    Json?
  sessionStorage  Json?
  createdAt       DateTime    @default(now())
  expiresAt       DateTime

  @@index([urlId])
  @@index([expiresAt])
}

model ScrapeError {
  id              String      @id @default(cuid())
  errorType       String
  errorMessage    String
  stackTrace      String?
  retryable       Boolean     @default(true)
  retryStrategy   String?     // Strategy used for retry
  occurredAt      DateTime    @default(now())

  urlId           String
  url             ScrapedUrl  @relation(fields: [urlId], references: [id])

  @@index([errorType, occurredAt])
  @@index([urlId, occurredAt])
}

model ScrapeMetrics {
  id              String      @id @default(cuid())
  duration        Int         // milliseconds
  memoryUsed      Int         // MB
  cpuUsage        Float
  bandwidthUsed   Int         // KB
  browserType     String      // hero or playwright
  proxyUsed       String?
  recordedAt      DateTime    @default(now())

  urlId           String
  url             ScrapedUrl  @relation(fields: [urlId], references: [id])

  @@index([recordedAt])
  @@index([urlId, recordedAt])
}

model CircuitBreakerState {
  id              String      @id @default(cuid())
  serviceName     String      @unique
  state           String      // CLOSED, OPEN, HALF_OPEN
  failureCount    Int         @default(0)
  lastFailureAt   DateTime?
  nextRetryAt     DateTime?
  updatedAt       DateTime    @updatedAt

  @@index([state])
}

enum UrlStatus {
  PENDING
  QUEUED
  PROCESSING
  COMPLETED
  FAILED
  RATE_LIMITED
  BLOCKED
  SKIPPED      // For non-scrapeable content types
}

enum ProxyType {
  RESIDENTIAL
  DATACENTER
  MOBILE
}
```

```sql
-- packages/database/prisma/partitions/setup-partitions.sql
-- Create partitioned tables for high-volume data

-- Partition ScrapeMetrics by month
CREATE TABLE IF NOT EXISTS "ScrapeMetrics_2025_01" PARTITION OF "ScrapeMetrics"
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE IF NOT EXISTS "ScrapeMetrics_2025_02" PARTITION OF "ScrapeMetrics"
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Add more partitions as needed...

-- Create indexes on partitions
CREATE INDEX idx_metrics_2025_01_recorded ON "ScrapeMetrics_2025_01" (recordedAt);
CREATE INDEX idx_metrics_2025_02_recorded ON "ScrapeMetrics_2025_02" (recordedAt);

-- Automated partition management function
CREATE OR REPLACE FUNCTION create_monthly_partition()
RETURNS void AS $$
DECLARE
    partition_date DATE;
    partition_name TEXT;
BEGIN
    partition_date := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month');
    partition_name := 'ScrapeMetrics_' || TO_CHAR(partition_date, 'YYYY_MM');

    EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF "ScrapeMetrics"
                    FOR VALUES FROM (%L) TO (%L)',
                    partition_name,
                    partition_date,
                    partition_date + INTERVAL '1 month');
END;
$$ LANGUAGE plpgsql;

-- Schedule monthly partition creation
SELECT cron.schedule('create-partitions', '0 0 1 * *', 'SELECT create_monthly_partition()');
```

#### Day 5: Enhanced Browser Management with Fallback

```typescript
// packages/scraper/src/browser/browser-pool.ts
import { EventEmitter } from 'events';
import { HeroManager } from './hero-manager';
import { PlaywrightManager } from './playwright-manager';
import { Logger } from '@scraper/shared/utils/logger';
import { CircuitBreaker } from '@scraper/shared/utils/circuit-breaker';

export interface BrowserInstance {
  id: string;
  type: 'hero' | 'playwright';
  browser: any;
  requestCount: number;
  createdAt: Date;
  lastUsedAt: Date;
  memoryUsage: number;
}

export class BrowserPool extends EventEmitter {
  private heroManager: HeroManager;
  private playwrightManager: PlaywrightManager;
  private heroCircuit: CircuitBreaker;
  private logger = new Logger('BrowserPool');
  private warmupInterval: NodeJS.Timer;

  constructor() {
    super();
    this.heroManager = new HeroManager();
    this.playwrightManager = new PlaywrightManager();

    // Circuit breaker for Hero with fallback to Playwright
    this.heroCircuit = new CircuitBreaker({
      name: 'hero-browser',
      threshold: 5,
      timeout: 60000,
      onOpen: () => this.logger.warn('Hero circuit opened, using Playwright'),
    });

    this.startWarmup();
  }

  async getBrowser(
    options: { preferredType?: 'hero' | 'playwright' } = {}
  ): Promise<BrowserInstance> {
    try {
      // Try Hero first unless circuit is open
      if (options.preferredType !== 'playwright' && !this.heroCircuit.isOpen()) {
        return await this.heroCircuit.execute(async () => {
          const hero = await this.heroManager.getHero();
          return {
            id: crypto.randomUUID(),
            type: 'hero' as const,
            browser: hero,
            requestCount: 0,
            createdAt: new Date(),
            lastUsedAt: new Date(),
            memoryUsage: 0,
          };
        });
      }
    } catch (error) {
      this.logger.warn('Hero browser failed, falling back to Playwright', error);
    }

    // Fallback to Playwright
    const playwright = await this.playwrightManager.getBrowser();
    return {
      id: crypto.randomUUID(),
      type: 'playwright' as const,
      browser: playwright,
      requestCount: 0,
      createdAt: new Date(),
      lastUsedAt: new Date(),
      memoryUsage: 0,
    };
  }

  async releaseBrowser(instance: BrowserInstance): Promise<void> {
    if (instance.type === 'hero') {
      await this.heroManager.releaseHero(instance.browser);
    } else {
      await this.playwrightManager.releaseBrowser(instance.browser);
    }
  }

  private startWarmup(): void {
    // Pre-warm browser pool during low activity
    this.warmupInterval = setInterval(async () => {
      const metrics = await this.getPoolMetrics();
      if (metrics.totalActive < 5) {
        this.logger.debug('Pre-warming browser pool');
        // Pre-initialize a browser
        const instance = await this.getBrowser();
        setTimeout(() => this.releaseBrowser(instance), 30000);
      }
    }, 60000); // Every minute
  }

  async getPoolMetrics() {
    const [heroMetrics, playwrightMetrics] = await Promise.all([
      this.heroManager.getMetrics(),
      this.playwrightManager.getMetrics(),
    ]);

    return {
      totalActive: heroMetrics.active + playwrightMetrics.active,
      heroActive: heroMetrics.active,
      playwrightActive: playwrightMetrics.active,
      heroHealth: !this.heroCircuit.isOpen(),
    };
  }

  async cleanup(): Promise<void> {
    clearInterval(this.warmupInterval);
    await Promise.all([this.heroManager.cleanup(), this.playwrightManager.cleanup()]);
  }
}
```

````typescript
// packages/scraper/src/browser/playwright-stealth-manager.ts
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { Logger } from '@scraper/shared/utils/logger';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Apply stealth plugin
puppeteerExtra.use(StealthPlugin());

export class PlaywrightStealthManager {
  private browsers: Map<string, Browser> = new Map();
  private contexts: Map<string, BrowserContext> = new Map();
  private logger = new Logger('PlaywrightStealthManager');
  private maxBrowsers = 2;

  async getBrowser(retailer?: string): Promise<{ browser: Browser; page: Page }> {
    const browserId = await this.getOrCreateBrowser();
    const context = await this.createStealthContext(browserId, retailer);
    const page = await context.newPage();

    // Apply additional stealth measures
    await this.applyStealthMeasures(page);

    return { browser: this.browsers.get(browserId)!, page };
  }

  private async getOrCreateBrowser(): Promise<string> {
    // Reuse existing browser if available
    for (const [id, browser] of this.browsers) {
      if (browser.isConnected() && this.browsers.size < this.maxBrowsers) {
        return id;
      }
    }

    // Create new browser with stealth
    const id = crypto.randomUUID();
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--memory-pressure-off',
        // Additional stealth args
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--enable-features=NetworkService,NetworkServiceInProcess',
        '--disable-features=VizDisplayCompositor',
        '--disable-features=RendererCodeIntegrity',
        '--disable-features=IsolateOrigins',
        '--disable-blink-features=AutomationControlled',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    this.browsers.set(id, browser);
    return id;
  }

  private async createStealthContext(browserId: string, retailer?: string): Promise<BrowserContext> {
    const browser = this.browsers.get(browserId)!;

    // Generate fingerprint data
    const fingerprint = this.generateFingerprint();

    const context = await browser.newContext({
      viewport: {
        width: fingerprint.viewport.width,
        height: fingerprint.viewport.height
      },
      userAgent: fingerprint.userAgent,
      locale: fingerprint.locale,
      timezoneId: fingerprint.timezone,
      deviceScaleFactor: fingerprint.deviceScaleFactor,
      isMobile: false,
      hasTouch: false,
      permissions: [],
      geolocation: fingerprint.geolocation,
      extraHTTPHeaders: {
        'Accept-Language': fingerprint.acceptLanguage,
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    // Apply context-level stealth
    await this.applyContextStealth(context, fingerprint);

    const contextId = crypto.randomUUID();
    this.contexts.set(contextId, context);
    return context;
  }

  private async applyContextStealth(context: BrowserContext, fingerprint: any): Promise<void> {
    // Override navigator properties
    await context.addInitScript(() => {
      // Remove webdriver property
      delete navigator.__proto__.webdriver;

      // Override permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) => {
        // Reject all permissions like a privacy-conscious user
        return Promise.resolve({
          state: 'denied',
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => true
        });
      };

      // Mock plugins with realistic data
      Object.defineProperty(navigator, 'plugins', {
        get: () => {
          const PluginArray = window.PluginArray || Array;
          const plugins = new PluginArray();

          const plugin = {
            name: 'Chrome PDF Plugin',
            description: 'Portable Document Format',
            filename: 'internal-pdf-viewer',
            length: 1,
            item: (i: number) => i === 0 ? plugin : null,
            namedItem: (name: string) => name === 'Chrome PDF Plugin' ? plugin : null,
            [0]: {
              type: 'application/pdf',
              suffixes: 'pdf',
              description: 'Portable Document Format',
              enabledPlugin: plugin
            }
          };

          plugins[0] = plugin;
          plugins.length = 1;
          return plugins;
        }
      });

      // Mock chrome object
      if (!window.chrome) {
        window.chrome = {
          app: {
            isInstalled: false,
            InstallState: {
              DISABLED: 'disabled',
              INSTALLED: 'installed',
              NOT_INSTALLED: 'not_installed'
            },
            RunningState: {
              CANNOT_RUN: 'cannot_run',
              READY_TO_RUN: 'ready_to_run',
              RUNNING: 'running'
            }
          },
          runtime: {
            PlatformOs: {
              MAC: 'mac',
              WIN: 'win',
              ANDROID: 'android',
              CROS: 'cros',
              LINUX: 'linux',
              OPENBSD: 'openbsd'
            },
            PlatformArch: {
              ARM: 'arm',
              X86_32: 'x86-32',
              X86_64: 'x86-64',
              MIPS: 'mips',
              MIPS64: 'mips64'
            },
            RequestUpdateCheckStatus: {
              THROTTLED: 'throttled',
              NO_UPDATE: 'no_update',
              UPDATE_AVAILABLE: 'update_available'
            },
            connect: () => {},
            sendMessage: () => {}
          }
        };
      }

      // Spoof WebGL vendor and renderer
      const getParameter = WebGLRenderingContext.prototype.getParameter;
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Intel Inc.';
        if (parameter === 37446) return 'Intel(R) Iris(TM) Graphics 6100';
        return getParameter.apply(this, arguments);
      };

      // Override toString to hide modifications
      const nativeToString = Function.prototype.toString;
      Function.prototype.toString = function() {
        if (this === window.navigator.permissions.query) {
          return 'function query() { [native code] }';
        }
        if (this === WebGLRenderingContext.prototype.getParameter) {
          return 'function getParameter() { [native code] }';
        }
        return nativeToString.apply(this, arguments);
      };
    });
  }

  private async applyStealthMeasures(page: Page): Promise<void> {
    // Emulate human behavior patterns
    await page.evaluateOnNewDocument(() => {
      // Random mouse movements
      let mouseX = 400;
      let mouseY = 400;

      const mouseMoveHandler = () => {
        const event = new MouseEvent('mousemove', {
          clientX: mouseX + (Math.random() - 0.5) * 20,
          clientY: mouseY + (Math.random() - 0.5) * 20,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(event);
      };

      // Trigger random mouse movements
      setInterval(mouseMoveHandler, 3000 + Math.random() * 5000);

      // Simulate keyboard activity
      const keys = ['Shift', 'Control', 'Alt', 'Meta'];
      setInterval(() => {
        const key = keys[Math.floor(Math.random() * keys.length)];
        const event = new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          cancelable: true
        });
        document.dispatchEvent(event);

        setTimeout(() => {
          const upEvent = new KeyboardEvent('keyup', {
            key,
            bubbles: true,
            cancelable: true
          });
          document.dispatchEvent(upEvent);
        }, 100 + Math.random() * 200);
      }, 10000 + Math.random() * 20000);
    });
  }

  private generateFingerprint(): any {
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1536, height: 864 },
      { width: 1440, height: 900 }
    ];

    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];

    const timezones = [
      'America/New_York',
      'America/Chicago',
      'America/Los_Angeles',
      'America/Denver'
    ];

    const viewport = viewports[Math.floor(Math.random() * viewports.length)];

    return {
      viewport,
      userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
      locale: 'en-US',
      timezone: timezones[Math.floor(Math.random() * timezones.length)],
      deviceScaleFactor: 1,
      acceptLanguage: 'en-US,en;q=0.9',
      geolocation: {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1
      }
    };
  }

  async releasePage(page: Page): Promise<void> {
    try {
      await page.close();
    } catch (error) {
      this.logger.error('Error closing page', error);
    }
  }

  async getMetrics() {
    return {
      active: this.contexts.size,
      browsers: this.browsers.size
    };
  }

  async cleanup(): Promise<void> {
    for (const context of this.contexts.values()) {
      await context.close().catch(() => {});
    }
    for (const browser of this.browsers.values()) {
      await browser.close().catch(() => {});
    }
    this.contexts.clear();
    this.browsers.clear();
  }
}
```Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });

      // Mock permissions
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) => {
        return parameters.name === 'notifications'
          ? Promise.resolve({ state: 'denied' } as any)
          : originalQuery(parameters);
      };
    });
  }

  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  async releaseBrowser(page: Page): Promise<void> {
    try {
      await page.close();
    } catch (error) {
      this.logger.error('Error closing page', error);
    }
  }

  async getMetrics() {
    return {
      active: this.contexts.size,
      browsers: this.browsers.size
    };
  }

  async cleanup(): Promise<void> {
    for (const context of this.contexts.values()) {
      await context.close().catch(() => {});
    }
    for (const browser of this.browsers.values()) {
      await browser.close().catch(() => {});
    }
    this.contexts.clear();
    this.browsers.clear();
  }
}
````

#### Day 6: Premium Residential Proxy Management System

```typescript
// packages/scraper/src/proxy/residential-proxy-manager.ts
import { PrismaClient, ProxyServer, ProxyType } from '@scraper/database';
import { Logger } from '@scraper/shared/utils/logger';
import { EventEmitter } from 'events';
import axios from 'axios';

interface ProxyProvider {
  name: 'oxylabs' | 'smartproxy' | 'brightdata';
  endpoint: string;
  apiKey: string;
  weight: number; // Distribution percentage
}

interface RetailerProxyConfig {
  retailer: string;
  requiredLocation?: string;
  sessionDuration: number; // minutes
  rotationInterval: number; // requests
  providers: ProxyProvider[];
}

export class ResidentialProxyManager extends EventEmitter {
  private prisma: PrismaClient;
  private logger = new Logger('ResidentialProxyManager');
  private activeProxies: Map<string, ProxyServer> = new Map();
  private sessions: Map<string, any> = new Map();
  private providers: ProxyProvider[];
  private retailerConfigs: Map<string, RetailerProxyConfig>;

  constructor() {
    super();
    this.prisma = new PrismaClient();
    this.providers = this.loadProviders();
    this.retailerConfigs = this.loadRetailerConfigs();
    this.initialize();
  }

  private loadProviders(): ProxyProvider[] {
    return [
      {
        name: 'oxylabs',
        endpoint: process.env.OXYLABS_ENDPOINT!,
        apiKey: process.env.OXYLABS_API_KEY!,
        weight: 0.6, // 60% of traffic
      },
      {
        name: 'smartproxy',
        endpoint: process.env.SMARTPROXY_ENDPOINT!,
        apiKey: process.env.SMARTPROXY_API_KEY!,
        weight: 0.3, // 30% of traffic
      },
      {
        name: 'brightdata',
        endpoint: process.env.BRIGHTDATA_ENDPOINT!,
        apiKey: process.env.BRIGHTDATA_API_KEY!,
        weight: 0.1, // 10% backup
      },
    ];
  }

  private loadRetailerConfigs(): Map<string, RetailerProxyConfig> {
    const configs = new Map();

    configs.set('amazon', {
      retailer: 'amazon',
      requiredLocation: 'us',
      sessionDuration: 15, // 15 minutes sticky session
      rotationInterval: 10, // Rotate every 10 requests
      providers: this.providers,
    });

    configs.set('target', {
      retailer: 'target',
      requiredLocation: 'us',
      sessionDuration: 10,
      rotationInterval: 5, // More aggressive rotation
      providers: this.providers,
    });

    configs.set('walmart', {
      retailer: 'walmart',
      requiredLocation: 'us',
      sessionDuration: 20,
      rotationInterval: 15,
      providers: this.providers.filter((p) => p.name !== 'brightdata'), // Walmart blocks some providers
    });

    return configs;
  }

  async getProxy(options: {
    retailer: string;
    sessionId?: string;
    location?: string;
    sticky?: boolean;
  }): Promise<{ proxy: ProxyServer; sessionId: string }> {
    const config = this.retailerConfigs.get(options.retailer) || this.getDefaultConfig();

    // Check for existing session
    if (options.sessionId && this.sessions.has(options.sessionId)) {
      const session = this.sessions.get(options.sessionId);
      if (this.isSessionValid(session, config)) {
        session.requestCount++;
        return { proxy: session.proxy, sessionId: options.sessionId };
      }
    }

    // Select provider based on weights
    const provider = this.selectProvider(config.providers);

    // Get proxy from provider
    const proxy = await this.requestProxyFromProvider(provider, {
      location: options.location || config.requiredLocation,
      sticky: options.sticky !== false,
    });

    // Create session
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      proxy,
      provider: provider.name,
      createdAt: new Date(),
      requestCount: 1,
      retailer: options.retailer,
    };

    this.sessions.set(sessionId, session);

    // Store in database
    await this.storeProxy(proxy, provider.name);

    return { proxy, sessionId };
  }

  private selectProvider(providers: ProxyProvider[]): ProxyProvider {
    const random = Math.random();
    let cumulative = 0;

    for (const provider of providers) {
      cumulative += provider.weight;
      if (random < cumulative) {
        return provider;
      }
    }

    return providers[0]; // Fallback
  }

  private async requestProxyFromProvider(
    provider: ProxyProvider,
    options: { location?: string; sticky?: boolean }
  ): Promise<ProxyServer> {
    try {
      let endpoint: string;
      let auth: any;

      switch (provider.name) {
        case 'oxylabs':
          endpoint = `${provider.endpoint}/proxy`;
          auth = {
            username: `customer-${provider.apiKey}`,
            password: 'pr_password',
            country: options.location || 'us',
            session: options.sticky ? Math.random().toString(36) : undefined,
          };
          break;

        case 'smartproxy':
          endpoint = provider.endpoint;
          auth = {
            username: `${provider.apiKey}-country-${options.location || 'us'}`,
            password: 'password',
            session: options.sticky ? `session-${Date.now()}` : undefined,
          };
          break;

        case 'brightdata':
          endpoint = provider.endpoint;
          auth = {
            username: `${provider.apiKey}-country-${options.location || 'us'}`,
            password: 'password',
          };
          break;
      }

      // Create proxy object
      const proxy: ProxyServer = {
        id: crypto.randomUUID(),
        endpoint,
        type: ProxyType.RESIDENTIAL,
        username: auth.username,
        password: auth.password,
        location: options.location || 'us',
        isActive: true,
        successRate: 100,
        avgResponseTime: 0,
        lastUsedAt: new Date(),
        lastHealthCheck: new Date(),
        failureCount: 0,
        usageLogs: [],
      };

      return proxy;
    } catch (error) {
      this.logger.error(`Failed to get proxy from ${provider.name}`, error);
      throw error;
    }
  }

  private isSessionValid(session: any, config: RetailerProxyConfig): boolean {
    const now = Date.now();
    const sessionAge = now - session.createdAt.getTime();

    // Check session duration
    if (sessionAge > config.sessionDuration * 60 * 1000) {
      return false;
    }

    // Check rotation interval
    if (session.requestCount >= config.rotationInterval) {
      return false;
    }

    return true;
  }

  async recordUsage(
    sessionId: string,
    result: {
      success: boolean;
      statusCode?: number;
      responseTime: number;
      bytesTransferred: number;
      errorMessage?: string;
      blocked?: boolean;
      captcha?: boolean;
    }
  ) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Record in database
    await this.prisma.proxyUsageLog.create({
      data: {
        proxyId: session.proxy.id,
        domain: session.retailer,
        success: result.success,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        bytesTransferred: result.bytesTransferred,
        errorMessage: result.errorMessage,
      },
    });

    // Update proxy statistics
    if (!result.success) {
      session.proxy.failureCount++;

      // Handle specific failures
      if (result.blocked || result.captcha) {
        this.logger.warn(`Proxy blocked on ${session.retailer}: ${session.proxy.endpoint}`);
        this.emit('proxy:blocked', {
          sessionId,
          retailer: session.retailer,
          provider: session.provider,
          reason: result.captcha ? 'captcha' : 'blocked',
        });

        // Remove session to force rotation
        this.sessions.delete(sessionId);
      }
    }

    // Calculate success rate
    const recentLogs = await this.prisma.proxyUsageLog.findMany({
      where: {
        proxyId: session.proxy.id,
        usedAt: { gte: new Date(Date.now() - 3600000) }, // Last hour
      },
    });

    const successCount = recentLogs.filter((log) => log.success).length;
    const successRate = recentLogs.length > 0 ? (successCount / recentLogs.length) * 100 : 100;

    session.proxy.successRate = successRate;

    // Alert if success rate drops
    if (successRate < 80) {
      this.emit('proxy:degraded', {
        provider: session.provider,
        successRate,
        retailer: session.retailer,
      });
    }
  }

  async rotateSession(sessionId: string): Promise<{ proxy: ProxyServer; sessionId: string }> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Remove old session
    this.sessions.delete(sessionId);

    // Get new proxy
    return this.getProxy({
      retailer: session.retailer,
      location: session.proxy.location,
      sticky: true,
    });
  }

  private async storeProxy(proxy: ProxyServer, provider: string): Promise<void> {
    await this.prisma.proxyServer.upsert({
      where: { endpoint: proxy.endpoint },
      update: {
        lastUsedAt: new Date(),
        isActive: true,
      },
      create: {
        endpoint: proxy.endpoint,
        type: proxy.type,
        username: proxy.username,
        password: proxy.password,
        location: proxy.location,
        isActive: true,
      },
    });
  }

  private getDefaultConfig(): RetailerProxyConfig {
    return {
      retailer: 'default',
      sessionDuration: 10,
      rotationInterval: 10,
      providers: this.providers,
    };
  }

  async getProxyUrl(proxy: ProxyServer): string {
    return `http://${proxy.username}:${proxy.password}@${proxy.endpoint}`;
  }

  async getMetrics() {
    const metrics = {
      activeSessions: this.sessions.size,
      providers: {} as any,
    };

    for (const provider of this.providers) {
      const sessions = Array.from(this.sessions.values()).filter(
        (s) => s.provider === provider.name
      );

      metrics.providers[provider.name] = {
        activeSessions: sessions.length,
        totalRequests: sessions.reduce((sum, s) => sum + s.requestCount, 0),
      };
    }

    return metrics;
  }

  async cleanup() {
    this.sessions.clear();
    await this.prisma.$disconnect();
  }
}
```

#### Day 7: Enhanced E-commerce Worker with Retailer-Specific Logic

```typescript
// packages/scraper/src/worker.ts
import { Job } from 'bullmq';
import { CamoufoxManager } from './browser/camoufox-manager';
import { PlaywrightStealthManager } from './browser/playwright-stealth-manager';
import { ResidentialProxyManager } from './proxy/residential-proxy-manager';
import { RetailerProcessorFactory } from './retailers/retailer-processor-factory';
import { ApiDiscoveryEngine } from './api-discovery/api-discovery-engine';
import { PrismaClient } from '@scraper/database';
import { Logger } from '@scraper/shared/utils/logger';
import { CircuitBreaker } from '@scraper/shared/utils/circuit-breaker';
import { RetryStrategy, getRetryStrategy } from '@scraper/shared/utils/retry-strategies';
import { createHash } from 'crypto';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);

export class EcommerceScraperWorker {
  private camoufoxManager: CamoufoxManager;
  private playwrightManager: PlaywrightStealthManager;
  private proxyManager: ResidentialProxyManager;
  private apiDiscovery: ApiDiscoveryEngine;
  private prisma: PrismaClient;
  private logger: Logger;
  private retailerCircuits: Map<string, CircuitBreaker> = new Map();
  private retailerProcessors: Map<string, any> = new Map();

  constructor() {
    this.camoufoxManager = new CamoufoxManager();
    this.playwrightManager = new PlaywrightStealthManager();
    this.proxyManager = new ResidentialProxyManager();
    this.apiDiscovery = new ApiDiscoveryEngine();
    this.prisma = new PrismaClient();
    this.logger = new Logger('EcommerceScraperWorker');
    this.initializeRetailerProcessors();
  }

  private initializeRetailerProcessors() {
    // Load retailer-specific processors
    const retailers = ['amazon', 'target', 'walmart'];
    retailers.forEach((retailer) => {
      const processor = RetailerProcessorFactory.create(retailer);
      this.retailerProcessors.set(retailer, processor);
    });
  }

  async processUrl(job: Job) {
    const { url, urlId, retailer, productId } = job.data;
    const startTime = Date.now();

    // Determine retailer from URL if not provided
    const detectedRetailer = retailer || this.detectRetailer(url);

    // Get or create circuit breaker for retailer
    if (!this.retailerCircuits.has(detectedRetailer)) {
      this.retailerCircuits.set(
        detectedRetailer,
        new CircuitBreaker({
          name: `retailer-${detectedRetailer}`,
          threshold: 5, // Lower threshold for e-commerce
          timeout: 600000, // 10 minutes
        })
      );
    }

    const circuit = this.retailerCircuits.get(detectedRetailer)!;

    let browserInstance;
    let proxySession;
    let page;

    try {
      // Execute within circuit breaker
      await circuit.execute(async () => {
        // Update URL status
        await this.prisma.scrapedUrl.update({
          where: { id: urlId },
          data: {
            status: 'PROCESSING',
            retryCount: { increment: job.attemptsMade > 0 ? 1 : 0 },
          },
        });

        // First, try to use discovered API endpoints
        const apiResult = await this.tryApiApproach(url, detectedRetailer, productId);
        if (apiResult.success) {
          await this.saveApiResult(urlId, apiResult.data, detectedRetailer);
          return;
        }

        // Get proxy session for retailer
        proxySession = await this.proxyManager.getProxy({
          retailer: detectedRetailer,
          sticky: true, // Use sticky session for PDP
        });

        // Get browser instance with Camoufox
        try {
          const camoufoxResult = await this.camoufoxManager.getBrowser(detectedRetailer);
          browserInstance = camoufoxResult.browser;
          page = camoufoxResult.page;
        } catch (camoufoxError) {
          this.logger.warn('Camoufox failed, falling back to Playwright', camoufoxError);
          // Fallback to Playwright with stealth
          const playwrightResult = await this.playwrightManager.getBrowser(detectedRetailer);
          browserInstance = playwrightResult.browser;
          page = playwrightResult.page;
        }

        // Configure proxy for page
        const proxyUrl = await this.proxyManager.getProxyUrl(proxySession.proxy);
        await page.context().setProxy({ server: proxyUrl });

        // Apply retailer-specific navigation strategy
        const processor = this.retailerProcessors.get(detectedRetailer);
        const navigationResult = await processor.navigate(page, url);

        // Check for blocks/captchas
        const blocked = await this.checkForBlocking(page, detectedRetailer);
        if (blocked.isBlocked) {
          throw new Error(`Blocked: ${blocked.reason}`);
        }

        // Extract product data using retailer-specific logic
        const productData = await processor.extractProduct(page);

        // Validate extracted data
        if (!this.validateProductData(productData, detectedRetailer)) {
          throw new Error('Invalid product data extracted');
        }

        // Save product data
        await this.saveProductData(urlId, productData, detectedRetailer);

        // Record successful proxy usage
        await this.proxyManager.recordUsage(proxySession.sessionId, {
          success: true,
          statusCode: 200,
          responseTime: Date.now() - startTime,
          bytesTransferred: JSON.stringify(productData).length,
        });

        this.logger.info(`Successfully scraped ${url} in ${Date.now() - startTime}ms`);
      });
    } catch (error) {
      this.logger.error(`Failed to scrape ${url}`, error);

      // Determine retry strategy based on error type
      const retryStrategy = this.getEcommerceRetryStrategy(error, detectedRetailer);

      // Record error
      await this.prisma.scrapeError.create({
        data: {
          urlId,
          errorType: error.constructor.name,
          errorMessage: error.message,
          stackTrace: error.stack,
          retryable: retryStrategy.shouldRetry && job.attemptsMade < job.opts.attempts,
          retryStrategy: retryStrategy.name,
        },
      });

      // Update URL status
      await this.prisma.scrapedUrl.update({
        where: { id: urlId },
        data: {
          status: job.attemptsMade >= job.opts.attempts ? 'FAILED' : 'PENDING',
        },
      });

      // Record failed proxy usage if applicable
      if (proxySession) {
        await this.proxyManager.recordUsage(proxySession.sessionId, {
          success: false,
          responseTime: Date.now() - startTime,
          bytesTransferred: 0,
          errorMessage: error.message,
          blocked: error.message.includes('Blocked'),
          captcha: error.message.includes('captcha'),
        });
      }

      // Apply retry strategy
      if (retryStrategy.shouldRetry) {
        // If blocked, rotate proxy session
        if (error.message.includes('Blocked') && proxySession) {
          await this.proxyManager.rotateSession(proxySession.sessionId);
        }

        throw Object.assign(error, {
          retryDelay: retryStrategy.delay,
        });
      }

      throw error;
    } finally {
      // CRITICAL: Release page immediately after use
      if (page) {
        try {
          // Clear any references
          page.removeAllListeners();

          // Release through manager for proper cleanup
          if (browserInstance === this.camoufoxManager) {
            await this.camoufoxManager.releasePage(page);
          } else {
            await this.playwrightManager.releasePage(page);
          }
        } catch (releaseError) {
          this.logger.error('Error releasing page', releaseError);
        }
      }

      // Force minor GC after each URL processing
      if (global.gc) {
        setImmediate(() => global.gc(true));
      }
    }
  }

  private detectRetailer(url: string): string {
    const domain = new URL(url).hostname.toLowerCase();

    if (domain.includes('amazon.com')) return 'amazon';
    if (domain.includes('target.com')) return 'target';
    if (domain.includes('walmart.com')) return 'walmart';

    // Add more retailers as needed
    return 'generic';
  }

  private async tryApiApproach(url: string, retailer: string, productId?: string): Promise<any> {
    try {
      // Check if we have discovered API endpoints for this retailer
      const apiEndpoint = await this.apiDiscovery.getEndpoint(retailer, 'product');
      if (!apiEndpoint) {
        return { success: false };
      }

      // Try to extract product ID from URL if not provided
      const pid = productId || this.extractProductId(url, retailer);
      if (!pid) {
        return { success: false };
      }

      // Make API request
      const response = await apiEndpoint.request({ productId: pid });

      if (response.data) {
        return {
          success: true,
          data: this.normalizeApiResponse(response.data, retailer),
        };
      }
    } catch (error) {
      this.logger.debug('API approach failed, falling back to browser', error);
    }

    return { success: false };
  }

  private async checkForBlocking(
    page: any,
    retailer: string
  ): Promise<{ isBlocked: boolean; reason?: string }> {
    // Check for common blocking indicators
    const blockingSelectors = {
      amazon: [
        'form[action*="errors/validateCaptcha"]',
        'img[src*="captcha"]',
        '.a-box-inner h4:has-text("Enter the characters")',
      ],
      target: ['.error-page', 'div:has-text("Access Denied")', '#px-captcha'],
      walmart: ['.blocked-warning', 'div:has-text("Robot or human?")', '.g-recaptcha'],
    };

    const selectors = blockingSelectors[retailer] || [];

    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          return { isBlocked: true, reason: `Found blocking element: ${selector}` };
        }
      } catch {}
    }

    // Check page title for blocks
    const title = await page.title();
    if (
      title.toLowerCase().includes('access denied') ||
      title.toLowerCase().includes('blocked') ||
      title.toLowerCase().includes('captcha')
    ) {
      return { isBlocked: true, reason: `Blocking title: ${title}` };
    }

    return { isBlocked: false };
  }

  private validateProductData(data: any, retailer: string): boolean {
    // Basic validation rules
    const requiredFields = {
      amazon: ['title', 'price', 'asin', 'availability'],
      target: ['title', 'price', 'tcin', 'availability'],
      walmart: ['title', 'price', 'itemId', 'availability'],
    };

    const fields = requiredFields[retailer] || ['title', 'price'];

    for (const field of fields) {
      if (!data[field]) {
        this.logger.warn(`Missing required field: ${field}`);
        return false;
      }
    }

    // Validate price format
    if (data.price && typeof data.price === 'string') {
      const priceNum = parseFloat(data.price.replace(/[^0-9.]/g, ''));
      if (isNaN(priceNum) || priceNum <= 0 || priceNum > 1000000) {
        this.logger.warn(`Invalid price: ${data.price}`);
        return false;
      }
    }

    return true;
  }

  private async saveProductData(urlId: string, productData: any, retailer: string): Promise<void> {
    // Compress large fields
    const compressedHtml = productData.html ? await gzip(productData.html) : null;

    // Calculate content hash for deduplication
    const contentHash = createHash('md5').update(JSON.stringify(productData)).digest('hex');

    // Store in transaction
    await this.prisma.$transaction(async (tx) => {
      // Update URL record
      await tx.scrapedUrl.update({
        where: { id: urlId },
        data: {
          status: 'COMPLETED',
          httpStatusCode: 200,
          lastScrapedAt: new Date(),
          scrapeCount: { increment: 1 },
          contentType: 'product',
        },
      });

      // Store product-specific data
      await tx.productData.upsert({
        where: { urlId },
        create: {
          urlId,
          retailer,
          productId: productData.productId,
          title: productData.title,
          price: productData.price,
          currency: productData.currency || 'USD',
          availability: productData.availability,
          rating: productData.rating,
          reviewCount: productData.reviewCount,
          images: productData.images,
          description: productData.description,
          specifications: productData.specifications,
          contentHash,
          extractedAt: new Date(),
        },
        update: {
          title: productData.title,
          price: productData.price,
          availability: productData.availability,
          rating: productData.rating,
          reviewCount: productData.reviewCount,
          images: productData.images,
          description: productData.description,
          specifications: productData.specifications,
          contentHash,
          extractedAt: new Date(),
        },
      });

      // Store compressed HTML if available
      if (compressedHtml) {
        await tx.pageContent.upsert({
          where: { urlId },
          create: {
            urlId,
            compressedHtml,
            contentHash,
          },
          update: {
            compressedHtml,
            contentHash,
          },
        });
      }
    });
  }

  private getEcommerceRetryStrategy(error: Error, retailer: string): RetryStrategy {
    const errorMessage = error.message.toLowerCase();

    // Captcha - needs manual intervention or service
    if (errorMessage.includes('captcha')) {
      return {
        name: 'captcha',
        shouldRetry: true,
        delay: 60000, // 1 minute
        maxRetries: 1,
      };
    }

    // Blocked - rotate proxy and retry
    if (errorMessage.includes('blocked') || errorMessage.includes('access denied')) {
      return {
        name: 'blocked',
        shouldRetry: true,
        delay: 30000, // 30 seconds
        maxRetries: 3,
      };
    }

    // Rate limit - exponential backoff
    if (errorMessage.includes('rate') || errorMessage.includes('429')) {
      return {
        name: 'rate-limit',
        shouldRetry: true,
        delay: 120000, // 2 minutes
        maxRetries: 5,
      };
    }

    // Product not found - don't retry
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return {
        name: 'not-found',
        shouldRetry: false,
        delay: 0,
        maxRetries: 0,
      };
    }

    // Default strategy
    return {
      name: 'default',
      shouldRetry: true,
      delay: 10000, // 10 seconds
      maxRetries: 3,
    };
  }

  private extractProductId(url: string, retailer: string): string | null {
    try {
      const patterns = {
        amazon: /\/dp\/([A-Z0-9]{10})/,
        target: /\/p\/[^\/]+\/-\/A-(\d+)/,
        walmart: /\/ip\/[^\/]+\/(\d+)/,
      };

      const pattern = patterns[retailer];
      if (!pattern) return null;

      const match = url.match(pattern);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  private normalizeApiResponse(data: any, retailer: string): any {
    // Normalize API responses to common format
    const normalized: any = {};

    switch (retailer) {
      case 'amazon':
        normalized.productId = data.asin;
        normalized.title = data.title;
        normalized.price = data.price?.value;
        normalized.currency = data.price?.currency;
        normalized.availability = data.availability?.type;
        normalized.rating = data.customerReviews?.starRating;
        normalized.reviewCount = data.customerReviews?.count;
        normalized.images = data.images?.map((img) => img.large || img.hiRes);
        break;

      case 'target':
        normalized.productId = data.tcin;
        normalized.title = data.item?.product_description?.title;
        normalized.price = data.price?.current_retail;
        normalized.availability = data.available_to_promise_network?.availability;
        normalized.rating = data.ratings_and_reviews?.statistics?.rating?.average;
        normalized.reviewCount = data.ratings_and_reviews?.statistics?.review_count;
        normalized.images = data.item?.enrichment?.images?.map((img) => img.base_url);
        break;

      case 'walmart':
        normalized.productId = data.itemId;
        normalized.title = data.name;
        normalized.price = data.priceInfo?.currentPrice?.price;
        normalized.availability = data.availabilityStatus;
        normalized.rating = data.averageRating;
        normalized.reviewCount = data.numberOfReviews;
        normalized.images = data.imageInfo?.allImages?.map((img) => img.url);
        break;
    }

    return normalized;
  }

  async cleanup() {
    // Stop memory monitoring
    clearInterval(this.memoryMonitorInterval);

    // Cleanup managers
    await this.camoufoxManager.cleanup();
    await this.playwrightManager.cleanup();
    await this.proxyManager.cleanup();
    await this.prisma.$disconnect();

    // Final GC
    if (global.gc) {
      global.gc();
    }
  }
}
```

### Phase 3: E-commerce Optimized PM2 Configuration (Days 8-9)

#### Day 8: PM2 Ecosystem Configuration for E-commerce

```javascript
// ecosystem.config.js
const os = require('os');

module.exports = {
  apps: [
    {
      name: 'ecommerce-scraper',
      script: './packages/scraper/dist/index.js',
      instances: 4, // Reduced for anti-detection
      exec_mode: 'cluster',

      // Memory management
      max_memory_restart: '2048M', // Higher for Camoufox
      min_uptime: '10s',
      max_restarts: 10,

      // Node.js optimization with GC exposure
      node_args: [
        '--max-old-space-size=1800',
        '--max-semi-space-size=128',
        '--expose-gc',
        '--trace-warnings',
        '--max-http-header-size=16384',
        '--optimize-for-size',
        '--gc-interval=100',
        '--always-compact',
      ].join(' '),

      // Process configuration
      autorestart: true,
      watch: false,

      // Environment
      env: {
        NODE_ENV: 'production',
        UV_THREADPOOL_SIZE: '64',
        NODE_OPTIONS: '--enable-source-maps',

        // Application config
        WORKER_ID: process.env.pm_id || 0,
        MAX_CONCURRENT_BROWSERS: '1',
        QUEUE_CONCURRENCY: '1',

        // E-commerce specific
        PRIMARY_BROWSER: 'camoufox',
        ENABLE_API_DISCOVERY: 'true',
        ENABLE_PROXY_ROTATION: 'true',
        ENABLE_CIRCUIT_BREAKER: 'true',

        // Rate limiting per retailer (requests per minute)
        RATE_LIMIT_AMAZON: '180', // 3 per second
        RATE_LIMIT_TARGET: '120', // 2 per second
        RATE_LIMIT_WALMART: '60', // 1 per second

        // Database
        DATABASE_URL: process.env.DATABASE_URL,
        DATABASE_POOL_SIZE: '20',

        // Redis
        REDIS_HOST: process.env.REDIS_HOST || 'localhost',
        REDIS_PORT: process.env.REDIS_PORT || '6379',
        REDIS_MAX_RETRIES: '3',

        // Proxy configuration
        OXYLABS_ENDPOINT: process.env.OXYLABS_ENDPOINT,
        OXYLABS_API_KEY: process.env.OXYLABS_API_KEY,
        SMARTPROXY_ENDPOINT: process.env.SMARTPROXY_ENDPOINT,
        SMARTPROXY_API_KEY: process.env.SMARTPROXY_API_KEY,
        BRIGHTDATA_ENDPOINT: process.env.BRIGHTDATA_ENDPOINT,
        BRIGHTDATA_API_KEY: process.env.BRIGHTDATA_API_KEY,
      },

      // Error handling
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Cluster settings
      instance_var: 'INSTANCE_ID',

      // Graceful shutdown
      kill_timeout: 15000, // More time for browser cleanup
      listen_timeout: 10000,
      shutdown_with_message: true,

      // Health check
      wait_ready: true,
      ready_timeout: 10000,

      // CPU affinity (M4 Max optimization)
      // Pin to performance cores (0-9)
      cpu_list: '0,1,2,3',

      // Monitoring hooks
      post_update: ['npm install', 'npm run build'],

      // Resource monitoring
      monitor: {
        memory: {
          threshold: 1800, // MB
          action: 'restart',
        },
        cpu: {
          threshold: 85, // percentage
          duration: 300000, // 5 minutes
          action: 'alert',
        },
      },
    },
    {
      name: 'dashboard',
      script: 'cd packages/dashboard && pnpm start',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',

      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        NEXT_TELEMETRY_DISABLED: '1',
      },

      // Pin to efficiency cores
      cpu_list: '10,11',
    },
    {
      name: 'api-discovery',
      script: './scripts/api-discovery-monitor.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',

      env: {
        NODE_ENV: 'production',
        CHECK_INTERVAL: '3600000', // 1 hour
      },
    },
    {
      name: 'proxy-monitor',
      script: './scripts/proxy-health-monitor.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '256M',

      env: {
        NODE_ENV: 'production',
        CHECK_INTERVAL: '300000', // 5 minutes
      },
    },
    {
      name: 'rate-limiter',
      script: './scripts/rate-limit-enforcer.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '256M',

      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
```

#### Day 9: E-commerce Specific Monitoring and Rate Limiting

```typescript
// scripts/rate-limit-enforcer.js
const Redis = require('ioredis');
const { Queue } from 'bullmq';

class RateLimitEnforcer {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
    this.queue = new Queue('url-scraping', {
      connection: this.redis
    });

    // Rate limits per retailer (requests per minute)
    this.rateLimits = {
      'amazon.com': parseInt(process.env.RATE_LIMIT_AMAZON) || 180,
      'target.com': parseInt(process.env.RATE_LIMIT_TARGET) || 120,
      'walmart.com': parseInt(process.env.RATE_LIMIT_WALMART) || 60
    };

    // Track requests per domain
    this.requestCounts = new Map();
  }

  async start() {
    console.log('Rate limit enforcer started');

    // Monitor queue for rate limiting
    this.queue.on('active', async (job) => {
      const url = job.data.url;
      const domain = new URL(url).hostname;

      await this.trackRequest(domain);
      await this.enforceRateLimit(domain, job.id);
    });

    // Reset counters every minute
    setInterval(() => {
      this.resetCounters();
    }, 60000);
  }

  async trackRequest(domain) {
    const key = this.getRetailerKey(domain);
    if (!key) return;

    const current = this.requestCounts.get(key) || 0;
    this.requestCounts.set(key, current + 1);

    // Also track in Redis for distributed counting
    await this.redis.incr(`rate_limit:${key}:${this.getCurrentMinute()}`);
  }

  async enforceRateLimit(domain, jobId) {
    const key = this.getRetailerKey(domain);
    if (!key) return;

    const limit = this.rateLimits[key];
    const currentMinute = this.getCurrentMinute();
    const count = await this.redis.get(`rate_limit:${key}:${currentMinute}`);

    if (parseInt(count) > limit) {
      console.log(`Rate limit exceeded for ${key}: ${count}/${limit}`);

      // Delay the job
      const delayMs = this.calculateDelay(key, parseInt(count), limit);
      await this.queue.moveToDelayed(jobId, Date.now() + delayMs);

      // Emit alert
      await this.redis.publish('rate_limit:exceeded', JSON.stringify({
        retailer: key,
        count: parseInt(count),
        limit,
        delayMs
      }));
    }
  }

  getRetailerKey(domain) {
    for (const [key, limit] of Object.entries(this.rateLimits)) {
      if (domain.includes(key)) {
        return key;
      }
    }
    return null;
  }

  calculateDelay(retailer, currentCount, limit) {
    // Calculate how long to wait until under limit
    const excessRequests = currentCount - limit;
    const baseDelay = 60000; // Wait until next minute

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 5000;

    return baseDelay + jitter + (excessRequests * 1000);
  }

  getCurrentMinute() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
  }

  resetCounters() {
    this.requestCounts.clear();

    // Clean up old Redis keys
    const pattern = `rate_limit:*:*`;
    this.redis.keys(pattern).then(keys => {
      const now = Date.now();
      keys.forEach(key => {
        // Parse timestamp from key and delete if older than 5 minutes
        const parts = key.split(':');
        const timeStr = parts[parts.length - 1];
        // Simple cleanup logic
        this.redis.del(key);
      });
    });
  }
}

// Start the rate limiter
const enforcer = new RateLimitEnforcer();
enforcer.start();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down rate limiter...');
  process.exit(0);
});
```

```typescript
// scripts/proxy-health-monitor.js
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
const axios = require('axios');

class ProxyHealthMonitor {
  constructor() {
    this.prisma = new PrismaClient();
    this.redis = new Redis(process.env.REDIS_URL);
    this.checkInterval = parseInt(process.env.CHECK_INTERVAL) || 300000; // 5 minutes

    this.providers = [
      { name: 'oxylabs', testUrl: 'https://httpbin.org/ip' },
      { name: 'smartproxy', testUrl: 'https://httpbin.org/ip' },
      { name: 'brightdata', testUrl: 'https://httpbin.org/ip' },
    ];
  }

  async start() {
    console.log('Proxy health monitor started');

    // Initial check
    await this.checkAllProviders();

    // Schedule regular checks
    setInterval(async () => {
      await this.checkAllProviders();
    }, this.checkInterval);
  }

  async checkAllProviders() {
    console.log('Running proxy health checks...');

    for (const provider of this.providers) {
      await this.checkProvider(provider);
    }

    // Update dashboard metrics
    await this.publishMetrics();
  }

  async checkProvider(provider) {
    const results = {
      provider: provider.name,
      timestamp: new Date(),
      success: 0,
      failed: 0,
      avgResponseTime: 0,
      errors: [],
    };

    try {
      // Test with multiple regions
      const regions = ['us', 'uk', 'de'];
      const responseTimes = [];

      for (const region of regions) {
        try {
          const startTime = Date.now();
          const proxy = await this.getProviderProxy(provider.name, region);

          const response = await axios.get(provider.testUrl, {
            proxy: {
              host: proxy.host,
              port: proxy.port,
              auth: {
                username: proxy.username,
                password: proxy.password,
              },
            },
            timeout: 10000,
          });

          const responseTime = Date.now() - startTime;
          responseTimes.push(responseTime);

          if (response.status === 200) {
            results.success++;
          } else {
            results.failed++;
            results.errors.push(`${region}: HTTP ${response.status}`);
          }
        } catch (error) {
          results.failed++;
          results.errors.push(`${region}: ${error.message}`);
        }
      }

      // Calculate average response time
      if (responseTimes.length > 0) {
        results.avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      }

      // Store results
      await this.storeHealthCheck(results);

      // Alert if provider is unhealthy
      if (results.failed > results.success) {
        await this.alertUnhealthyProvider(provider.name, results);
      }
    } catch (error) {
      console.error(`Error checking provider ${provider.name}:`, error);
    }
  }

  async getProviderProxy(providerName, region) {
    // Get proxy configuration for provider
    switch (providerName) {
      case 'oxylabs':
        return {
          host: process.env.OXYLABS_ENDPOINT,
          port: 7777,
          username: `customer-${process.env.OXYLABS_API_KEY}-cc-${region}`,
          password: 'pr_password',
        };
      case 'smartproxy':
        return {
          host: process.env.SMARTPROXY_ENDPOINT,
          port: 10000,
          username: `${process.env.SMARTPROXY_API_KEY}-country-${region}`,
          password: 'password',
        };
      case 'brightdata':
        return {
          host: process.env.BRIGHTDATA_ENDPOINT,
          port: 22225,
          username: `${process.env.BRIGHTDATA_API_KEY}-country-${region}`,
          password: 'password',
        };
    }
  }

  async storeHealthCheck(results) {
    // Store in Redis for real-time access
    await this.redis.hset(
      'proxy:health',
      results.provider,
      JSON.stringify({
        ...results,
        timestamp: results.timestamp.toISOString(),
      })
    );

    // Store in database for historical analysis
    await this.prisma.proxyHealthCheck.create({
      data: {
        provider: results.provider,
        successCount: results.success,
        failureCount: results.failed,
        avgResponseTime: Math.round(results.avgResponseTime),
        errors: results.errors,
        checkedAt: results.timestamp,
      },
    });
  }

  async alertUnhealthyProvider(provider, results) {
    const alert = {
      type: 'proxy_health',
      severity: 'warning',
      provider,
      message: `Proxy provider ${provider} is unhealthy: ${results.failed}/${results.success + results.failed} failed`,
      details: results,
      timestamp: new Date(),
    };

    // Publish alert
    await this.redis.publish('alerts:proxy', JSON.stringify(alert));

    console.error(`ALERT: ${alert.message}`);
  }

  async publishMetrics() {
    const health = await this.redis.hgetall('proxy:health');

    const metrics = Object.entries(health).map(([provider, data]) => {
      const parsed = JSON.parse(data);
      return {
        provider,
        healthy: parsed.success > parsed.failed,
        successRate: (parsed.success / (parsed.success + parsed.failed)) * 100,
        avgResponseTime: parsed.avgResponseTime,
      };
    });

    await this.redis.publish('metrics:proxy_health', JSON.stringify(metrics));
  }

  async cleanup() {
    await this.prisma.$disconnect();
    await this.redis.quit();
  }
}

// Start monitor
const monitor = new ProxyHealthMonitor();
monitor.start();

// Graceful shutdown
process.on('SIGINT', async () => {
  await monitor.cleanup();
  process.exit(0);
});
```

### Phase 4: Enhanced Dashboard with Proxy and Circuit Breaker Monitoring (Days 10-12)

#### Day 10: Enhanced Dashboard Components

```typescript
// packages/dashboard/components/proxy-status.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface ProxyStatus {
  id: string
  endpoint: string
  type: string
  location: string
  isActive: boolean
  successRate: number
  avgResponseTime: number
  lastUsed: string
  failureCount: number
}

export function ProxyStatus() {
  const [proxies, setProxies] = useState<ProxyStatus[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    residential: 0,
    datacenter: 0
  })

  useEffect(() => {
    const fetchProxyStatus = async () => {
      const response = await fetch('/api/proxy/status')
      const data = await response.json()
      setProxies(data.proxies)
      setStats(data.stats)
    }

    fetchProxyStatus()
    const interval = setInterval(fetchProxyStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Proxy Pool Status</CardTitle>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>Total: {stats.total}</span>
          <span>Active: {stats.active}</span>
          <span>Residential: {stats.residential}</span>
          <span>Datacenter: {stats.datacenter}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {proxies.map(proxy => (
            <div key={proxy.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{proxy.endpoint}</p>
                  <p className="text-sm text-gray-600">
                    {proxy.type} • {proxy.location}
                  </p>
                </div>
                <Badge variant={proxy.isActive ? 'success' : 'destructive'}>
                  {proxy.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <div className="flex items-center gap-2">
                    <Progress value={proxy.successRate} className="h-2" />
                    <span className="text-sm font-medium">{proxy.successRate.toFixed(1)}%</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Avg Response</p>
                  <p className="text-sm font-medium">{proxy.avgResponseTime}ms</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Failures</p>
                  <p className="text-sm font-medium">{proxy.failureCount}</p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Last used: {new Date(proxy.lastUsed).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

```typescript
// packages/dashboard/components/circuit-breaker-status.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, PauseCircle } from 'lucide-react'

interface CircuitBreaker {
  serviceName: string
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failureCount: number
  lastFailure: string | null
  nextRetry: string | null
}

export function CircuitBreakerStatus() {
  const [circuits, setCircuits] = useState<CircuitBreaker[]>([])

  useEffect(() => {
    const eventSource = new EventSource('/api/circuit-breakers/stream')

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setCircuits(data)
    }

    return () => eventSource.close()
  }, [])

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'CLOSED':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'OPEN':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'HALF_OPEN':
        return <PauseCircle className="w-5 h-5 text-yellow-500" />
    }
  }

  const getStateBadge = (state: string) => {
    const variants = {
      'CLOSED': 'success',
      'OPEN': 'destructive',
      'HALF_OPEN': 'warning'
    }
    return variants[state] || 'default'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Circuit Breakers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {circuits.map(circuit => (
            <div key={circuit.serviceName} className="border rounded-lg p-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {getStateIcon(circuit.state)}
                  <span className="font-medium">{circuit.serviceName}</span>
                </div>
                <Badge variant={getStateBadge(circuit.state) as any}>
                  {circuit.state}
                </Badge>
              </div>

              <div className="mt-2 text-sm text-gray-600">
                <p>Failures: {circuit.failureCount}</p>
                {circuit.lastFailure && (
                  <p>Last failure: {new Date(circuit.lastFailure).toLocaleTimeString()}</p>
                )}
                {circuit.nextRetry && circuit.state === 'OPEN' && (
                  <p>Next retry: {new Date(circuit.nextRetry).toLocaleTimeString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

### Phase 5: Production Deployment with Enhanced Features (Days 13-15)

#### Day 13: Enhanced Deployment Script

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting enhanced deployment..."

# Check system requirements
echo "📋 Checking system requirements..."
node_version=$(node -v)
if [[ ! "$node_version" =~ ^v22 ]]; then
    echo "❌ Node.js 22 required. Current: $node_version"
    exit 1
fi

# Check for required services
services=("redis-server" "postgresql")
for service in "${services[@]}"; do
    if ! pgrep -x "$service" > /dev/null; then
        echo "❌ $service is not running"
        exit 1
    fi
done

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build all packages
echo "🔨 Building packages..."
pnpm run build

# Run database migrations
echo "🗄️ Running database migrations..."
pnpm --filter @scraper/database db:migrate deploy

# Setup database partitions
echo "📊 Setting up database partitions..."
psql $DATABASE_URL < packages/database/prisma/partitions/setup-partitions.sql

# Initialize proxy pool
echo "🌐 Initializing proxy pool..."
node scripts/init-proxies.js

# Configure Redis
echo "📮 Configuring Redis..."
redis-cli CONFIG SET maxmemory 3gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# Configure system limits
echo "⚙️ Configuring system limits..."
./scripts/optimize-macos.sh

# Warm up browser pool
echo "🔥 Warming up browser pool..."
node scripts/warm-browser-pool.js

# Start PM2
echo "🔄 Starting PM2 processes..."
pm2 delete all || true
pm2 start ecosystem.config.js --env production

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Health check
echo "🏥 Running health checks..."
node scripts/health-check.js

# Save PM2 configuration
pm2 save
pm2 startup

echo "✅ Enhanced deployment complete!"
echo "📊 Dashboard available at http://localhost:3000"
echo "📈 Monitoring with: pm2 monit"
```

#### Day 14: Enhanced Monitoring and Health Checks

```typescript
// scripts/health-check.js
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');
const pm2 = require('pm2');

class HealthChecker {
  constructor() {
    this.prisma = new PrismaClient();
    this.redis = new Redis(process.env.REDIS_URL);
    this.checks = [];
  }

  async runAllChecks() {
    console.log('🏥 Running comprehensive health checks...\n');

    await this.checkDatabase();
    await this.checkRedis();
    await this.checkWorkers();
    await this.checkProxies();
    await this.checkCircuitBreakers();
    await this.checkDashboard();
    await this.checkMemoryUsage();
    await this.checkDiskSpace();

    this.printResults();
  }

  async checkDatabase() {
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - start;

      // Check partition health
      const partitions = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables 
        WHERE tablename LIKE 'ScrapeMetrics_%'
      `;

      this.checks.push({
        name: 'PostgreSQL',
        status: 'OK',
        latency: `${latency}ms`,
        details: `${partitions.length} partitions active`,
      });
    } catch (error) {
      this.checks.push({
        name: 'PostgreSQL',
        status: 'FAIL',
        error: error.message,
      });
    }
  }

  async checkRedis() {
    try {
      const start = Date.now();
      await this.redis.ping();
      const latency = Date.now() - start;

      const info = await this.redis.info('memory');
      const memoryUsed = info.match(/used_memory_human:(.+)/)[1];

      this.checks.push({
        name: 'Redis',
        status: 'OK',
        latency: `${latency}ms`,
        details: `Memory: ${memoryUsed}`,
      });
    } catch (error) {
      this.checks.push({
        name: 'Redis',
        status: 'FAIL',
        error: error.message,
      });
    }
  }

  async checkWorkers() {
    return new Promise((resolve) => {
      pm2.connect((err) => {
        if (err) {
          this.checks.push({
            name: 'PM2 Workers',
            status: 'FAIL',
            error: err.message,
          });
          resolve();
          return;
        }

        pm2.list((err, list) => {
          if (err) {
            this.checks.push({
              name: 'PM2 Workers',
              status: 'FAIL',
              error: err.message,
            });
          } else {
            const workers = list.filter((p) => p.name === 'scraper-cluster');
            const online = workers.filter((w) => w.pm2_env.status === 'online').length;

            this.checks.push({
              name: 'PM2 Workers',
              status: online >= 8 ? 'OK' : 'WARN',
              details: `${online}/${workers.length} online`,
            });
          }

          pm2.disconnect();
          resolve();
        });
      });
    });
  }

  async checkProxies() {
    try {
      const activeProxies = await this.prisma.proxyServer.count({
        where: { isActive: true },
      });

      const healthyProxies = await this.prisma.proxyServer.count({
        where: {
          isActive: true,
          successRate: { gte: 80 },
        },
      });

      this.checks.push({
        name: 'Proxy Pool',
        status: healthyProxies >= 5 ? 'OK' : 'WARN',
        details: `${healthyProxies}/${activeProxies} healthy`,
      });
    } catch (error) {
      this.checks.push({
        name: 'Proxy Pool',
        status: 'FAIL',
        error: error.message,
      });
    }
  }

  async checkCircuitBreakers() {
    try {
      const openCircuits = await this.prisma.circuitBreakerState.count({
        where: { state: 'OPEN' },
      });

      this.checks.push({
        name: 'Circuit Breakers',
        status: openCircuits > 5 ? 'WARN' : 'OK',
        details: `${openCircuits} open circuits`,
      });
    } catch (error) {
      this.checks.push({
        name: 'Circuit Breakers',
        status: 'FAIL',
        error: error.message,
      });
    }
  }

  async checkDashboard() {
    try {
      const response = await axios.get('http://localhost:3000/api/health', {
        timeout: 5000,
      });

      this.checks.push({
        name: 'Dashboard',
        status: response.status === 200 ? 'OK' : 'WARN',
        details: `HTTP ${response.status}`,
      });
    } catch (error) {
      this.checks.push({
        name: 'Dashboard',
        status: 'FAIL',
        error: error.message,
      });
    }
  }

  async checkMemoryUsage() {
    const os = require('os');
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const usagePercent = (usedMemory / totalMemory) * 100;

    this.checks.push({
      name: 'System Memory',
      status: usagePercent > 85 ? 'WARN' : 'OK',
      details: `${usagePercent.toFixed(1)}% used (${(freeMemory / 1024 / 1024 / 1024).toFixed(1)}GB free)`,
    });
  }

  async checkDiskSpace() {
    const { execSync } = require('child_process');
    try {
      const output = execSync("df -h / | awk 'NR==2 {print $5}'").toString().trim();
      const usage = parseInt(output);

      this.checks.push({
        name: 'Disk Space',
        status: usage > 85 ? 'WARN' : 'OK',
        details: `${usage}% used`,
      });
    } catch (error) {
      this.checks.push({
        name: 'Disk Space',
        status: 'FAIL',
        error: 'Unable to check disk space',
      });
    }
  }

  printResults() {
    console.log('\n📊 Health Check Results:');
    console.log('========================\n');

    let allOk = true;
    this.checks.forEach((check) => {
      const status = check.status === 'OK' ? '✅' : check.status === 'WARN' ? '⚠️' : '❌';
      console.log(`${status} ${check.name}: ${check.status}`);

      if (check.details) {
        console.log(`   ${check.details}`);
      }
      if (check.error) {
        console.log(`   Error: ${check.error}`);
      }

      if (check.status !== 'OK') {
        allOk = false;
      }
    });

    console.log('\n========================');
    console.log(allOk ? '✅ All systems operational!' : '⚠️ Some systems need attention');

    process.exit(allOk ? 0 : 1);
  }

  async cleanup() {
    await this.prisma.$disconnect();
    await this.redis.quit();
  }
}

// Run health checks
const checker = new HealthChecker();
checker
  .runAllChecks()
  .then(() => checker.cleanup())
  .catch((error) => {
    console.error('Health check failed:', error);
    process.exit(1);
  });
```

#### Day 15: Performance Testing and Optimization

```typescript
// scripts/performance-test.ts
import { QueueManager } from '../packages/scraper/src/queue/queue-manager';
import { Redis } from 'ioredis';
import { PrismaClient } from '@scraper/database';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  totalUrls: number;
  successfulUrls: number;
  failedUrls: number;
  avgProcessingTime: number;
  peakMemoryUsage: number;
  peakCpuUsage: number;
  proxyFailures: number;
  circuitBreakerTrips: number;
  duration: number;
}

class PerformanceTest {
  private redis: Redis;
  private prisma: PrismaClient;
  private queueManager: QueueManager;
  private results: TestResult;
  private metricsInterval: NodeJS.Timer;

  constructor() {
    this.redis = new Redis();
    this.prisma = new PrismaClient();
    this.queueManager = new QueueManager(this.redis);
    this.results = {
      totalUrls: 0,
      successfulUrls: 0,
      failedUrls: 0,
      avgProcessingTime: 0,
      peakMemoryUsage: 0,
      peakCpuUsage: 0,
      proxyFailures: 0,
      circuitBreakerTrips: 0,
      duration: 0,
    };
  }

  async runLoadTest(urlCount: number = 1000) {
    console.log(`🚀 Starting performance test with ${urlCount} URLs`);

    const startTime = Date.now();

    // Start monitoring
    this.startMonitoring();

    // Generate test URLs
    const testUrls = this.generateTestUrls(urlCount);

    // Add URLs to queue in batches
    const batchSize = 100;
    for (let i = 0; i < testUrls.length; i += batchSize) {
      const batch = testUrls.slice(i, i + batchSize);
      await this.queueManager.addUrls(batch, Math.floor(Math.random() * 3)); // Random priority

      console.log(
        `Added batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(testUrls.length / batchSize)}`
      );
      await this.sleep(500); // Small delay between batches
    }

    // Monitor until completion
    await this.waitForCompletion();

    // Stop monitoring
    clearInterval(this.metricsInterval);

    // Calculate final results
    this.results.duration = Date.now() - startTime;
    await this.calculateFinalMetrics();

    // Generate report
    this.generateReport();
  }

  private generateTestUrls(count: number): string[] {
    const domains = [
      'example.com',
      'test-site.com',
      'demo.example.org',
      'api.testservice.io',
      'shop.ecommerce-test.com',
    ];

    const paths = [
      '/products',
      '/api/data',
      '/search',
      '/categories',
      '/item',
      '/user',
      '/content',
    ];

    const urls: string[] = [];

    for (let i = 0; i < count; i++) {
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const path = paths[Math.floor(Math.random() * paths.length)];
      const id = Math.floor(Math.random() * 10000);

      urls.push(`https://${domain}${path}/${id}`);
    }

    return urls;
  }

  private startMonitoring() {
    let peakMemory = 0;
    let peakCpu = 0;

    this.metricsInterval = setInterval(async () => {
      // Get system metrics
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();

      peakMemory = Math.max(peakMemory, memoryUsage.heapUsed);
      peakCpu = Math.max(peakCpu, cpuUsage.user);

      this.results.peakMemoryUsage = peakMemory;
      this.results.peakCpuUsage = peakCpu;

      // Get queue metrics
      const queueMetrics = await this.queueManager.getMetrics();

      // Log progress
      console.log(
        `Progress: ${queueMetrics.completed} completed, ${queueMetrics.active} active, ${queueMetrics.waiting} waiting`
      );
    }, 1000);
  }

  private async waitForCompletion() {
    while (true) {
      const metrics = await this.queueManager.getMetrics();

      if (metrics.waiting === 0 && metrics.active === 0) {
        // Wait a bit more to ensure everything is processed
        await this.sleep(5000);
        break;
      }

      await this.sleep(2000);
    }
  }

  private async calculateFinalMetrics() {
    // Get processing results
    const [successful, failed] = await Promise.all([
      this.prisma.scrapedUrl.count({ where: { status: 'COMPLETED' } }),
      this.prisma.scrapedUrl.count({ where: { status: 'FAILED' } }),
    ]);

    this.results.successfulUrls = successful;
    this.results.failedUrls = failed;
    this.results.totalUrls = successful + failed;

    // Calculate average processing time
    const metrics = await this.prisma.scrapeMetrics.aggregate({
      _avg: { duration: true },
    });
    this.results.avgProcessingTime = metrics._avg.duration || 0;

    // Get proxy failures
    const proxyFailures = await this.prisma.proxyUsageLog.count({
      where: { success: false },
    });
    this.results.proxyFailures = proxyFailures;

    // Get circuit breaker trips
    const circuitTrips = await this.prisma.circuitBreakerState.count({
      where: { state: 'OPEN' },
    });
    this.results.circuitBreakerTrips = circuitTrips;
  }

  private generateReport() {
    const report = `
# Performance Test Report
Generated: ${new Date().toISOString()}

## Test Configuration
- Total URLs: ${this.results.totalUrls}
- Test Duration: ${(this.results.duration / 1000).toFixed(2)} seconds
- URLs per minute: ${((this.results.totalUrls / this.results.duration) * 60000).toFixed(2)}

## Results
- Successful: ${this.results.successfulUrls} (${((this.results.successfulUrls / this.results.totalUrls) * 100).toFixed(2)}%)
- Failed: ${this.results.failedUrls} (${((this.results.failedUrls / this.results.totalUrls) * 100).toFixed(2)}%)
- Average Processing Time: ${this.results.avgProcessingTime.toFixed(2)}ms

## System Metrics
- Peak Memory Usage: ${(this.results.peakMemoryUsage / 1024 / 1024).toFixed(2)} MB
- Peak CPU Usage: ${(this.results.peakCpuUsage / 1000000).toFixed(2)} seconds

## Reliability Metrics
- Proxy Failures: ${this.results.proxyFailures}
- Circuit Breaker Trips: ${this.results.circuitBreakerTrips}

## Performance Rating
`;

    const urlsPerMinute = (this.results.totalUrls / this.results.duration) * 60000;
    const successRate = (this.results.successfulUrls / this.results.totalUrls) * 100;

    let rating = 'EXCELLENT';
    if (urlsPerMinute < 30 || successRate < 95) rating = 'GOOD';
    if (urlsPerMinute < 20 || successRate < 90) rating = 'FAIR';
    if (urlsPerMinute < 10 || successRate < 85) rating = 'POOR';

    const reportContent = report + `Overall Rating: ${rating}`;

    // Save report
    const reportPath = path.join(__dirname, '..', 'reports', `performance-test-${Date.now()}.md`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, reportContent);

    console.log(reportContent);
    console.log(`\nReport saved to: ${reportPath}`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async cleanup() {
    await this.queueManager.cleanup();
    await this.prisma.$disconnect();
    await this.redis.quit();
  }
}

// Run performance test
const test = new PerformanceTest();
const urlCount = parseInt(process.argv[2] || '1000');

test
  .runLoadTest(urlCount)
  .then(() => test.cleanup())
  .catch((error) => {
    console.error('Performance test failed:', error);
    process.exit(1);
  });
```
