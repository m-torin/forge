/**
 * Browser automation patterns
 * Advanced browser interactions and session management
 */

import { createScrapingManager } from '../utils/scraping-manager';
import { ScrapingError, ScrapingErrorCode } from '../errors';
import { humanDelay, retryWithBackoff } from '../utils/helpers';
import type { ProviderRegistry, ScrapingConfig, ScrapeOptions } from '../types/scraping-types';
import type { BrowserScrapeOptions, InteractionStep } from './types';

/**
 * Browser scraping with complex interactions
 */
export async function browserScrapeWithInteractions(
  url: string,
  options: BrowserScrapeOptions = {},
): Promise<any> {
  const {
    interactions = [],
    waitForStable = true,
    recordSession = false,
    provider = 'playwright',
    ...scrapeOptions
  } = options;

  // Only server-side browsers support browser scraping
  if (typeof window !== 'undefined') {
    throw new ScrapingError(
      'Browser scraping requires server-side browser automation',
      ScrapingErrorCode.PROVIDER_ERROR,
    );
  }

  const { PlaywrightProvider } = await import('../../server/providers/playwright-provider');
  const { PuppeteerProvider } = await import('../../server/providers/puppeteer-provider');

  const providers: ProviderRegistry = {
    playwright: (config) => new PlaywrightProvider(),
    puppeteer: (config) => new PuppeteerProvider(),
  };

  const config: ScrapingConfig = {
    providers: { [provider]: { options: { autoClose: false } } },
    debug: false,
  };

  const manager = createScrapingManager(config, providers);

  try {
    await manager.initialize();

    // Initial page load
    const initialResult = await manager.scrape(url, {
      ...scrapeOptions,
      extract: undefined, // Don't extract yet
    });

    // Execute interactions
    for (const interaction of interactions) {
      await executeInteraction(manager, interaction);
    }

    // Wait for page to stabilize after interactions
    if (waitForStable) {
      await humanDelay(1000, 2000);
    }

    // Final data extraction
    const finalResult = await manager.scrape(url, {
      ...scrapeOptions,
      // Page is already loaded, just extract
    });

    return {
      ...finalResult,
      interactions: interactions.length,
      sessionRecorded: recordSession,
    };
  } finally {
    await manager.dispose();
  }
}

/**
 * Execute a single interaction step
 */
async function executeInteraction(manager: any, step: InteractionStep): Promise<void> {
  const { type, selector, value, delay = 500, options = {} } = step;

  try {
    switch (type) {
      case 'click':
        if (!selector) throw new Error('Selector required for click interaction');
        // await manager.click(selector, options);
        break;

      case 'type':
        if (!selector || !value)
          throw new Error('Selector and value required for type interaction');
        // await manager.type(selector, value, options);
        break;

      case 'select':
        if (!selector || !value)
          throw new Error('Selector and value required for select interaction');
        // await manager.select(selector, value, options);
        break;

      case 'hover':
        if (!selector) throw new Error('Selector required for hover interaction');
        // await manager.hover(selector, options);
        break;

      case 'scroll':
        // await manager.scroll(options);
        break;

      case 'wait':
        if (selector) {
          // await manager.waitForSelector(selector, options);
        } else {
          await humanDelay(delay, delay * 1.2);
        }
        break;

      case 'navigate':
        if (!value) throw new Error('URL required for navigate interaction');
        // await manager.navigate(value, options);
        break;

      default:
        throw new Error(`Unknown interaction type: ${type}`);
    }

    // Add delay after interaction
    if (delay > 0) {
      await humanDelay(delay, delay * 1.2);
    }
  } catch (error) {
    throw new ScrapingError(
      `Interaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ScrapingErrorCode.INTERACTION_FAILED,
      { step },
      error instanceof Error ? error : undefined,
    );
  }
}

/**
 * Browser scraping with form filling
 */
export async function browserScrape(
  url: string,
  options: {
    formData?: Record<string, string>;
    submitSelector?: string;
    waitAfterSubmit?: number;
  } & ScrapeOptions = {},
): Promise<any> {
  const {
    formData = {},
    submitSelector,
    waitAfterSubmit = 2000,
    provider = 'playwright',
    ...scrapeOptions
  } = options;

  const interactions: InteractionStep[] = [];

  // Add form filling interactions
  for (const [selector, value] of Object.entries(formData)) {
    interactions.push({
      type: 'type' as const,
      selector,
      value,
      delay: 200,
    });
  }

  // Add form submission
  if (submitSelector) {
    interactions.push({
      type: 'click',
      selector: submitSelector,
      delay: waitAfterSubmit,
    });
  }

  return browserScrapeWithInteractions(url, {
    ...scrapeOptions,
    provider,
    interactions,
    waitForStable: true,
  });
}

/**
 * Browser scraping with authentication
 */
export async function authenticatedScrape(
  url: string,
  auth: {
    loginUrl: string;
    usernameSelector: string;
    passwordSelector: string;
    submitSelector: string;
    username: string;
    password: string;
    successIndicator?: string;
  },
  options: ScrapeOptions = {},
): Promise<any> {
  const {
    loginUrl,
    usernameSelector,
    passwordSelector,
    submitSelector,
    username,
    password,
    successIndicator,
  } = auth;

  const provider = options.provider || 'playwright';

  // First, perform login
  await browserScrapeWithInteractions(loginUrl, {
    provider,
    interactions: [
      { type: 'type', selector: usernameSelector, value: username, delay: 300 },
      { type: 'type', selector: passwordSelector, value: password, delay: 300 },
      { type: 'click', selector: submitSelector, delay: 2000 },
      ...(successIndicator ? [{ type: 'wait', selector: successIndicator, delay: 1000 }] : []),
    ],
    waitForStable: true,
  });

  // Then scrape the target URL (cookies should be preserved)
  return browserScrapeWithInteractions(url, options);
}

/**
 * Multi-step browser workflow
 */
export async function workflowScrape(
  steps: Array<{
    url?: string;
    interactions?: InteractionStep[];
    extract?: any;
    name?: string;
  }>,
  options: { provider?: string } = {},
): Promise<Array<{ name?: string; data: any; url?: string }>> {
  const provider = options.provider || 'playwright';

  if (typeof window !== 'undefined') {
    throw new ScrapingError(
      'Workflow scraping requires server-side browser automation',
      ScrapingErrorCode.PROVIDER_ERROR,
    );
  }

  const { PlaywrightProvider } = await import('../../server/providers/playwright-provider');

  const providers: ProviderRegistry = {
    [provider]: (config) => new PlaywrightProvider(),
  };

  const config: ScrapingConfig = {
    providers: { [provider]: { options: { autoClose: false } } },
    debug: false,
  };

  const manager = createScrapingManager(config, providers);
  const results: Array<{ name?: string; data: any; url?: string }> = [];

  try {
    await manager.initialize();

    for (const step of steps) {
      try {
        // Navigate to URL if specified
        if (step.url) {
          await manager.scrape(step.url, { extract: undefined });
        }

        // Execute interactions
        if (step.interactions) {
          for (const interaction of step.interactions) {
            await executeInteraction(manager, interaction);
          }
        }

        // Extract data if selectors specified
        let data: any = {};
        if (step.extract) {
          const result = await manager.scrape(step.url || '', {
            extract: step.extract,
          });
          data = result.data || {};
        }

        results.push({
          name: step.name,
          data,
          url: step.url,
        });
      } catch (error) {
        throw new ScrapingError(
          `Workflow step failed: ${step.name || 'unnamed'}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          ScrapingErrorCode.SCRAPING_FAILED,
          { step },
          error instanceof Error ? error : undefined,
        );
      }
    }

    return results;
  } finally {
    await manager.dispose();
  }
}

/**
 * Browser automation with session persistence
 */
export async function withBrowser<T>(
  callback: (manager: any) => Promise<T>,
  options: { provider?: string; persistent?: boolean } = {},
): Promise<T> {
  const provider = options.provider || 'playwright';

  if (typeof window !== 'undefined') {
    throw new ScrapingError(
      'Browser sessions require server-side browser automation',
      ScrapingErrorCode.PROVIDER_ERROR,
    );
  }

  const { PlaywrightProvider } = await import('../../server/providers/playwright-provider');

  const providers: ProviderRegistry = {
    [provider]: (config) => new PlaywrightProvider(),
  };

  const config: ScrapingConfig = {
    providers: {
      [provider]: {
        options: {
          autoClose: false,
          persistent: options.persistent,
        },
      },
    },
    debug: false,
  };

  const manager = createScrapingManager(config, providers);

  try {
    await manager.initialize();
    return await callback(manager);
  } finally {
    if (!options.persistent) {
      await manager.dispose();
    }
  }
}
