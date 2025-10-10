/**
 * Browser automation patterns
 * Advanced browser interactions and session management
 */

import { ScrapingError, ScrapingErrorCode } from '../errors';
import { ProviderRegistry, ScrapeOptions, ScrapingConfig } from '../types/scraping-types';
import { humanDelay } from '../utils/helpers';
import { createScrapingManager } from '../utils/scraping-manager';

import { BrowserScrapeOptions, InteractionStep } from './types';

/**
 * Browser scraping with authentication
 */
async function _authenticatedScrape(
  url: string,
  auth: {
    loginUrl: string;
    password: string;
    passwordSelector: string;
    submitSelector: string;
    successIndicator?: string;
    username: string;
    usernameSelector: string;
  },
  options: ScrapeOptions = {},
): Promise<any> {
  const {
    loginUrl,
    password,
    passwordSelector,
    submitSelector,
    successIndicator,
    username,
    usernameSelector,
  } = auth;

  const provider = options.provider ?? 'playwright';

  // First, perform login
  const loginInteractions: InteractionStep[] = [
    { delay: 300, selector: usernameSelector, type: 'type', value: username },
    { delay: 300, selector: passwordSelector, type: 'type', value: password },
    { delay: 2000, selector: submitSelector, type: 'click' },
  ];

  if (successIndicator) {
    loginInteractions.push({ delay: 1000, selector: successIndicator, type: 'wait' });
  }

  await browserScrapeWithInteractions(loginUrl, {
    interactions: loginInteractions,
    provider,
    waitForStable: true,
  });

  // Then scrape the target URL (cookies should be preserved)
  return browserScrapeWithInteractions(url, options);
}

/**
 * Browser scraping with form filling
 */
export async function browserScrape(
  url: string,
  options: ScrapeOptions & {
    formData?: Record<string, string>;
    submitSelector?: string;
    waitAfterSubmit?: number;
  } = {},
): Promise<any> {
  const {
    formData = {},
    provider = 'playwright',
    submitSelector,
    waitAfterSubmit = 2000,
    ...scrapeOptions
  } = options;

  const interactions: InteractionStep[] = [];

  // Add form filling interactions
  for (const [selector, value] of Object.entries(formData)) {
    interactions.push({
      delay: 200,
      selector,
      type: 'type' as const,
      value,
    });
  }

  // Add form submission
  if (submitSelector) {
    interactions.push({
      delay: waitAfterSubmit,
      selector: submitSelector,
      type: 'click',
    });
  }

  return browserScrapeWithInteractions(url, {
    ...scrapeOptions,
    interactions,
    provider,
    waitForStable: true,
  });
}

/**
 * Browser scraping with complex interactions
 */
async function browserScrapeWithInteractions(
  url: string,
  options: BrowserScrapeOptions = {},
): Promise<any> {
  const {
    interactions = [],
    provider = 'playwright',
    recordSession = false,
    waitForStable = true,
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
    playwright: (_config: any) => new PlaywrightProvider(),
    puppeteer: (_config: any) => new PuppeteerProvider(),
  };

  const config: ScrapingConfig = {
    debug: false,
    providers: { [provider]: { options: { autoClose: false } } },
  };

  const manager = createScrapingManager(config, providers);

  try {
    await manager.initialize();

    // Initial page load
    await manager.scrape(url, {
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
 * Browser automation with session persistence
 */
export async function withBrowser<T>(
  callback: (manager: any) => Promise<T>,
  options: { persistent?: boolean; provider?: string } = {},
): Promise<T> {
  const provider = options.provider ?? 'playwright';

  if (typeof window !== 'undefined') {
    throw new ScrapingError(
      'Browser sessions require server-side browser automation',
      ScrapingErrorCode.PROVIDER_ERROR,
    );
  }

  const { PlaywrightProvider } = await import('../../server/providers/playwright-provider');

  const providers: ProviderRegistry = {
    [provider]: (_config: any) => new PlaywrightProvider(),
  };

  const config: ScrapingConfig = {
    debug: false,
    providers: {
      [provider]: {
        options: {
          autoClose: false,
          persistent: options.persistent,
        },
      },
    },
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

/**
 * Multi-step browser workflow
 */
async function _workflowScrape(
  steps: {
    extract?: any;
    interactions?: InteractionStep[];
    name?: string;
    url?: string;
  }[],
  options: { provider?: string } = {},
): Promise<{ data: any; name?: string; url?: string }[]> {
  const provider = options.provider ?? 'playwright';

  if (typeof window !== 'undefined') {
    throw new ScrapingError(
      'Workflow scraping requires server-side browser automation',
      ScrapingErrorCode.PROVIDER_ERROR,
    );
  }

  const { PlaywrightProvider } = await import('../../server/providers/playwright-provider');

  const providers: ProviderRegistry = {
    [provider]: (_config: any) => new PlaywrightProvider(),
  };

  const config: ScrapingConfig = {
    debug: false,
    providers: { [provider]: { options: { autoClose: false } } },
  };

  const manager = createScrapingManager(config, providers);
  const results: { data: any; name?: string; url?: string }[] = [];

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
          const result = await manager.scrape(step.url ?? '', {
            extract: step.extract,
          });
          data = result?.data ?? {};
        }

        results.push({
          data,
          name: step.name,
          url: step.url,
        });
      } catch (error) {
        throw new ScrapingError(
          `Workflow step failed: ${step.name ?? 'unnamed'}: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
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
 * Execute a single interaction step
 */
async function executeInteraction(manager: any, step: InteractionStep): Promise<void> {
  const { delay = 500, selector, type, value } = step;

  try {
    switch (type) {
      case 'click':
        if (!selector) throw new Error('Selector required for click interaction');
        // await manager.click(selector, options);
        break;

      case 'hover':
        if (!selector) throw new Error('Selector required for hover interaction');
        // await manager.hover(selector, options);
        break;

      case 'navigate':
        if (!value) throw new Error('URL required for navigate interaction');
        // await manager.navigate(value, options);
        break;

      case 'scroll':
        // await manager.scroll(options);
        break;

      case 'select':
        if (!selector || !value)
          throw new Error('Selector and value required for select interaction');
        // await manager.select(selector, value, options);
        break;

      case 'type':
        if (!selector || !value)
          throw new Error('Selector and value required for type interaction');
        // await manager.type(selector, value, options);
        break;

      case 'wait':
        if (selector) {
          // await manager.waitForSelector(selector, options);
        } else {
          await humanDelay(delay, delay * 1.2);
        }
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
      `Interaction failed: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
      ScrapingErrorCode.INTERACTION_FAILED,
      { step },
      error instanceof Error ? error : undefined,
    );
  }
}
