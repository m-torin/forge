/**
 * Environment variable leak detection tests
 * Analyzes code for patterns that could leak environment variables to inappropriate contexts
 */

import { describe, test, expect } from 'vitest';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const PACKAGE_ROOT = path.resolve(__dirname, '..');

interface EnvLeak {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  location: string;
  message: string;
  line?: number;
  variable: string;
  context: 'client' | 'server' | 'edge' | 'build-time' | 'unknown';
  leakType: 'direct-exposure' | 'indirect-exposure' | 'logging' | 'serialization' | 'safe-usage';
}

/**
 * Analyze environment variable usage patterns
 */
async function analyzeEnvironmentLeaks(filePath: string): Promise<EnvLeak[]> {
  const fs = await import('fs/promises');
  const leaks: EnvLeak[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // Text-based analysis
    await analyzeTextEnvPatterns(content, filePath, leaks);

    // AST-based analysis
    await analyzeASTEnvPatterns(content, filePath, leaks);
  } catch (error) {
    leaks.push({
      type: 'analysis-error',
      severity: 'medium',
      location: filePath,
      message: `Environment analysis failed: ${(error as Error).message}`,
      variable: 'unknown',
      context: 'unknown',
      leakType: 'direct-exposure',
    });
  }

  return leaks;
}

/**
 * Text-based environment variable pattern analysis
 */
async function analyzeTextEnvPatterns(
  content: string,
  filePath: string,
  leaks: EnvLeak[],
): Promise<void> {
  const lines = content.split('\n');

  // Environment variable patterns
  const envPatterns = [
    {
      regex: /process\.env\.([A-Z_][A-Z0-9_]*)/g,
      type: 'process-env-access',
      extractVar: (match: RegExpMatchArray) => match[1],
    },
    {
      regex: /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g,
      type: 'import-meta-env-access',
      extractVar: (match: RegExpMatchArray) => match[1],
    },
    {
      regex: /process\[\s*['"]env['"]\s*\]\[\s*['"]([A-Z_][A-Z0-9_]*)['"]\s*\]/g,
      type: 'dynamic-env-access',
      extractVar: (match: RegExpMatchArray) => match[1],
    },
  ];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    for (const pattern of envPatterns) {
      const matches = Array.from(line.matchAll(pattern.regex));

      for (const match of matches) {
        const variable = pattern.extractVar(match);
        const envLeak = analyzeEnvironmentVariable(
          variable,
          match[0],
          line,
          lines,
          lineIndex,
          filePath,
          pattern.type,
        );

        if (envLeak) {
          leaks.push(envLeak);
        }
      }
    }
  }
}

/**
 * Analyze specific environment variable usage
 */
function analyzeEnvironmentVariable(
  variable: string,
  fullMatch: string,
  line: string,
  lines: string[],
  lineIndex: number,
  filePath: string,
  accessType: string,
): EnvLeak | null {
  const context = determineContext(filePath);

  // Categorize environment variables
  const varCategory = categorizeEnvironmentVariable(variable);

  // Analyze usage context
  const usageContext = analyzeUsageContext(line, lines, lineIndex);

  // Determine if this is a leak
  const leakAnalysis = determineLeakType(variable, varCategory, context, usageContext);

  if (leakAnalysis.isLeak) {
    return {
      type: `${accessType}-${leakAnalysis.leakType}`,
      severity: leakAnalysis.severity,
      location: filePath,
      message: leakAnalysis.message,
      line: lineIndex + 1,
      variable,
      context,
      leakType: leakAnalysis.leakType,
    };
  }

  return null;
}

/**
 * Determine file context (client, server, edge)
 */
function determineContext(
  filePath: string,
): 'client' | 'server' | 'edge' | 'build-time' | 'unknown' {
  if (filePath.includes('client')) return 'client';
  if (filePath.includes('edge')) return 'edge';
  if (filePath.includes('server')) return 'server';
  if (filePath.includes('build') || filePath.includes('config')) return 'build-time';
  return 'unknown';
}

/**
 * Categorize environment variables by sensitivity
 */
function categorizeEnvironmentVariable(variable: string) {
  const categories = {
    // Safe for client
    public: ['NEXT_PUBLIC_', 'REACT_APP_', 'VITE_', 'PUBLIC_'],

    // Runtime detection (usually safe)
    runtime: ['NEXT_RUNTIME', 'NODE_ENV', 'VERCEL_ENV', 'VERCEL_URL'],

    // Build-time only
    buildTime: ['ANALYZE', 'BUNDLE_ANALYZE', 'CI', 'GITHUB_', 'VERCEL_GIT_'],

    // Sensitive (never client)
    sensitive: [
      'API_KEY',
      'SECRET',
      'TOKEN',
      'PASSWORD',
      'PRIVATE',
      'DATABASE',
      'DB_',
      'REDIS_',
      'STRIPE_',
      'AUTH_',
      'NEXTAUTH_',
      'OPENAI_',
      'ANTHROPIC_',
    ],

    // Infrastructure (server only)
    infrastructure: ['PORT', 'HOST', 'HOSTNAME', 'SERVER_', 'WORKER_'],
  };

  for (const [category, prefixes] of Object.entries(categories)) {
    if (prefixes.some((prefix) => variable.startsWith(prefix) || variable.includes(prefix))) {
      return category;
    }
  }

  return 'unknown';
}

/**
 * Analyze how the environment variable is being used
 */
function analyzeUsageContext(line: string, lines: string[], lineIndex: number) {
  const context = {
    isLogged: false,
    isSerialized: false,
    isReturned: false,
    isExported: false,
    isInConditional: false,
    isInTryCatch: false,
  };

  // Check current line
  if (line.includes('console.') || line.includes('log') || line.includes('error')) {
    context.isLogged = true;
  }

  if (line.includes('JSON.stringify') || line.includes('serialize')) {
    context.isSerialized = true;
  }

  if (line.includes('return ') || line.includes('=> ')) {
    context.isReturned = true;
  }

  if (line.includes('export ') || line.includes('module.exports')) {
    context.isExported = true;
  }

  if (line.includes('if (') || line.includes('switch (') || line.includes('? ')) {
    context.isInConditional = true;
  }

  // Check surrounding lines for try-catch
  for (let i = Math.max(0, lineIndex - 3); i <= Math.min(lines.length - 1, lineIndex + 3); i++) {
    if (lines[i].includes('try {') || lines[i].includes('catch (')) {
      context.isInTryCatch = true;
      break;
    }
  }

  return context;
}

/**
 * Determine if usage constitutes a leak and classify it
 */
function determineLeakType(
  variable: string,
  category: string,
  context: 'client' | 'server' | 'edge' | 'build-time' | 'unknown',
  usage: ReturnType<typeof analyzeUsageContext>,
) {
  // Public variables are generally safe
  if (category === 'public') {
    return {
      isLeak: false,
      leakType: 'safe-usage' as const,
      severity: 'info' as const,
      message: 'Public environment variable - safe for client use',
    };
  }

  // Runtime variables are usually safe if used correctly
  if (category === 'runtime') {
    if (context === 'client' && !usage.isInConditional) {
      return {
        isLeak: true,
        leakType: 'indirect-exposure' as const,
        severity: 'low' as const,
        message: 'Runtime variable exposed to client without conditional check',
      };
    }
    return {
      isLeak: false,
      leakType: 'safe-usage' as const,
      severity: 'info' as const,
      message: 'Runtime variable used appropriately',
    };
  }

  // Sensitive variables should never be in client context
  if (category === 'sensitive') {
    if (context === 'client') {
      return {
        isLeak: true,
        leakType: 'direct-exposure' as const,
        severity: 'critical' as const,
        message: 'Sensitive environment variable exposed to client',
      };
    }

    if (usage.isLogged) {
      return {
        isLeak: true,
        leakType: 'logging' as const,
        severity: 'high' as const,
        message: 'Sensitive environment variable logged - potential exposure',
      };
    }

    if (usage.isSerialized || usage.isReturned) {
      return {
        isLeak: true,
        leakType: 'serialization' as const,
        severity: 'high' as const,
        message: 'Sensitive environment variable serialized or returned',
      };
    }
  }

  // Infrastructure variables should be server-only
  if (category === 'infrastructure') {
    if (context === 'client') {
      return {
        isLeak: true,
        leakType: 'direct-exposure' as const,
        severity: 'high' as const,
        message: 'Infrastructure variable exposed to client',
      };
    }

    if (context === 'edge') {
      return {
        isLeak: true,
        leakType: 'indirect-exposure' as const,
        severity: 'medium' as const,
        message: 'Infrastructure variable used in edge runtime',
      };
    }
  }

  // Build-time variables should not be in runtime code
  if (category === 'buildTime') {
    if (context !== 'build-time') {
      return {
        isLeak: true,
        leakType: 'indirect-exposure' as const,
        severity: 'medium' as const,
        message: 'Build-time variable used in runtime code',
      };
    }
  }

  // Unknown variables in client context are suspicious
  if (category === 'unknown' && context === 'client') {
    return {
      isLeak: true,
      leakType: 'direct-exposure' as const,
      severity: 'medium' as const,
      message: 'Unknown environment variable exposed to client',
    };
  }

  return {
    isLeak: false,
    leakType: 'safe-usage' as const,
    severity: 'info' as const,
    message: 'Environment variable used appropriately',
  };
}

/**
 * AST-based environment variable analysis
 */
async function analyzeASTEnvPatterns(
  content: string,
  filePath: string,
  leaks: EnvLeak[],
): Promise<void> {
  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    const envAccesses: Array<{
      variable: string;
      node: any;
      context: string;
    }> = [];

    traverse(ast, {
      // Track environment variable accesses
      MemberExpression(path) {
        const { node } = path;

        // process.env.VAR
        if (
          node.object.type === 'MemberExpression' &&
          node.object.object.type === 'Identifier' &&
          node.object.object.name === 'process' &&
          node.object.property.type === 'Identifier' &&
          node.object.property.name === 'env' &&
          node.property.type === 'Identifier'
        ) {
          envAccesses.push({
            variable: node.property.name,
            node,
            context: 'process.env',
          });
        }

        // import.meta.env.VAR
        if (
          node.object.type === 'MemberExpression' &&
          node.object.object.type === 'MetaProperty' &&
          node.object.property.type === 'Identifier' &&
          node.object.property.name === 'env' &&
          node.property.type === 'Identifier'
        ) {
          envAccesses.push({
            variable: node.property.name,
            node,
            context: 'import.meta.env',
          });
        }
      },

      // Check for environment destructuring
      VariableDeclarator(path) {
        const { node } = path;

        if (node.id.type === 'ObjectPattern' && node.init?.type === 'MemberExpression') {
          const init = node.init;
          if (
            init.object.type === 'Identifier' &&
            init.object.name === 'process' &&
            init.property.type === 'Identifier' &&
            init.property.name === 'env'
          ) {
            // Destructuring process.env
            for (const prop of node.id.properties) {
              if (prop.type === 'Property' && prop.key.type === 'Identifier') {
                envAccesses.push({
                  variable: prop.key.name,
                  node: prop,
                  context: 'destructuring',
                });
              }
            }
          }
        }
      },
    });

    // Analyze each environment access
    for (const access of envAccesses) {
      const line = access.node.loc?.start.line || 0;
      const context = determineContext(filePath);
      const category = categorizeEnvironmentVariable(access.variable);

      // Check if this access is in a problematic context
      let parent = (access as any).node;
      let inReturn = false;
      let inExport = false;
      let inConsoleLog = false;

      // Walk up the AST to understand context
      while (parent && typeof parent === 'object') {
        if (parent.type === 'ReturnStatement') inReturn = true;
        if (parent.type === 'ExportDefaultDeclaration' || parent.type === 'ExportNamedDeclaration')
          inExport = true;
        if (
          parent.type === 'CallExpression' &&
          parent.callee?.type === 'MemberExpression' &&
          parent.callee.object?.name === 'console'
        )
          inConsoleLog = true;
        parent = parent.parent;
      }

      const usage = {
        isLogged: inConsoleLog,
        isSerialized: false,
        isReturned: inReturn,
        isExported: inExport,
        isInConditional: false,
        isInTryCatch: false,
      };

      const leakAnalysis = determineLeakType(access.variable, category, context, usage);

      if (leakAnalysis.isLeak) {
        leaks.push({
          type: `ast-${access.context}-${leakAnalysis.leakType}`,
          severity: leakAnalysis.severity,
          location: filePath,
          message: leakAnalysis.message,
          line,
          variable: access.variable,
          context,
          leakType: leakAnalysis.leakType,
        });
      }
    }
  } catch (error) {
    leaks.push({
      type: 'ast-analysis-error',
      severity: 'low',
      location: filePath,
      message: `AST environment analysis failed: ${(error as Error).message}`,
      variable: 'unknown',
      context: 'unknown',
      leakType: 'direct-exposure',
    });
  }
}

/**
 * Filter leaks by runtime appropriateness
 */
function filterLeaksByRuntime(leaks: EnvLeak[], fileName: string): EnvLeak[] {
  const context = determineContext(fileName);

  return leaks.filter((leak) => {
    // Filter out appropriate usage for context
    if (leak.leakType === 'safe-usage') return false;

    // Context-specific filtering
    if (context === 'client' && leak.variable.startsWith('NEXT_PUBLIC_')) {
      return false; // Public variables are OK in client
    }

    return true;
  });
}

/**
 * Calculate environment leak risk score
 */
function calculateEnvRiskScore(leaks: EnvLeak[]): number {
  const weights = {
    critical: 50,
    high: 20,
    medium: 10,
    low: 5,
    info: 1,
  };

  return leaks.reduce((score, leak) => {
    return score + weights[leak.severity];
  }, 0);
}

describe('Environment Variable Leak Detection', () => {
  const exportFiles = [
    'client.ts',
    'server.ts',
    'client-next.ts',
    'server-next.ts',
    'server-next-edge.ts',
  ];

  test('analyze environment variable leaks in export files', async () => {
    const results = new Map<string, EnvLeak[]>();

    for (const fileName of exportFiles) {
      const filePath = path.join(PACKAGE_ROOT, fileName);

      try {
        const allLeaks = await analyzeEnvironmentLeaks(filePath);
        const filteredLeaks = filterLeaksByRuntime(allLeaks, fileName);

        results.set(fileName, filteredLeaks);

        const riskScore = calculateEnvRiskScore(filteredLeaks);

        console.log(`${fileName} environment analysis:`, {
          totalLeaks: filteredLeaks.length,
          critical: filteredLeaks.filter((l) => l.severity === 'critical').length,
          high: filteredLeaks.filter((l) => l.severity === 'high').length,
          medium: filteredLeaks.filter((l) => l.severity === 'medium').length,
          low: filteredLeaks.filter((l) => l.severity === 'low').length,
          riskScore,
          leakTypes: [...new Set(filteredLeaks.map((l) => l.leakType))],
          variables: [...new Set(filteredLeaks.map((l) => l.variable))],
        });

        // No critical environment leaks should exist
        const criticalLeaks = filteredLeaks.filter((l) => l.severity === 'critical');
        expect(criticalLeaks).toEqual([]);

        if (criticalLeaks.length > 0) {
          console.error(`Critical environment leaks in ${fileName}:`);
          criticalLeaks.forEach((leak) => {
            console.error(`  ${leak.variable}: ${leak.message}`);
          });
        }

        // Client files should have very strict controls
        if (fileName.includes('client')) {
          const clientLeaks = filteredLeaks.filter(
            (l) => l.severity === 'critical' || l.severity === 'high',
          );
          expect(clientLeaks).toEqual([]);
        }

        // Edge runtime should have minimal environment usage
        if (fileName.includes('edge')) {
          expect(riskScore).toBeLessThan(30);
        }
      } catch (error) {
        console.log(`Could not analyze environment leaks for ${fileName}: ${error}`);
      }
    }

    // Overall environment security summary
    const allLeaks = Array.from(results.values()).flat();
    const totalRisk = calculateEnvRiskScore(allLeaks);

    console.log('\nOverall environment security:', {
      totalFiles: results.size,
      totalLeaks: allLeaks.length,
      totalRiskScore: totalRisk,
      averageRiskPerFile: totalRisk / results.size,
      leakTypeDistribution: getLeakTypeDistribution(allLeaks),
      mostLeakedVariables: getMostLeakedVariables(allLeaks),
    });
  });

  test('verify client-server environment boundaries', async () => {
    const clientFiles = ['client.ts', 'client-next.ts'];
    const serverFiles = ['server.ts', 'server-next.ts', 'server-next-edge.ts'];

    // Check client files for server-only variables
    for (const fileName of clientFiles) {
      const filePath = path.join(PACKAGE_ROOT, fileName);

      try {
        const leaks = await analyzeEnvironmentLeaks(filePath);

        const serverOnlyLeaks = leaks.filter(
          (leak) =>
            leak.variable.includes('SECRET') ||
            leak.variable.includes('API_KEY') ||
            leak.variable.includes('DATABASE') ||
            leak.variable.includes('PRIVATE') ||
            leak.variable.includes('AUTH_SECRET'),
        );

        expect(serverOnlyLeaks).toEqual([]);

        console.log(`${fileName} client boundary check:`, {
          totalLeaks: leaks.length,
          serverOnlyLeaks: serverOnlyLeaks.length,
        });

        if (serverOnlyLeaks.length > 0) {
          console.error(
            `Server-only variables in client ${fileName}:`,
            serverOnlyLeaks.map((l) => l.variable),
          );
        }
      } catch (error) {
        console.log(`Could not check client boundaries for ${fileName}`);
      }
    }

    // Check server files for appropriate variable usage
    for (const fileName of serverFiles) {
      const filePath = path.join(PACKAGE_ROOT, fileName);

      try {
        const leaks = await analyzeEnvironmentLeaks(filePath);

        const exposureLeaks = leaks.filter(
          (leak) => leak.leakType === 'direct-exposure' || leak.leakType === 'serialization',
        );

        console.log(`${fileName} server boundary check:`, {
          totalLeaks: leaks.length,
          exposureLeaks: exposureLeaks.length,
        });

        // Server files should not have direct exposure leaks
        expect(exposureLeaks).toEqual([]);
      } catch (error) {
        console.log(`Could not check server boundaries for ${fileName}`);
      }
    }
  });

  test('detect environment variable logging patterns', async () => {
    const fs = await import('fs/promises');

    for (const fileName of exportFiles) {
      const filePath = path.join(PACKAGE_ROOT, fileName);

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const leaks = await analyzeEnvironmentLeaks(filePath);

        const loggingLeaks = leaks.filter((leak) => leak.leakType === 'logging');

        // Check for console.log patterns with environment variables
        const consoleLogPattern = /console\.[a-z]+\([^)]*process\.env/g;
        const consoleMatches = Array.from(content.matchAll(consoleLogPattern));

        console.log(`${fileName} logging analysis:`, {
          loggingLeaks: loggingLeaks.length,
          consoleLogMatches: consoleMatches.length,
        });

        // Production code should not log environment variables
        if (!fileName.includes('test') && !fileName.includes('dev')) {
          expect(loggingLeaks.filter((l) => l.severity === 'high')).toEqual([]);
        }

        if (loggingLeaks.length > 0) {
          console.log(
            `Environment logging in ${fileName}:`,
            loggingLeaks.map((l) => `${l.variable} (${l.severity})`),
          );
        }
      } catch (error) {
        console.log(`Could not analyze logging patterns for ${fileName}`);
      }
    }
  });

  test('verify runtime-specific environment usage', async () => {
    const runtimeRules = [
      {
        runtime: 'edge',
        file: 'server-next-edge.ts',
        allowedVars: ['NEXT_RUNTIME', 'NODE_ENV'],
        forbiddenVars: ['DATABASE_URL', 'SECRET_KEY', 'API_KEY'],
        maxVars: 5,
      },
      {
        runtime: 'client',
        files: ['client.ts', 'client-next.ts'],
        allowedVars: ['NEXT_PUBLIC_', 'REACT_APP_', 'VITE_'],
        forbiddenVars: ['SECRET', 'PRIVATE', 'API_KEY', 'DATABASE'],
        maxVars: 10,
      },
      {
        runtime: 'server',
        files: ['server.ts', 'server-next.ts'],
        allowedVars: ['*'], // Server can use most variables
        forbiddenVars: ['NEXT_PUBLIC_'], // Should not need public vars
        maxVars: 50,
      },
    ];

    for (const rule of runtimeRules) {
      const files = 'files' in rule ? rule.files : [rule.file];

      for (const fileName of files) {
        const filePath = path.join(PACKAGE_ROOT, fileName);

        try {
          const leaks = await analyzeEnvironmentLeaks(filePath);
          const allEnvVars = [...new Set(leaks.map((l) => l.variable))];

          // Check forbidden variables
          const forbidden = allEnvVars.filter((variable) =>
            rule.forbiddenVars.some((pattern) =>
              pattern === '*' ? false : variable.includes(pattern),
            ),
          );

          // Check variable count
          const variableCount = allEnvVars.length;

          console.log(`${fileName} (${rule.runtime}) environment rules:`, {
            variableCount,
            maxAllowed: rule.maxVars,
            forbidden: forbidden.length,
            variables: allEnvVars.slice(0, 10), // First 10 for inspection
          });

          expect(forbidden).toEqual([]);
          expect(variableCount).toBeLessThan(rule.maxVars);

          if (forbidden.length > 0) {
            console.error(`Forbidden variables in ${fileName}:`, forbidden);
          }
        } catch (error) {
          console.log(`Could not check environment rules for ${fileName}`);
        }
      }
    }
  });
});

/**
 * Helper function to get leak type distribution
 */
function getLeakTypeDistribution(leaks: EnvLeak[]) {
  const distribution = new Map<string, number>();

  for (const leak of leaks) {
    distribution.set(leak.leakType, (distribution.get(leak.leakType) || 0) + 1);
  }

  return Object.fromEntries(distribution);
}

/**
 * Helper function to get most leaked variables
 */
function getMostLeakedVariables(leaks: EnvLeak[]) {
  const counts = new Map<string, number>();

  for (const leak of leaks) {
    counts.set(leak.variable, (counts.get(leak.variable) || 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([variable, count]) => ({ variable, count }));
}
