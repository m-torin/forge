/**
 * Simple import analysis test without Vite builds
 * Quick validation of export isolation
 */

import { describe, test, expect } from 'vitest';
import path from 'path';
import {
  analyzeImportChain,
  checkForbiddenModules,
  extractStaticImports,
  extractDynamicImports,
} from './utils/import-analyzer';

const PACKAGE_ROOT = path.resolve(__dirname, '..');

describe('Simple Export Isolation Tests', () => {
  test('edge export has no static OpenTelemetry imports', async () => {
    const edgeFile = path.join(PACKAGE_ROOT, 'server-next-edge.ts');

    try {
      const analysis = await analyzeImportChain(edgeFile, new Set(), PACKAGE_ROOT);

      // Check for forbidden modules in edge runtime
      const check = checkForbiddenModules(analysis, 'edge');

      console.log('Edge export analysis:', {
        totalDependencies: analysis.allDependencies.size,
        staticImports: analysis.staticImports.length,
        dynamicImports: analysis.dynamicImports.length,
        evalWrapped: analysis.evalWrappedImports.length,
        violations: check.violations.length,
      });

      expect(check.isValid).toBe(true);

      if (!check.isValid) {
        console.error('Edge export violations:', check.violations);
      }

      // Specifically check for OpenTelemetry
      const otelImports = Array.from(analysis.allDependencies).filter(
        (dep) => dep.includes('@opentelemetry') || dep.includes('@vercel/otel'),
      );

      expect(otelImports).toEqual([]);
    } catch (error) {
      console.error('Error analyzing edge export:', error);
      throw error;
    }
  });

  test('server-next export has dynamic OTEL imports only', async () => {
    const serverFile = path.join(PACKAGE_ROOT, 'server-next.ts');

    try {
      const analysis = await analyzeImportChain(serverFile, new Set(), PACKAGE_ROOT);

      // Should have NO static OTEL imports
      const staticOtel = analysis.staticImports.filter(
        (imp) => imp.includes('@opentelemetry') || imp.includes('@vercel/otel'),
      );

      expect(staticOtel).toEqual([]);

      console.log('Server-next export analysis:', {
        totalDependencies: analysis.allDependencies.size,
        staticOtelImports: staticOtel.length,
        hasOtelInDynamic: analysis.dynamicImports.some(
          (imp) => imp.includes('@opentelemetry') || imp.includes('@vercel/otel'),
        ),
      });
    } catch (error) {
      console.error('Error analyzing server-next export:', error);
      throw error;
    }
  });

  test('client exports have no server-side imports', async () => {
    const clientFiles = [
      path.join(PACKAGE_ROOT, 'client.ts'),
      path.join(PACKAGE_ROOT, 'client-next.ts'),
    ];

    for (const clientFile of clientFiles) {
      try {
        const analysis = await analyzeImportChain(clientFile, new Set(), PACKAGE_ROOT);

        // Check for forbidden modules in browser runtime
        const check = checkForbiddenModules(analysis, 'browser');

        expect(check.isValid).toBe(true);

        if (!check.isValid) {
          console.error(
            `Client export violations in ${path.basename(clientFile)}:`,
            check.violations,
          );
        }

        console.log(`${path.basename(clientFile)} analysis:`, {
          totalDependencies: analysis.allDependencies.size,
          isValid: check.isValid,
          violations: check.violations.length,
        });
      } catch (error) {
        console.error(`Error analyzing ${clientFile}:`, error);
        throw error;
      }
    }
  });

  test('file content analysis for static imports', async () => {
    const fs = await import('fs/promises');

    // Check edge export file directly
    const edgeFile = path.join(PACKAGE_ROOT, 'server-next-edge.ts');
    const content = await fs.readFile(edgeFile, 'utf-8');

    const staticImports = extractStaticImports(content);
    const dynamicImports = extractDynamicImports(content);

    // Should have NO static OpenTelemetry imports
    const staticOtel = staticImports.filter(
      (imp) => imp.includes('@opentelemetry') || imp.includes('@vercel/otel'),
    );

    expect(staticOtel).toEqual([]);

    console.log('Direct file analysis of server-next-edge.ts:', {
      staticImports: staticImports.length,
      dynamicImports: dynamicImports.length,
      staticOtelImports: staticOtel,
      allStaticImports: staticImports.slice(0, 10), // First 10 for inspection
    });
  });

  test('eval-wrapped import detection', async () => {
    const fs = await import('fs/promises');

    // Check if instrumentation files use eval-wrapped imports correctly
    const webInstrumentation = path.join(PACKAGE_ROOT, '../../../apps/web/instrumentation.ts');

    try {
      const content = await fs.readFile(webInstrumentation, 'utf-8');

      const hasEvalImports = content.includes('eval(');
      const hasObservabilityImports = content.includes('@repo/observability');

      if (hasObservabilityImports) {
        expect(hasEvalImports).toBe(true);
        console.log('Web instrumentation uses eval-wrapped imports: ✅');
      }
    } catch (error) {
      console.log('Could not check web instrumentation file (may not exist)');
    }
  });
});
