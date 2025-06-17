#!/usr/bin/env node

import { program } from 'commander';
import { createFirecrawlDockerManager } from '../src/docker.js';
import { createFirecrawlClient } from '../src/client.js';

async function main() {
  program
    .name('firecrawl')
    .description('Firecrawl local deployment management CLI')
    .version('1.0.0');

  program
    .command('setup')
    .description('Set up Firecrawl environment and configuration')
    .option('-p, --port <port>', 'API port', '3002')
    .action(async (options) => {
      try {
        const manager = createFirecrawlDockerManager({
          ports: { api: parseInt(options.port) },
        });

        console.log('🔧 Setting up Firecrawl environment...');
        await manager.setupEnvironment();

        console.log('🏗️  Building Firecrawl services...');
        await manager.build();

        console.log('✅ Setup completed successfully!');
        console.log(`📡 API will be available at: http://localhost:${options.port}`);
        console.log('🚀 Run "firecrawl start" to launch the services');
      } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
      }
    });

  program
    .command('start')
    .description('Start Firecrawl services')
    .option('-d, --detach', 'Run in background', true)
    .option('-b, --build', 'Build before starting', false)
    .action(async (options) => {
      try {
        const manager = createFirecrawlDockerManager();

        if (options.build) {
          console.log('🏗️  Building services...');
          await manager.build();
        }

        await manager.start();

        const apiUrl = await manager.getApiUrl();
        console.log(`🎉 Firecrawl is running at: ${apiUrl}`);
        console.log('📊 Check status: firecrawl status');
        console.log('📝 View logs: firecrawl logs'),
      } catch (error) {
        console.error('❌ Failed to start:', error);
        process.exit(1);
      }
    });

  program
    .command('stop')
    .description('Stop Firecrawl services')
    .action(async () => {
      try {
        const manager = createFirecrawlDockerManager();
        await manager.stop();
      } catch (error) {
        console.error('❌ Failed to stop:', error);
        process.exit(1);
      }
    });

  program
    .command('restart')
    .description('Restart Firecrawl services')
    .action(async () => {
      try {
        const manager = createFirecrawlDockerManager();
        await manager.restart();

        const apiUrl = await manager.getApiUrl();
        console.log(`🎉 Firecrawl restarted at: ${apiUrl}`);
      } catch (error) {
        console.error('❌ Failed to restart:', error);
        process.exit(1);
      }
    });

  program
    .command('status')
    .description('Show service status')
    .option('-w, --watch', 'Watch status updates', false)
    .action(async (options) => {
      try {
        const manager = createFirecrawlDockerManager();

        const showStatus = async () => {
          const services = await manager.getStatus();
          const isHealthy = await manager.isHealthy();

          console.clear();
          console.log('🦊 Firecrawl Service Status\n');

          console.log(`Overall Health: ${isHealthy ? '🟢 Healthy' : '🔴 Unhealthy'}\n`);

          if (services.length === 0) {
            console.log('❌ No services found. Run "firecrawl start" to launch services.');
            return;
          }

          services.forEach((service) => {
            const statusIcon = service.status === 'running' ? '🟢' : '🔴';
            const healthIcon =
              service.health === 'healthy' ? '🟢' : service.health === 'unhealthy' ? '🔴' : '🟡';

            console.log(`${statusIcon} ${service.name}`);
            console.log(`   Status: ${service.status}`);
            if (service.health) console.log(`   Health: ${healthIcon} ${service.health}`);
            if (service.ports?.length) console.log(`   Ports: ${service.ports.join(', ')}`);
            if (service.uptime) console.log(`   Uptime: ${service.uptime}`);
            console.log();
          });

          const apiUrl = await manager.getApiUrl();
          console.log(`📡 API Endpoint: ${apiUrl}`);
          console.log(`📊 API Health: ${isHealthy ? '✅ Ready' : '❌ Not Ready'}`);
        };

        if (options.watch) {
          console.log('👀 Watching status updates (Press Ctrl+C to exit)...\n');

          const interval = setInterval(showStatus, 3000);
          process.on('SIGINT', () => {
            clearInterval(interval);
            console.log('\n👋 Stopped watching');
            process.exit(0);
          });

          await showStatus();
        } else {
          await showStatus();
        }
      } catch (error) {
        console.error('❌ Failed to get status:', error);
        process.exit(1);
      }
    });

  program
    .command('logs')
    .description('Show service logs')
    .option('-f, --follow', 'Follow log output', false)
    .option('-t, --tail <lines>', 'Number of lines to show', '100')
    .option('-s, --service <service>', 'Show logs for specific service')
    .action(async (options) => {
      try {
        const manager = createFirecrawlDockerManager();

        if (options.follow) {
          console.log('📝 Following logs (Press Ctrl+C to exit)...\n');

          // Use docker compose logs -f for live following
          const { execaCommand } = await import('execa');
          const serviceArg = options.service ? options.service : '';

          const child = execaCommand(
            `docker compose -f docker-compose.yaml logs -f --tail ${options.tail} ${serviceArg}`,
            {
              cwd: '../firecrawl-repo',
              stdio: 'inherit',
            },
          );

          process.on('SIGINT', () => {
            child.kill();
            console.log('\n👋 Stopped following logs');
            process.exit(0);
          });

          await child;
        } else {
          const logs = await manager.getLogs(options.service, parseInt(options.tail));
          console.log(logs);
        }
      } catch (error) {
        console.error('❌ Failed to get logs:', error);
        process.exit(1);
      }
    });

  program
    .command('health')
    .description('Check API health')
    .option('-u, --url <url>', 'API URL', 'http://localhost:3002')
    .action(async (options) => {
      try {
        const client = createFirecrawlClient({ apiUrl: options.url });

        console.log('🏥 Checking Firecrawl health...');

        const health = await client.health();

        console.log(`\n📊 Health Status: ${health.status}`);
        console.log(`🕐 Timestamp: ${health.timestamp}`);
        console.log(`📦 Version: ${health.version}`);
        console.log(`⏱️  Uptime: ${health.uptime}ms`);

        if (health.services) {
          console.log('\n🔧 Service Details:');
          Object.entries(health.services).forEach(([name, service]) => {
            console.log(`  ${name}: ${service.status}`);
          });
        }
      } catch (error) {
        console.error('❌ Health check failed:', error);
        process.exit(1);
      }
    });

  program
    .command('scrape')
    .description('Scrape a single URL')
    .argument('<url>', 'URL to scrape')
    .option('-m, --markdown', 'Extract as markdown', false)
    .option('-h, --html', 'Include HTML', false)
    .option('-s, --screenshot', 'Take screenshot', false)
    .option('-o, --output <file>', 'Output file')
    .option('-u, --api-url <url>', 'API URL', 'http://localhost:3002')
    .action(async (url, options) => {
      try {
        const client = createFirecrawlClient({ apiUrl: options.apiUrl });

        console.log(`🔍 Scraping: ${url}`);

        const result = await client.scrape({
          url,
          extractConfig: {
            onlyMainContent: true,
            includeHtml: options.html,
            extractorOptions: {
              mode: options.markdown ? 'markdown' : 'structured',
            },
          },
          includeScreenshot: options.screenshot,
        });

        if (result.success) {
          console.log('✅ Scraping successful!');
          console.log(`📄 Title: ${result.metadata?.title || 'N/A'}`);

          if (options.output) {
            const fs = await import('fs/promises');
            const content = options.markdown
              ? result.content?.markdown
              : JSON.stringify(result, null, 2);

            await fs.writeFile(options.output, content || '');
            console.log(`💾 Content saved to: ${options.output}`);
          } else {
            const content = options.markdown
              ? result.content?.markdown?.substring(0, 500)
              : JSON.stringify(result.content, null, 2).substring(0, 500);

            console.log('\n📄 Content preview:');
            console.log(content + '...');
          }
        } else {
          console.error('❌ Scraping failed:', result.error);
          process.exit(1);
        }
      } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
      }
    });

  program
    .command('crawl')
    .description('Crawl a website')
    .argument('<url>', 'URL to crawl')
    .option('-d, --max-depth <depth>', 'Maximum crawl depth', '2')
    .option('-l, --limit <limit>', 'Maximum pages to crawl', '10')
    .option('-o, --output <file>', 'Output file for results')
    .option('-u, --api-url <url>', 'API URL', 'http://localhost:3002')
    .action(async (url, options) => {
      try {
        const client = createFirecrawlClient({ apiUrl: options.apiUrl });

        console.log(`🕷️  Starting crawl of: ${url}`);
        console.log(`📊 Max depth: ${options.maxDepth}, Limit: ${options.limit}`);

        const result = await client.crawlSite(url, {
          maxDepth: parseInt(options.maxDepth),
          limit: parseInt(options.limit),
          onProgress: (status) => {
            console.log(`🔄 Progress: ${status.current || 0}/${status.total || 0} pages`);
          },
        });

        if (result.success) {
          console.log('✅ Crawl completed successfully!');
          console.log(`📊 Total pages: ${result.total}`);
          console.log(`✅ Completed: ${result.completed}`);
          console.log(`💰 Credits used: ${result.creditsUsed}`);

          if (options.output) {
            const fs = await import('fs/promises');
            await fs.writeFile(options.output, JSON.stringify(result, null, 2));
            console.log(`💾 Results saved to: ${options.output}`);
          }
        } else {
          console.error('❌ Crawl failed:', result.error);
          process.exit(1);
        }
      } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
      }
    });

  program
    .command('cleanup')
    .description('Clean up all Firecrawl resources')
    .option('-y, --yes', 'Skip confirmation', false)
    .action(async (options) => {
      try {
        if (!options.yes) {
          const readline = await import('readline');
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
          });

          const answer = await new Promise<string>((resolve) => {
            rl.question(
              '⚠️  This will remove all Firecrawl containers, networks, and volumes. Continue? (y/N): ',
              resolve,
            );
          });

          rl.close();

          if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
            console.log('❌ Cleanup cancelled');
            return;
          }
        }

        const manager = createFirecrawlDockerManager();
        await manager.cleanup();
      } catch (error) {
        console.error('❌ Cleanup failed:', error);
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
