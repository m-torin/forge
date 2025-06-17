#!/usr/bin/env node

import { program } from 'commander';
import { createCamoufoxServer } from '../src/index.js';

async function main() {
  program.name('camoufox').description('Camoufox browser automation CLI').version('1.0.0');

  program
    .command('scrape')
    .description('Scrape a website')
    .argument('<url>', 'URL to scrape')
    .option('-s, --selectors <selectors>', 'JSON string of CSS selectors to extract')
    .option('-l, --links', 'Extract all links', false)
    .option('-i, --images', 'Extract all images', false)
    .option('-S, --screenshot', 'Take screenshot', false)
    .option('-p, --pdf', 'Generate PDF', false)
    .option('-h, --headless', 'Run in headless mode', true)
    .option('-e, --engine <engine>', 'Browser engine (chromium|firefox|webkit)', 'chromium')
    .option('-o, --output <file>', 'Output file for results')
    .action(async (url, options) => {
      try {
        const camoufox = createCamoufoxServer({
          headless: options.headless,
          stealth: true,
        });

        console.log(`🦊 Scraping ${url}...`);

        let selectors = {};
        if (options.selectors) {
          try {
            selectors = JSON.parse(options.selectors);
          } catch {
            console.error('❌ Invalid JSON for selectors');
            process.exit(1);
          }
        }

        const result = await camoufox.scrapeUrl(
          {
            url,
            extract: {
              selectors,
              links: options.links,
              images: options.images,
            },
            screenshot: options.screenshot,
            pdf: options.pdf,
            source: false,
          },
          {
            engine: options.engine as any,
            config: { headless: options.headless },
          },
        );

        if (result.success) {
          console.log('✅ Scraping successful!');
          console.log(`📄 Title: ${result.metadata.title}`);
          console.log(`⏱️  Load time: ${result.metadata.loadTime}ms`);
          console.log(`🔗 Final URL: ${result.metadata.finalUrl}`);

          if (result.data) {
            console.log('\n📊 Extracted data:');
            console.log(JSON.stringify(result.data, null, 2));
          }

          if (options.output) {
            const fs = await import('fs/promises');
            await fs.writeFile(options.output, JSON.stringify(result, null, 2));
            console.log(`💾 Results saved to: ${options.output}`);
          }

          if (result.screenshot && options.screenshot) {
            const fs = await import('fs/promises');
            await fs.writeFile('./screenshot.png', result.screenshot, 'base64');
            console.log('📸 Screenshot saved to: ./screenshot.png'),
          }

          if (result.pdf && options.pdf) {
            const fs = await import('fs/promises');
            await fs.writeFile('./page.pdf', result.pdf, 'base64');
            console.log('📄 PDF saved to: ./page.pdf'),
          }
        } else {
          console.error('❌ Scraping failed:', result.errors);
          process.exit(1);
        }

        await camoufox.close();
      } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
      }
    });

  program
    .command('fetch-code')
    .description('Fetch code from a URL')
    .argument('<url>', 'URL containing code')
    .option('-s, --selector <selector>', 'CSS selector for code elements')
    .option('-o, --output <file>', 'Output file for code')
    .action(async (url, options) => {
      try {
        const camoufox = createCamoufoxServer();

        console.log(`💻 Fetching code from ${url}...`);

        const result = await camoufox.fetchCode(url, options.selector);

        if (result.success) {
          console.log('✅ Code fetched successfully!');
          console.log(`📝 Language: ${result.language || 'unknown'}`);
          console.log(`📏 Length: ${result.code.length} characters`);

          if (options.output) {
            const fs = await import('fs/promises');
            await fs.writeFile(options.output, result.code);
            console.log(`💾 Code saved to: ${options.output}`);
          } else {
            console.log('\n📄 Code preview:');
            console.log(result.code.substring(0, 500) + (result.code.length > 500 ? '...' : '')),
          }
        } else {
          console.error('❌ Failed to fetch code');
          process.exit(1);
        }

        await camoufox.close();
      } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
      }
    });

  program
    .command('test')
    .description('Test a webpage')
    .argument('<url>', 'URL to test')
    .option('-t, --tests <tests>', 'JSON string of tests to run')
    .option('-e, --engine <engine>', 'Browser engine', 'chromium')
    .action(async (url, options) => {
      try {
        const camoufox = createCamoufoxServer();

        console.log(`🧪 Testing ${url}...`);

        let tests = [
          { name: 'Page loads', type: 'element-exists', selector: 'body' },
          { name: 'Has title', type: 'element-exists', selector: 'title' },
        ];

        if (options.tests) {
          try {
            tests = JSON.parse(options.tests);
          } catch {
            console.error('❌ Invalid JSON for tests');
            process.exit(1);
          }
        }

        const result = await camoufox.testPage(
          {
            url,
            tests,
          },
          {
            engine: options.engine as any,
            config: { headless: true },
          },
        );

        console.log('\n🧪 Test Results:');
        console.log(`📊 ${result.summary.passed}/${result.summary.total} tests passed`);
        console.log(`⏱️  Total time: ${result.summary.duration}ms`);

        for (const test of result.results) {
          const icon = test.passed ? '✅' : '❌';
          console.log(`${icon} ${test.name} (${test.duration}ms)`);
          if (test.error) {
            console.log(`   Error: ${test.error}`);
          }
        }

        if (result.screenshot) {
          const fs = await import('fs/promises');
          await fs.writeFile('./test-screenshot.png', result.screenshot, 'base64');
          console.log('📸 Test screenshot saved to: ./test-screenshot.png'),
        }

        await camoufox.close();

        if (result.summary.failed > 0) {
          process.exit(1);
        }
      } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
      }
    });

  program
    .command('launch')
    .description('Launch browser for manual testing')
    .option('-e, --engine <engine>', 'Browser engine', 'chromium')
    .option('-h, --headless', 'Run in headless mode', false)
    .option('-d, --devtools', 'Open devtools', false)
    .action(async (options) => {
      try {
        const camoufox = createCamoufoxServer();

        console.log(`🚀 Launching ${options.engine} browser...`);

        const browser = await camoufox.client.launch({
          engine: options.engine as any,
          config: {
            headless: options.headless,
            stealth: true,
          },
          devtools: options.devtools,
        });

        console.log('✅ Browser launched successfully!');
        console.log('Press Ctrl+C to close browser and exit');

        // Keep process alive
        process.on('SIGINT', async () => {
          console.log('\n🔄 Closing browser...');
          await browser.close();
          console.log('✅ Browser closed');
          process.exit(0);
        });

        // Prevent process from exiting
        setInterval(() => {}, 1000);
      } catch (error) {
        console.error('❌ Error launching browser:', error);
        process.exit(1);
      }
    });

  await program.parseAsync();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ CLI error:', error);
    process.exit(1);
  });
}
