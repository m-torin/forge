#!/usr/bin/env node

import { program } from 'commander';
import { createRepoScanner, type RuleSet } from '../src/index.js';

async function main() {
  program
    .name('scan-repo')
    .description('Run OpenGrep/Semgrep analysis on the repository')
    .version('1.0.0');

  program
    .command('scan')
    .description('Scan the repository for security and code quality issues')
    .option('-p, --path <path>', 'Repository path to scan', process.cwd())
    .option(
      '-r, --rules <rules>',
      'Rule sets to run (comma-separated)',
      'security,javascript,typescript',
    )
    .option('-o, --output <file>', 'Output file for results')
    .option('-v, --verbose', 'Verbose output', false)
    .action(async (options) => {
      try {
        const scanner = createRepoScanner();
        const ruleSets = options.rules.split(',').map((r: string) => r.trim()) as RuleSet[];

        console.log('🚀 Starting repository scan...');

        const result = await scanner.scanRepository({
          rootPath: options.path,
          ruleSets,
          outputFile: options.output,
          verbose: options.verbose,
        });

        if (!options.verbose) {
          console.log('\n📊 Scan Results:');
          console.log(`   Files scanned: ${result.summary.filesScanned}`);
          console.log(`   Total issues: ${result.summary.totalIssues}`);
          console.log(`   ❌ Errors: ${result.summary.errorCount}`);
          console.log(`   ⚠️  Warnings: ${result.summary.warningCount}`);
          console.log(`   ℹ️  Info: ${result.summary.infoCount}`);
          console.log(`   ⏱️  Scan time: ${(result.summary.scanTime / 1000).toFixed(2)}s`);
        }

        if (result.summary.errorCount > 0) {
          process.exit(1);
        }
      } catch (error) {
        console.error('❌ Scan failed:', error);
        process.exit(1);
      }
    });

  program
    .command('search')
    .description('Search for specific patterns in the repository')
    .argument('<patterns...>', 'Patterns to search for')
    .option('-p, --path <path>', 'Repository path to search', process.cwd())
    .option('-l, --language <lang>', 'Language to filter by')
    .option('-o, --output <file>', 'Output file for results')
    .option('-v, --verbose', 'Verbose output', false)
    .action(async (patterns, options) => {
      try {
        const scanner = createRepoScanner();

        console.log(`🔍 Searching for patterns: ${patterns.join(', ')}`);

        const results = await scanner.searchInRepository(patterns, {
          rootPath: options.path,
          language: options.language,
          verbose: options.verbose,
        });

        let totalMatches = 0;
        for (const result of results) {
          totalMatches += result.results.length;

          if (!options.verbose && result.results.length > 0) {
            console.log(`\n🎯 Pattern: "${result.query.pattern}"`);
            console.log(`   Matches: ${result.results.length}`);

            // Show first few matches
            const samplesToShow = Math.min(5, result.results.length);
            for (let i = 0; i < samplesToShow; i++) {
              const match = result.results[i];
              console.log(`   📄 ${match.file}:${match.line}:${match.column}`);
            }

            if (result.results.length > samplesToShow) {
              console.log(`   ... and ${result.results.length - samplesToShow} more matches`);
            }
          }
        }

        if (options.output) {
          const fs = await import('fs/promises');
          await fs.writeFile(options.output, JSON.stringify(results, null, 2));
          console.log(`💾 Results saved to: ${options.output}`);
        }

        console.log(`\n✅ Search complete. Total matches: ${totalMatches}`);
      } catch (error) {
        console.error('❌ Search failed:', error);
        process.exit(1);
      }
    });

  program
    .command('deep-analysis')
    .description('Run deep analysis using Semgrep registry rules')
    .option('-p, --path <path>', 'Repository path to scan', process.cwd())
    .option(
      '-l, --languages <langs>',
      'Languages to analyze (comma-separated)',
      'typescript,javascript,terraform,python',
    )
    .option('-o, --output <file>', 'Output file for results')
    .action(async (options) => {
      try {
        const languages = options.languages.split(',').map((l: string) => l.trim());

        console.log('🔬 Running deep analysis with Semgrep registry rules...');
        console.log(`📋 Languages: ${languages.join(', ')}`);

        const { spawn } = await import('child_process');

        const args = [
          '--config=auto', // Use Semgrep's auto-detection for best rules
          '--json',
          '--verbose',
          options.path,
        ];

        const semgrep = spawn('semgrep', args, { stdio: ['pipe', 'pipe', 'pipe'] });

        let output = '';
        let errors = '';

        semgrep.stdout?.on('data', (data) => {
          output += data.toString();
        });

        semgrep.stderr?.on('data', (data) => {
          errors += data.toString();
        });

        semgrep.on('close', async (code) => {
          if (code === 0 || (code === 2 && output)) {
            try {
              const results = JSON.parse(output);

              console.log('\n🔬 Deep Analysis Results:');
              console.log(`   Total findings: ${results.results?.length || 0}`);

              if (results.results?.length > 0) {
                const byLanguage = {} as Record<string, number>;
                const bySeverity = {} as Record<string, number>;

                for (const result of results.results) {
                  const lang = result.extra?.metavars?.language?.[0]?.abstract_content || 'unknown';
                  const severity = result.extra?.severity || 'info';

                  byLanguage[lang] = (byLanguage[lang] || 0) + 1;
                  bySeverity[severity] = (bySeverity[severity] || 0) + 1;
                }

                console.log('\n📊 By Language:');
                Object.entries(byLanguage).forEach(([lang, count]) => {
                  console.log(`   ${lang}: ${count} issues`);
                });

                console.log('\n🚨 By Severity:');
                Object.entries(bySeverity).forEach(([severity, count]) => {
                  console.log(`   ${severity}: ${count} issues`);
                });

                // Show first few findings
                console.log('\n🔍 Sample Findings:');
                for (const result of results.results.slice(0, 5)) {
                  console.log(`   📄 ${result.path}:${result.start?.line || '?'}`);
                  console.log(`      ${result.extra?.message || result.check_id}`);
                }

                if (results.results.length > 5) {
                  console.log(`   ... and ${results.results.length - 5} more findings`);
                }
              }

              if (options.output) {
                const fs = await import('fs/promises');
                await fs.writeFile(options.output, JSON.stringify(results, null, 2));
                console.log(`💾 Detailed results saved to: ${options.output}`);
              }
            } catch (parseError) {
              console.error('❌ Failed to parse results:', parseError);
              console.log('Raw output: ', output),
            }
          } else {
            console.error('❌ Deep analysis failed:', errors);
            process.exit(1);
          }
        });
      } catch (error) {
        console.error('❌ Deep analysis failed:', error);
        process.exit(1);
      }
    });

  program
    .command('quick-scan')
    .description('Run a quick security and quality scan')
    .option('-p, --path <path>', 'Repository path to scan', process.cwd())
    .action(async (options) => {
      try {
        const scanner = createRepoScanner();

        console.log('⚡ Running quick scan...');

        // Run a focused scan on common issues
        const patterns = ['console.log', 'TODO', 'FIXME', 'password.*=.*"', 'api.*key.*=.*"'];

        const [scanResult, searchResults] = await Promise.all([
          scanner.scanRepository({
            rootPath: options.path,
            ruleSets: ['security'],
            verbose: false,
          }),
          scanner.searchInRepository(patterns, {
            rootPath: options.path,
            verbose: false,
          }),
        ]);

        console.log('\n⚡ Quick Scan Results:');
        console.log(
          `   Security issues: ${scanResult.summary.errorCount + scanResult.summary.warningCount}`,
        );

        let totalPatternMatches = 0;
        for (const result of searchResults) {
          totalPatternMatches += result.results.length;
        }
        console.log(`   Pattern matches: ${totalPatternMatches}`);

        if (scanResult.summary.errorCount > 0 || totalPatternMatches > 0) {
          console.log('\n💡 Run full scan for detailed analysis: scan-repo scan --verbose'),
        }
      } catch (error) {
        console.error('❌ Quick scan failed:', error);
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
