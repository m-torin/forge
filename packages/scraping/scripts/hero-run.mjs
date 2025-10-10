#!/usr/bin/env node

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import Hero from '@ulixee/hero-playground';

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.5993.0 Safari/537.36',
];

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageDir = resolve(scriptDir, '..');
const tmpDir = resolve(packageDir, '.tmp');
mkdirSync(tmpDir, { recursive: true });

function printUsage() {
  const relPlaywright = relative(process.cwd(), resolve(packageDir, 'playwright'));
  console.log(`Hero batch scraper

Usage:
  node packages/scraping/scripts/hero-run.mjs <url>
  node packages/scraping/scripts/hero-run.mjs --input urls.txt
  node packages/scraping/scripts/hero-run.mjs --playwright

Options:
  --help              Show this message.
  --input <file>      Read newline separated URLs (optional "label|url" format).
  --playwright        Auto-load PDP URLs from ${relPlaywright}/*.spec.ts.
  --no-screenshot     Skip screenshot capture (HTML is always saved).
  --timeout <ms>      Navigation timeout in milliseconds (default ${DEFAULT_TIMEOUT_MS}).
  --output <dir>      Override output directory (defaults to packages/scraping/.tmp).

Examples:
  node packages/scraping/scripts/hero-run.mjs https://example.com
  node packages/scraping/scripts/hero-run.mjs --playwright --no-screenshot
`);
}

function parseArgs(argv) {
  const options = {
    screenshot: true,
    timeout: DEFAULT_TIMEOUT_MS,
    outputDir: tmpDir,
    targets: [],
    usePlaywright: false,
  };

  const args = [...argv];
  while (args.length) {
    const arg = args.shift();
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        return options;
      case '--input': {
        const file = args.shift();
        if (!file) throw new Error('--input requires a file path');
        options.inputFile = file;
        break;
      }
      case '--playwright':
        options.usePlaywright = true;
        break;
      case '--no-screenshot':
        options.screenshot = false;
        break;
      case '--timeout': {
        const value = args.shift();
        if (!value) throw new Error('--timeout requires a value');
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          throw new Error('--timeout must be a positive number');
        }
        options.timeout = parsed;
        break;
      }
      case '--output': {
        const dir = args.shift();
        if (!dir) throw new Error('--output requires a directory path');
        options.outputDir = resolve(process.cwd(), dir);
        break;
      }
      default:
        options.targets.push({ url: arg });
    }
  }

  return options;
}

function pickUserAgent() {
  return DEFAULT_USER_AGENTS[Math.floor(Math.random() * DEFAULT_USER_AGENTS.length)];
}

function sanitizeLabel(input) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'site';
}

function loadUrlsFromFile(filePath) {
  const content = readFileSync(filePath, 'utf8');
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line) => {
    const [maybeLabel, maybeUrl] = line.split('|');
    if (maybeUrl) {
      return { label: maybeLabel.trim(), url: maybeUrl.trim() };
    }
    return { url: maybeLabel.trim() };
  });
}

function loadUrlsFromPlaywright() {
  const dir = resolve(packageDir, 'playwright');
  const entries = readdirSync(dir).filter((file) => file.endsWith('.spec.ts'));
  const pattern = /const\s+PDP_URL\s*=\s*['"]([^'"\n]+)['"]/;
  const targets = [];
  const seen = new Set();

  for (const file of entries) {
    const fullPath = resolve(dir, file);
    const source = readFileSync(fullPath, 'utf8');
    const match = source.match(pattern);
    if (!match) continue;
    const url = match[1].trim();
    if (seen.has(url)) continue;
    seen.add(url);
    targets.push({ label: basename(file, '.spec.ts'), url });
  }

  return targets;
}

async function runTarget(target, options) {
  const label = target.label ?? target.url;
  const slug = sanitizeLabel(label || new URL(target.url).hostname);
  const hero = new Hero({
    showChrome: false,
    userAgent: pickUserAgent(),
    blockedResourceTypes: ['None'],
    sessionPersistence: false,
  });

  const runStart = Date.now();
  let title = null;
  let htmlPath = null;
  let screenshotPath = null;
  let loadMs = null;
  let totalMs = null;
  let htmlBytes = null;
  const warnings = [];

  try {
    const navStart = Date.now();
    await hero.goto(target.url, { timeoutMs: options.timeout });
    loadMs = Date.now() - navStart;

    await hero.waitForPaintingStable().catch((error) => {
      warnings.push(`waitForPaintingStable: ${error?.message ?? error}`);
    });

    totalMs = Date.now() - runStart;

    const head = await hero.document.head.innerHTML;
    const body = await hero.document.body.innerHTML;
    const fullHtml = `<!DOCTYPE html><html><head>${head}</head><body>${body}</body></html>`;
    htmlBytes = Buffer.byteLength(fullHtml, 'utf8');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseName = `${timestamp}-${slug}`;
    htmlPath = resolve(options.outputDir, `${baseName}.html`);
    writeFileSync(htmlPath, fullHtml, 'utf8');

    if (options.screenshot) {
      try {
        const screenshot = await hero.takeScreenshot({ fullPage: true });
        screenshotPath = resolve(options.outputDir, `${baseName}.png`);
        writeFileSync(screenshotPath, screenshot);
      } catch (error) {
        warnings.push(`screenshot: ${error?.message ?? error}`);
      }
    }

    try {
      title = await hero.document.title;
    } catch (error) {
      warnings.push(`title: ${error?.message ?? error}`);
    }

    return {
      status: 'ok',
      label,
      url: target.url,
      title,
      metrics: { loadMs, totalMs },
      size: { htmlBytes },
      output: {
        html: htmlPath,
        screenshot: screenshotPath,
      },
      warnings,
    };
  } catch (error) {
    return {
      status: 'failed',
      label,
      url: target.url,
      error: error?.message ?? String(error),
      warnings,
    };
  } finally {
    await hero.close().catch(() => {});
  }
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`Argument error: ${error?.message ?? error}`);
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    printUsage();
    return;
  }

  const targets = [];

  if (options.inputFile) {
    targets.push(...loadUrlsFromFile(options.inputFile));
  }

  if (options.usePlaywright) {
    targets.push(...loadUrlsFromPlaywright());
  }

  targets.push(...options.targets);

  if (!targets.length) {
    console.error('No URLs provided.');
    printUsage();
    process.exitCode = 1;
    return;
  }

  mkdirSync(options.outputDir, { recursive: true });

  const uniqueTargets = [];
  const seen = new Set();
  for (const entry of targets) {
    if (!entry?.url) continue;
    const url = entry.url.trim();
    if (!url) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    uniqueTargets.push({ label: entry.label, url });
  }

  const results = [];
  for (const target of uniqueTargets) {
    console.log(`\n▶ ${target.label ?? target.url}`);
    const result = await runTarget(target, options);
    results.push(result);
    if (result.status === 'ok') {
      const htmlRel = relative(process.cwd(), result.output.html);
      const screenshotRel = result.output.screenshot
        ? relative(process.cwd(), result.output.screenshot)
        : null;
      console.log(`  ✓ Title: ${result.title ?? '(unknown)'}`);
      console.log(
        `  ✓ Timing: load ${result.metrics.loadMs} ms · total ${result.metrics.totalMs} ms · HTML ${(result.size.htmlBytes / 1024).toFixed(1)} KB`,
      );
      console.log(`  ✓ HTML: ${htmlRel}`);
      if (screenshotRel) {
        console.log(`  ✓ Screenshot: ${screenshotRel}`);
      } else if (options.screenshot) {
        console.log('  ⚠ Screenshot unavailable');
      }
      for (const warning of result.warnings) {
        console.log(`  ⚠ ${warning}`);
      }
    } else {
      console.error(`  ✗ Failed: ${result.error}`);
      for (const warning of result.warnings) {
        console.error(`  ⚠ ${warning}`);
      }
    }
  }

  const summary = results.map((result) => ({
    label: result.label,
    status: result.status,
    loadMs: result.metrics?.loadMs ?? null,
    totalMs: result.metrics?.totalMs ?? null,
    htmlKB: result.size ? Number((result.size.htmlBytes / 1024).toFixed(1)) : null,
  }));

  console.log('\nSummary');
  console.table(summary);

  if (results.some((result) => result.status !== 'ok')) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Hero run failed:', error);
  process.exitCode = 1;
});
