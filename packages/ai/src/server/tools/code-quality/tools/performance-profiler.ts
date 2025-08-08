/**
 * Performance Profiler Tool
 *
 * Analyzes bundle sizes, identifies performance bottlenecks, and provides optimization suggestions.
 * Focuses on React/Next.js applications with support for Core Web Vitals.
 *
 * Security Note: This is a development tool that intentionally reads files
 * based on user-provided paths for performance analysis within project context.
 */

/* eslint-disable security/detect-non-literal-fs-filename */

import { logInfo, logWarn } from '@repo/observability';
import { tool } from 'ai';
import { readFile, stat } from 'fs/promises';
import { glob } from 'glob';
import { z } from 'zod';
import { edgeCaseHandler } from '../edge-case-handler';
import { createAsyncLogger } from '../mcp-client';
import { BoundedCache, processInBatches } from '../utils';

const inputSchema = z.object({
  path: z.string().describe('Path to analyze for performance'),
  analysisType: z.enum(['static', 'bundle', 'runtime', 'all']).default('all'),
  framework: z.enum(['next', 'react', 'vue', 'auto']).default('auto'),
  checkImages: z.boolean().default(true),
  checkFonts: z.boolean().default(true),
  maxFiles: z.number().optional().default(500),
  budgets: z
    .object({
      bundleSizeMB: z.number().default(2),
      chunkSizeMB: z.number().default(0.5),
      imageKB: z.number().default(200),
    })
    .optional(),
});

interface PerformanceIssue {
  type: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  file?: string;
  line?: number;
  impact: string;
  suggestion: string;
  metrics?: Record<string, number>;
}

interface BundleAnalysis {
  totalSize: number;
  mainBundleSize: number;
  chunks: Array<{
    name: string;
    size: number;
    modules: string[];
  }>;
  largeDependencies: Array<{
    name: string;
    size: number;
    suggestion: string;
  }>;
}

interface PerformanceReport {
  score: number; // 0-100
  metrics: {
    bundleSize: BundleAnalysis;
    codeIssues: {
      renderOptimizations: number;
      heavyComputations: number;
      memoryLeaks: number;
    };
    assets: {
      unoptimizedImages: number;
      largeFonts: number;
      inlineStyles: number;
    };
  };
  issues: PerformanceIssue[];
  optimizations: Array<{
    title: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    description: string;
    implementation: string;
  }>;
}

// Performance patterns to detect
const PERFORMANCE_PATTERNS = {
  // React performance anti-patterns
  reactIssues: [
    {
      pattern: /\.map\([^)]+\)\.map\(/g,
      issue: 'Multiple array iterations',
      suggestion: 'Combine map operations into a single iteration',
    },
    {
      pattern: /useEffect\(\s*\(\s*\)\s*=>\s*\{[^}]*\},\s*\[\s*\]\s*\)/g,
      issue: 'Empty dependency array with external references',
      suggestion: 'Check if effect uses external values that should be dependencies',
    },
    {
      pattern: /setState\([^)]+\)[\s\S]{0,50}setState\(/g,
      issue: 'Multiple setState calls',
      suggestion: 'Batch state updates or use a single setState with object',
    },
  ],

  // Heavy computations
  computations: [
    {
      pattern: /for\s*\([^)]*\)\s*\{[\s\S]*?for\s*\([^)]*\)\s*\{[\s\S]*?for\s*\(/g,
      issue: 'Triple nested loops',
      suggestion: 'Consider algorithmic optimization or memoization',
    },
    {
      pattern: /\.sort\(\)[^;]*\.(filter|map|reduce)\(/g,
      issue: 'Sorting before filtering',
      suggestion: 'Filter first to reduce sort complexity',
    },
  ],

  // Bundle size issues
  bundleIssues: [
    {
      pattern: /import\s+\*\s+as\s+\w+\s+from\s+['"][^'"]+lodash/g,
      issue: 'Importing entire lodash library',
      suggestion: 'Use lodash-es or import specific methods',
    },
    {
      pattern: /import\s+moment\s+from\s+['"]moment/g,
      issue: 'Using moment.js (large library)',
      suggestion: 'Consider using date-fns or dayjs instead',
    },
  ],
};

class PerformanceProfiler {
  private cache = new BoundedCache({ maxSize: 50 });
  private logger = createAsyncLogger('performance-profiler');

  async profile(options: z.infer<typeof inputSchema>): Promise<PerformanceReport> {
    await this.logger('Starting performance profiling', {
      path: options.path,
      type: options.analysisType,
    });

    const framework = await this.detectFramework(options.path, options.framework);
    const issues: PerformanceIssue[] = [];

    // Initialize report
    const report: PerformanceReport = {
      score: 100,
      metrics: {
        bundleSize: await this.analyzeBundleSize(options.path),
        codeIssues: {
          renderOptimizations: 0,
          heavyComputations: 0,
          memoryLeaks: 0,
        },
        assets: {
          unoptimizedImages: 0,
          largeFonts: 0,
          inlineStyles: 0,
        },
      },
      issues: [],
      optimizations: [],
    };

    // Run different analysis types
    if (options.analysisType === 'all' || options.analysisType === 'static') {
      const staticIssues = await this.runStaticAnalysis(options.path, framework);
      issues.push(...staticIssues);
    }

    if (options.analysisType === 'all' || options.analysisType === 'bundle') {
      const bundleIssues = await this.analyzeBundleIssues(options.path, report.metrics.bundleSize);
      issues.push(...bundleIssues);
    }

    if (options.analysisType === 'all' || options.analysisType === 'runtime') {
      const runtimeIssues = await this.analyzeRuntimePerformance(options.path, framework);
      issues.push(...runtimeIssues);
    }

    // Check assets
    if (options.checkImages) {
      const imageIssues = await this.analyzeImages(options.path, options.budgets?.imageKB);
      issues.push(...imageIssues);
      report.metrics.assets.unoptimizedImages = imageIssues.length;
    }

    if (options.checkFonts) {
      const fontIssues = await this.analyzeFonts(options.path);
      issues.push(...fontIssues);
      report.metrics.assets.largeFonts = fontIssues.length;
    }

    // Update metrics
    report.issues = issues;
    report.metrics.codeIssues.renderOptimizations = issues.filter(
      i => i.category === 'react-render',
    ).length;
    report.metrics.codeIssues.heavyComputations = issues.filter(
      i => i.category === 'computation',
    ).length;
    report.metrics.codeIssues.memoryLeaks = issues.filter(i => i.category === 'memory').length;

    // Calculate score
    report.score = this.calculatePerformanceScore(report);

    // Generate optimizations
    report.optimizations = this.generateOptimizations(report);

    await this.logger('Performance profiling completed', {
      score: report.score,
      issuesFound: issues.length,
    });

    return report;
  }

  private async detectFramework(path: string, preferred: string): Promise<string> {
    if (preferred !== 'auto') return preferred;

    try {
      const packageJson = JSON.parse(await readFile(`${path}/package.json`, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (deps.next) return 'next';
      if (deps.react) return 'react';
      if (deps.vue) return 'vue';
    } catch (error) {
      await this.logger('Could not detect framework', { error });
    }

    return 'react'; // Default
  }

  private async analyzeBundleSize(path: string): Promise<BundleAnalysis> {
    const analysis: BundleAnalysis = {
      totalSize: 0,
      mainBundleSize: 0,
      chunks: [],
      largeDependencies: [],
    };

    // Check for build output
    const buildDirs = ['dist', 'build', '.next'];
    let buildDir: string | null = null;

    for (const dir of buildDirs) {
      try {
        await stat(`${path}/${dir}`);
        buildDir = `${path}/${dir}`;
        break;
      } catch {}
    }

    if (!buildDir) {
      await this.logger('No build directory found for bundle analysis');
      return analysis;
    }

    // Find JS bundles
    const bundles = await glob('**/*.js', {
      cwd: buildDir,
      absolute: true,
      ignore: ['**/*.map', '**/node_modules/**'],
    });

    for (const bundle of bundles) {
      try {
        const stats = await stat(bundle);
        const size = stats.size;
        analysis.totalSize += size;

        const name = bundle.split('/').pop() || 'unknown';
        analysis.chunks.push({
          name,
          size,
          modules: [], // Would need webpack stats for detailed module info
        });

        if (name.includes('main') || name.includes('app')) {
          analysis.mainBundleSize += size;
        }
      } catch (error) {
        await this.logger('Error analyzing bundle', { bundle, error });
      }
    }

    // Check package.json for large dependencies
    try {
      const packageJson = JSON.parse(await readFile(`${path}/package.json`, 'utf8'));
      const largeDeps = [
        { name: 'moment', size: 290000, suggestion: 'Replace with date-fns or dayjs' },
        { name: 'lodash', size: 71000, suggestion: 'Use lodash-es or specific imports' },
        { name: 'jquery', size: 87000, suggestion: 'Use modern JavaScript alternatives' },
        { name: 'axios', size: 53000, suggestion: 'Consider native fetch or smaller alternatives' },
      ];

      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      for (const largeDep of largeDeps) {
        if (deps[largeDep.name]) {
          analysis.largeDependencies.push(largeDep);
        }
      }
    } catch {}

    return analysis;
  }

  private async runStaticAnalysis(path: string, framework: string): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = [];
    const files = await this.findSourceFiles(path);

    await processInBatches(
      files,
      async file => {
        const validation = await edgeCaseHandler.validateFile(file);
        if (!validation.isValid || validation.shouldSkip) return;

        const content = await readFile(file, 'utf8');
        const fileIssues = await this.analyzeFilePerformance(file, content, framework);
        issues.push(...fileIssues);
      },
      { batchSize: 20 },
    );

    return issues;
  }

  private async analyzeFilePerformance(
    file: string,
    content: string,
    framework: string,
  ): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = [];
    const lines = content.split('\n');

    // Check React patterns
    if (framework === 'react' || framework === 'next') {
      for (const { pattern, issue, suggestion } of PERFORMANCE_PATTERNS.reactIssues) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const lineNum = this.getLineNumber(content, match.index);

          issues.push({
            type: 'medium',
            category: 'react-render',
            file,
            line: lineNum,
            impact: issue,
            suggestion,
          });
        }
      }

      // Check for missing React.memo
      if (content.includes('export default function') && !content.includes('React.memo')) {
        const componentMatch = content.match(/export default function\s+(\w+)/);
        if (componentMatch && !componentMatch[1].includes('Page')) {
          issues.push({
            type: 'low',
            category: 'react-render',
            file,
            impact: 'Component not memoized',
            suggestion: 'Consider wrapping with React.memo if re-renders are expensive',
          });
        }
      }
    }

    // Check heavy computations
    for (const { pattern, issue, suggestion } of PERFORMANCE_PATTERNS.computations) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNum = this.getLineNumber(content, match.index);

        issues.push({
          type: 'high',
          category: 'computation',
          file,
          line: lineNum,
          impact: issue,
          suggestion,
        });
      }
    }

    // Check bundle issues
    for (const { pattern, issue, suggestion } of PERFORMANCE_PATTERNS.bundleIssues) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        issues.push({
          type: 'high',
          category: 'bundle-size',
          file,
          impact: issue,
          suggestion,
        });
      }
    }

    return issues;
  }

  private async analyzeBundleIssues(
    path: string,
    bundleAnalysis: BundleAnalysis,
  ): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = [];

    // Check total bundle size
    const totalSizeMB = bundleAnalysis.totalSize / (1024 * 1024);
    if (totalSizeMB > 5) {
      issues.push({
        type: 'critical',
        category: 'bundle-size',
        impact: `Total bundle size is ${totalSizeMB.toFixed(1)}MB`,
        suggestion: 'Enable code splitting and lazy loading for routes',
        metrics: { totalSizeMB },
      });
    } else if (totalSizeMB > 2) {
      issues.push({
        type: 'high',
        category: 'bundle-size',
        impact: `Bundle size is ${totalSizeMB.toFixed(1)}MB`,
        suggestion: 'Consider code splitting and tree shaking',
        metrics: { totalSizeMB },
      });
    }

    // Check for large chunks
    for (const chunk of bundleAnalysis.chunks) {
      const chunkSizeMB = chunk.size / (1024 * 1024);
      if (chunkSizeMB > 0.5) {
        issues.push({
          type: 'medium',
          category: 'bundle-size',
          impact: `Chunk ${chunk.name} is ${chunkSizeMB.toFixed(1)}MB`,
          suggestion: 'Split this chunk or lazy load its contents',
          metrics: { chunkSizeMB },
        });
      }
    }

    // Report large dependencies
    for (const dep of bundleAnalysis.largeDependencies) {
      issues.push({
        type: 'high',
        category: 'dependencies',
        impact: `${dep.name} adds ${(dep.size / 1024).toFixed(0)}KB to bundle`,
        suggestion: dep.suggestion,
        metrics: { sizeKB: dep.size / 1024 },
      });
    }

    return issues;
  }

  private async analyzeRuntimePerformance(
    path: string,
    framework: string,
  ): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = [];

    // Check for performance monitoring setup
    try {
      const packageJson = JSON.parse(await readFile(`${path}/package.json`, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      if (!deps['web-vitals'] && framework === 'next') {
        issues.push({
          type: 'medium',
          category: 'monitoring',
          impact: 'No Core Web Vitals monitoring',
          suggestion: 'Add web-vitals package to monitor real user metrics',
        });
      }
    } catch {}

    // Check for common runtime issues in Next.js
    if (framework === 'next') {
      const pages = await glob('**/pages/**/*.{js,jsx,ts,tsx}', {
        cwd: path,
        ignore: ['**/api/**'],
      });

      for (const page of pages) {
        const content = await readFile(`${path}/${page}`, 'utf8');

        // Check for getServerSideProps (slower than getStaticProps)
        if (content.includes('getServerSideProps')) {
          issues.push({
            type: 'medium',
            category: 'ssr',
            file: page,
            impact: 'Using getServerSideProps increases TTFB',
            suggestion: 'Consider getStaticProps with ISR if data changes infrequently',
          });
        }

        // Check for missing loading states
        if (content.includes('useState') && !content.includes('loading')) {
          issues.push({
            type: 'low',
            category: 'ux',
            file: page,
            impact: 'No loading state for async operations',
            suggestion: 'Add loading indicators for better perceived performance',
          });
        }
      }
    }

    return issues;
  }

  private async analyzeImages(path: string, budgetKB: number = 200): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = [];
    const imagePatterns = ['**/*.{jpg,jpeg,png,gif,webp,svg}'];

    const images = await glob(imagePatterns[0], {
      cwd: path,
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    });

    for (const image of images.slice(0, 50)) {
      // Limit to 50 images
      try {
        const stats = await stat(image);
        const sizeKB = stats.size / 1024;

        if (sizeKB > budgetKB) {
          const ext = image.split('.').pop()?.toLowerCase();

          issues.push({
            type: sizeKB > budgetKB * 2 ? 'high' : 'medium',
            category: 'images',
            file: image,
            impact: `Image is ${sizeKB.toFixed(0)}KB (budget: ${budgetKB}KB)`,
            suggestion: this.getImageOptimizationSuggestion(ext, sizeKB),
            metrics: { sizeKB },
          });
        }
      } catch {}
    }

    return issues;
  }

  private async analyzeFonts(path: string): Promise<PerformanceIssue[]> {
    const issues: PerformanceIssue[] = [];
    const fontPatterns = ['**/*.{woff,woff2,ttf,otf,eot}'];

    const fonts = await glob(fontPatterns[0], {
      cwd: path,
      absolute: true,
    });

    for (const font of fonts) {
      try {
        const stats = await stat(font);
        const sizeKB = stats.size / 1024;

        if (sizeKB > 100) {
          const ext = font.split('.').pop()?.toLowerCase();

          issues.push({
            type: 'medium',
            category: 'fonts',
            file: font,
            impact: `Font file is ${sizeKB.toFixed(0)}KB`,
            suggestion:
              ext !== 'woff2'
                ? 'Convert to WOFF2 format for better compression'
                : 'Consider subsetting the font to reduce size',
            metrics: { sizeKB },
          });
        }
      } catch {}
    }

    return issues;
  }

  private async findSourceFiles(path: string): Promise<string[]> {
    const patterns = ['**/*.{js,jsx,ts,tsx}'];

    const files = await glob(patterns[0], {
      cwd: path,
      absolute: true,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.test.*', '**/*.spec.*'],
    });

    return files.slice(0, 500); // Limit for performance
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  private getImageOptimizationSuggestion(ext: string | undefined, sizeKB: number): string {
    const suggestions = {
      jpg: 'Convert to WebP or use progressive JPEG with 85% quality',
      jpeg: 'Convert to WebP or use progressive JPEG with 85% quality',
      png: 'Convert to WebP or use PNG optimization tools',
      gif: 'Convert to WebP or MP4 for animations',
      svg: 'Optimize with SVGO to remove unnecessary data',
    };

    const base = suggestions[ext as keyof typeof suggestions] || 'Optimize image size';

    if (sizeKB > 1000) {
      return `${base}. Consider resizing - this image is over 1MB!`;
    }

    return base;
  }

  private calculatePerformanceScore(report: PerformanceReport): number {
    let score = 100;

    // Deduct points for issues
    for (const issue of report.issues) {
      switch (issue.type) {
        case 'critical':
          score -= 15;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    }

    // Bundle size penalty
    const bundleSizeMB = report.metrics.bundleSize.totalSize / (1024 * 1024);
    if (bundleSizeMB > 5) score -= 20;
    else if (bundleSizeMB > 2) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  private generateOptimizations(report: PerformanceReport): any[] {
    const optimizations = [];

    // Bundle size optimizations
    if (report.metrics.bundleSize.totalSize > 2 * 1024 * 1024) {
      optimizations.push({
        title: 'Implement Code Splitting',
        impact: 'high',
        effort: 'medium',
        description: 'Split code by routes to reduce initial bundle size',
        implementation: 'Use dynamic imports: const Component = lazy(() => import("./Component"))',
      });
    }

    // React optimizations
    if (report.metrics.codeIssues.renderOptimizations > 0) {
      optimizations.push({
        title: 'Optimize React Renders',
        impact: 'high',
        effort: 'low',
        description: 'Use React.memo and useMemo to prevent unnecessary re-renders',
        implementation: 'Wrap components with React.memo and memoize expensive computations',
      });
    }

    // Image optimizations
    if (report.metrics.assets.unoptimizedImages > 0) {
      optimizations.push({
        title: 'Optimize Images',
        impact: 'high',
        effort: 'low',
        description: 'Use next/image or lazy loading for images',
        implementation: 'Replace <img> with next/image component for automatic optimization',
      });
    }

    // Dependency optimizations
    if (report.metrics.bundleSize.largeDependencies.length > 0) {
      optimizations.push({
        title: 'Replace Heavy Dependencies',
        impact: 'medium',
        effort: 'medium',
        description: 'Replace large libraries with lighter alternatives',
        implementation: report.metrics.bundleSize.largeDependencies[0].suggestion,
      });
    }

    return optimizations;
  }
}

// Create the tool
export const performanceProfilerTool = tool({
  description: 'Profile application performance, analyze bundle sizes, and suggest optimizations',
  inputSchema: inputSchema,
  execute: async input => {
    const profiler = new PerformanceProfiler();
    const result = await profiler.profile(input);

    // Store results in MCP memory - removed for now to fix types
    // const entityName = createEntityName('performance-profile', input.path);
    /* await context.mcp.createEntities({
      entities: [
        {
          name: entityName,
          entityType: 'performance-profile',
          observations: [
            `Performance score: ${result.score}/100`,
            `Found ${result.issues.length} performance issues`,
            `Bundle size: ${(result.metrics.bundleSize.totalSize / (1024 * 1024)).toFixed(1)}MB`,
            safeStringify(result),
          ],
        },
      ],
    }); */

    // Log summary
    logInfo('Performance profiling completed', {
      score: result.score,
      issues: result.issues.length,
      bundleSize: result.metrics.bundleSize.totalSize,
    });

    if (result.score < 70) {
      logWarn('Poor performance score detected', {
        score: result.score,
        criticalIssues: result.issues.filter(i => i.type === 'critical').length,
      });
    }

    return result;
  },
});
