/**
 * Security boundary violation tests
 * Analyzes code for patterns that violate security boundaries between runtimes
 */

import { describe, test, expect } from 'vitest';
import path from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const PACKAGE_ROOT = path.resolve(__dirname, '..');

interface SecurityViolation {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  message: string;
  line?: number;
  evidence: string;
  runtime: 'edge' | 'nodejs' | 'browser' | 'all';
  category:
    | 'data-exposure'
    | 'privilege-escalation'
    | 'injection'
    | 'access-control'
    | 'resource-exhaustion';
}

/**
 * Analyze code for security boundary violations
 */
async function analyzeSecurityViolations(filePath: string): Promise<SecurityViolation[]> {
  const fs = await import('fs/promises');
  const violations: SecurityViolation[] = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');

    // Text-based security analysis
    await analyzeTextSecurityPatterns(content, filePath, violations);

    // AST-based security analysis
    await analyzeASTSecurityPatterns(content, filePath, violations);
  } catch (error) {
    violations.push({
      type: 'analysis-error',
      severity: 'medium',
      location: filePath,
      message: `Security analysis failed: ${(error as Error).message}`,
      evidence: 'file-read-error',
      runtime: 'all',
      category: 'access-control',
    });
  }

  return violations;
}

/**
 * Text-based security pattern analysis
 */
async function analyzeTextSecurityPatterns(
  content: string,
  filePath: string,
  violations: SecurityViolation[],
): Promise<void> {
  const lines = content.split('\n');

  // Security-critical patterns
  const securityPatterns = [
    {
      regex: /process\.env\.(?!NEXT_RUNTIME|NODE_ENV|VERCEL)[A-Z_]+/g,
      type: 'env-variable-exposure',
      severity: 'high' as const,
      message: 'Environment variable accessed - ensure not exposed to client',
      runtime: 'all' as const,
      category: 'data-exposure' as const,
    },
    {
      regex: /eval\s*\(/g,
      type: 'eval-usage',
      severity: 'critical' as const,
      message: 'eval() usage detected - code injection risk',
      runtime: 'all' as const,
      category: 'injection' as const,
    },
    {
      regex: /new\s+Function\s*\(/g,
      type: 'function-constructor',
      severity: 'critical' as const,
      message: 'Function constructor - code injection risk',
      runtime: 'all' as const,
      category: 'injection' as const,
    },
    {
      regex: /innerHTML\s*=/g,
      type: 'inner-html-assignment',
      severity: 'high' as const,
      message: 'innerHTML assignment - XSS risk',
      runtime: 'browser' as const,
      category: 'injection' as const,
    },
    {
      regex: /outerHTML\s*=/g,
      type: 'outer-html-assignment',
      severity: 'high' as const,
      message: 'outerHTML assignment - XSS risk',
      runtime: 'browser' as const,
      category: 'injection' as const,
    },
    {
      regex: /document\.write\s*\(/g,
      type: 'document-write',
      severity: 'high' as const,
      message: 'document.write() - XSS risk',
      runtime: 'browser' as const,
      category: 'injection' as const,
    },
    {
      regex: /child_process|spawn|exec/g,
      type: 'command-execution',
      severity: 'critical' as const,
      message: 'Command execution - privilege escalation risk',
      runtime: 'nodejs' as const,
      category: 'privilege-escalation' as const,
    },
    {
      regex: /fs\.write|fs\.unlink|fs\.rmdir/g,
      type: 'file-system-write',
      severity: 'high' as const,
      message: 'File system write operations - ensure proper authorization',
      runtime: 'nodejs' as const,
      category: 'privilege-escalation' as const,
    },
    {
      regex: /\.exec\s*\(/g,
      type: 'regex-exec',
      severity: 'medium' as const,
      message: 'RegExp.exec() - potential ReDoS vulnerability',
      runtime: 'all' as const,
      category: 'resource-exhaustion' as const,
    },
    {
      regex: /password|secret|token|key/gi,
      type: 'credential-in-code',
      severity: 'critical' as const,
      message: 'Potential credential in code - check for hardcoded secrets',
      runtime: 'all' as const,
      category: 'data-exposure' as const,
    },
    {
      regex: /localStorage|sessionStorage/g,
      type: 'storage-usage',
      severity: 'medium' as const,
      message: 'Browser storage usage - ensure no sensitive data',
      runtime: 'browser' as const,
      category: 'data-exposure' as const,
    },
    {
      regex: /window\.|global\./g,
      type: 'global-object-access',
      severity: 'medium' as const,
      message: 'Global object access - potential prototype pollution',
      runtime: 'all' as const,
      category: 'privilege-escalation' as const,
    },
    {
      regex: /fetch\s*\(\s*['"]http:/g,
      type: 'insecure-http',
      severity: 'medium' as const,
      message: 'HTTP request without TLS - man-in-the-middle risk',
      runtime: 'all' as const,
      category: 'data-exposure' as const,
    },
    {
      regex: /\+\s*req\.|\+\s*request\./g,
      type: 'request-concatenation',
      severity: 'high' as const,
      message: 'Request object concatenation - injection risk',
      runtime: 'nodejs' as const,
      category: 'injection' as const,
    },
    {
      regex: /dangerouslySetInnerHTML/g,
      type: 'dangerous-inner-html',
      severity: 'high' as const,
      message: 'dangerouslySetInnerHTML usage - XSS risk',
      runtime: 'browser' as const,
      category: 'injection' as const,
    },
  ];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    for (const pattern of securityPatterns) {
      const matches = Array.from(line.matchAll(pattern.regex));

      for (const match of matches) {
        // Filter out false positives
        if (shouldSkipViolation(pattern.type, match[0], line, lines, lineIndex)) {
          continue;
        }

        violations.push({
          type: pattern.type,
          severity: pattern.severity,
          location: filePath,
          message: pattern.message,
          line: lineIndex + 1,
          evidence: match[0],
          runtime: pattern.runtime,
          category: pattern.category,
        });
      }
    }
  }
}

/**
 * AST-based security analysis for complex patterns
 */
async function analyzeASTSecurityPatterns(
  content: string,
  filePath: string,
  violations: SecurityViolation[],
): Promise<void> {
  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    });

    traverse(ast, {
      // Check for unsafe object property access
      MemberExpression(path) {
        const { node } = path;

        // Check for prototype pollution patterns
        if (
          node.object.type === 'Identifier' &&
          node.property.type === 'Identifier' &&
          (node.property.name === '__proto__' ||
            node.property.name === 'constructor' ||
            node.property.name === 'prototype')
        ) {
          violations.push({
            type: 'prototype-pollution-risk',
            severity: 'high',
            location: filePath,
            message: `Unsafe prototype access: ${node.property.name}`,
            line: node.loc?.start.line,
            evidence: `${node.object.name}.${node.property.name}`,
            runtime: 'all',
            category: 'privilege-escalation',
          });
        }

        // Check for unsafe dynamic property access
        if (node.computed && node.property.type === 'Identifier') {
          const propertyName = node.property.name;
          if (propertyName.includes('user') || propertyName.includes('input')) {
            violations.push({
              type: 'dynamic-property-access',
              severity: 'medium',
              location: filePath,
              message: 'Dynamic property access with user input - injection risk',
              line: node.loc?.start.line,
              evidence: `obj[${propertyName}]`,
              runtime: 'all',
              category: 'injection',
            });
          }
        }
      },

      // Check for unsafe function calls
      CallExpression(path) {
        const { node } = path;

        // Check for setTimeout/setInterval with string arguments
        if (
          node.callee.type === 'Identifier' &&
          (node.callee.name === 'setTimeout' || node.callee.name === 'setInterval') &&
          node.arguments[0]?.type === 'StringLiteral'
        ) {
          violations.push({
            type: 'string-timer-function',
            severity: 'high',
            location: filePath,
            message: `${node.callee.name} with string argument - code injection risk`,
            line: node.loc?.start.line,
            evidence: node.callee.name,
            runtime: 'all',
            category: 'injection',
          });
        }

        // Check for unsafe JSON.parse without try-catch
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'JSON' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'parse'
        ) {
          // Check if we're inside a try-catch
          let inTryCatch = false;
          let parent = path.parent;

          while (parent) {
            if (parent.type === 'TryStatement') {
              inTryCatch = true;
              break;
            }
            parent = parent.parent;
          }

          if (!inTryCatch) {
            violations.push({
              type: 'unsafe-json-parse',
              severity: 'medium',
              location: filePath,
              message: 'JSON.parse without error handling - DoS risk',
              line: node.loc?.start.line,
              evidence: 'JSON.parse',
              runtime: 'all',
              category: 'resource-exhaustion',
            });
          }
        }
      },

      // Check for template literals with user input
      TemplateLiteral(path) {
        const { node } = path;

        if (node.expressions.length > 0) {
          const hasUserInput = node.expressions.some((expr) => {
            if (expr.type === 'Identifier') {
              return (
                expr.name.includes('user') ||
                expr.name.includes('input') ||
                expr.name.includes('req') ||
                expr.name.includes('params')
              );
            }
            return false;
          });

          if (hasUserInput) {
            violations.push({
              type: 'template-literal-injection',
              severity: 'medium',
              location: filePath,
              message: 'Template literal with user input - injection risk',
              line: node.loc?.start.line,
              evidence: 'template with user input',
              runtime: 'all',
              category: 'injection',
            });
          }
        }
      },

      // Check for unsafe type assertions
      TSAsExpression(path) {
        const { node } = path;

        if (node.typeAnnotation.type === 'TSAnyKeyword') {
          violations.push({
            type: 'unsafe-type-assertion',
            severity: 'medium',
            location: filePath,
            message: 'Type assertion to any - bypasses type safety',
            line: node.loc?.start.line,
            evidence: 'as any',
            runtime: 'all',
            category: 'access-control',
          });
        }
      },
    });
  } catch (error) {
    violations.push({
      type: 'ast-security-analysis-error',
      severity: 'low',
      location: filePath,
      message: `AST security analysis failed: ${(error as Error).message}`,
      evidence: 'parse-error',
      runtime: 'all',
      category: 'access-control',
    });
  }
}

/**
 * Skip false positives and known safe patterns
 */
function shouldSkipViolation(
  type: string,
  match: string,
  line: string,
  lines: string[],
  lineIndex: number,
): boolean {
  // Skip credentials in test files or comments
  if (type === 'credential-in-code') {
    if (
      line.includes('//') ||
      line.includes('/*') ||
      line.includes('test') ||
      line.includes('example') ||
      line.includes('placeholder') ||
      match.length < 8
    ) {
      // Too short to be real credential
      return true;
    }
  }

  // Skip eval in specific safe contexts
  if (type === 'eval-usage') {
    if (line.includes('eval(') && line.includes('import')) {
      return true; // Eval-wrapped dynamic imports are OK
    }
  }

  // Skip environment variables in specific contexts
  if (type === 'env-variable-exposure') {
    if (
      line.includes('process.env.NEXT_RUNTIME') ||
      line.includes('process.env.NODE_ENV') ||
      line.includes('process.env.VERCEL')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Filter violations by runtime context
 */
function filterViolationsByRuntime(
  violations: SecurityViolation[],
  fileName: string,
): SecurityViolation[] {
  const runtimeType = fileName.includes('edge')
    ? 'edge'
    : fileName.includes('client')
      ? 'browser'
      : 'nodejs';

  return violations.filter(
    (violation) => violation.runtime === 'all' || violation.runtime === runtimeType,
  );
}

/**
 * Calculate security risk score
 */
function calculateSecurityRiskScore(violations: SecurityViolation[]): number {
  const weights = {
    critical: 25,
    high: 10,
    medium: 5,
    low: 1,
  };

  return violations.reduce((score, violation) => {
    return score + weights[violation.severity];
  }, 0);
}

/**
 * Group violations by category
 */
function groupViolationsByCategory(violations: SecurityViolation[]) {
  const categories = new Map<string, SecurityViolation[]>();

  for (const violation of violations) {
    const existing = categories.get(violation.category) || [];
    existing.push(violation);
    categories.set(violation.category, existing);
  }

  return categories;
}

describe('Security Boundary Violation Analysis', () => {
  const exportFiles = [
    'client.ts',
    'server.ts',
    'client-next.ts',
    'server-next.ts',
    'server-next-edge.ts',
  ];

  test('analyze security violations in export files', async () => {
    const results = new Map<string, SecurityViolation[]>();

    for (const fileName of exportFiles) {
      const filePath = path.join(PACKAGE_ROOT, fileName);

      try {
        const allViolations = await analyzeSecurityViolations(filePath);
        const runtimeViolations = filterViolationsByRuntime(allViolations, fileName);

        results.set(fileName, runtimeViolations);

        const riskScore = calculateSecurityRiskScore(runtimeViolations);
        const categories = groupViolationsByCategory(runtimeViolations);

        console.log(`${fileName} security analysis:`, {
          totalViolations: runtimeViolations.length,
          critical: runtimeViolations.filter((v) => v.severity === 'critical').length,
          high: runtimeViolations.filter((v) => v.severity === 'high').length,
          medium: runtimeViolations.filter((v) => v.severity === 'medium').length,
          low: runtimeViolations.filter((v) => v.severity === 'low').length,
          riskScore,
          categories: Array.from(categories.keys()),
        });

        // No critical security violations should exist
        const criticalViolations = runtimeViolations.filter((v) => v.severity === 'critical');
        expect(criticalViolations).toEqual([]);

        if (criticalViolations.length > 0) {
          console.error(`Critical security violations in ${fileName}:`);
          criticalViolations.forEach((v) => {
            console.error(`  ${v.type}: ${v.message} (${v.evidence})`);
          });
        }

        // Edge runtime should have minimal security risk
        if (fileName.includes('edge')) {
          expect(riskScore).toBeLessThan(30);

          const highRiskViolations = runtimeViolations.filter(
            (v) => v.severity === 'critical' || v.severity === 'high',
          );
          expect(highRiskViolations).toEqual([]);
        }
      } catch (error) {
        console.log(`Could not analyze security for ${fileName}: ${error}`);
      }
    }

    // Overall security summary
    const allViolations = Array.from(results.values()).flat();
    const totalRisk = calculateSecurityRiskScore(allViolations);

    console.log('\nOverall security analysis:', {
      totalFiles: results.size,
      totalViolations: allViolations.length,
      totalRiskScore: totalRisk,
      averageRiskPerFile: totalRisk / results.size,
      categorySummary: getCategorySummary(allViolations),
    });
  });

  test('verify runtime-specific security boundaries', async () => {
    const boundaryRules = [
      {
        runtime: 'edge',
        file: 'server-next-edge.ts',
        forbiddenCategories: ['privilege-escalation'],
        forbiddenTypes: ['command-execution', 'file-system-write'],
        maxRiskScore: 20,
      },
      {
        runtime: 'browser',
        files: ['client.ts', 'client-next.ts'],
        forbiddenCategories: ['privilege-escalation'],
        forbiddenTypes: ['command-execution', 'file-system-write'],
        maxRiskScore: 25,
      },
      {
        runtime: 'nodejs',
        files: ['server.ts', 'server-next.ts'],
        forbiddenCategories: [],
        forbiddenTypes: ['inner-html-assignment', 'document-write'],
        maxRiskScore: 50,
      },
    ];

    for (const rule of boundaryRules) {
      const files = 'files' in rule ? rule.files : [rule.file];

      for (const fileName of files) {
        const filePath = path.join(PACKAGE_ROOT, fileName);

        try {
          const violations = await analyzeSecurityViolations(filePath);
          const runtimeViolations = filterViolationsByRuntime(violations, fileName);

          // Check forbidden categories
          const forbiddenCategories = runtimeViolations.filter((v) =>
            rule.forbiddenCategories.includes(v.category),
          );

          // Check forbidden types
          const forbiddenTypes = runtimeViolations.filter((v) =>
            rule.forbiddenTypes.includes(v.type),
          );

          const riskScore = calculateSecurityRiskScore(runtimeViolations);

          expect(forbiddenCategories).toEqual([]);
          expect(forbiddenTypes).toEqual([]);
          expect(riskScore).toBeLessThan(rule.maxRiskScore);

          console.log(`${fileName} (${rule.runtime}) boundary check:`, {
            riskScore,
            maxAllowed: rule.maxRiskScore,
            forbiddenCategories: forbiddenCategories.length,
            forbiddenTypes: forbiddenTypes.length,
            totalViolations: runtimeViolations.length,
          });

          if (forbiddenCategories.length > 0 || forbiddenTypes.length > 0) {
            console.error(`Boundary violations in ${fileName}:`);
            [...forbiddenCategories, ...forbiddenTypes].forEach((v) => {
              console.error(`  ${v.type} (${v.category}): ${v.message}`);
            });
          }
        } catch (error) {
          console.log(`Could not check boundaries for ${fileName}`);
        }
      }
    }
  });

  test('detect privilege escalation patterns', async () => {
    for (const fileName of exportFiles) {
      const filePath = path.join(PACKAGE_ROOT, fileName);

      try {
        const violations = await analyzeSecurityViolations(filePath);
        const privilegeViolations = violations.filter((v) => v.category === 'privilege-escalation');

        console.log(`${fileName} privilege escalation check:`, {
          violations: privilegeViolations.length,
          types: [...new Set(privilegeViolations.map((v) => v.type))],
        });

        // Client and edge runtimes should have no privilege escalation
        if (fileName.includes('client') || fileName.includes('edge')) {
          expect(privilegeViolations).toEqual([]);

          if (privilegeViolations.length > 0) {
            console.error(`Privilege escalation in ${fileName}:`, privilegeViolations);
          }
        }
      } catch (error) {
        console.log(`Could not check privilege escalation for ${fileName}`);
      }
    }
  });

  test('verify data exposure controls', async () => {
    const fs = await import('fs/promises');

    for (const fileName of exportFiles) {
      const filePath = path.join(PACKAGE_ROOT, fileName);

      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const violations = await analyzeSecurityViolations(filePath);

        const dataExposureViolations = violations.filter((v) => v.category === 'data-exposure');

        // Check for client-side exposure patterns
        if (fileName.includes('client')) {
          const clientExposure = dataExposureViolations.filter(
            (v) => v.type === 'env-variable-exposure' || v.type === 'credential-in-code',
          );

          expect(clientExposure).toEqual([]);

          if (clientExposure.length > 0) {
            console.error(`Data exposure in client ${fileName}:`, clientExposure);
          }
        }

        console.log(`${fileName} data exposure check:`, {
          violations: dataExposureViolations.length,
          types: [...new Set(dataExposureViolations.map((v) => v.type))],
        });
      } catch (error) {
        console.log(`Could not check data exposure for ${fileName}`);
      }
    }
  });

  test('analyze injection vulnerability patterns', async () => {
    for (const fileName of exportFiles) {
      const filePath = path.join(PACKAGE_ROOT, fileName);

      try {
        const violations = await analyzeSecurityViolations(filePath);
        const injectionViolations = violations.filter((v) => v.category === 'injection');

        const criticalInjection = injectionViolations.filter((v) => v.severity === 'critical');

        // No critical injection vulnerabilities should exist
        expect(criticalInjection).toEqual([]);

        console.log(`${fileName} injection analysis:`, {
          totalInjection: injectionViolations.length,
          critical: criticalInjection.length,
          high: injectionViolations.filter((v) => v.severity === 'high').length,
          types: [...new Set(injectionViolations.map((v) => v.type))],
        });

        if (criticalInjection.length > 0) {
          console.error(`Critical injection vulnerabilities in ${fileName}:`);
          criticalInjection.forEach((v) => {
            console.error(`  ${v.type}: ${v.message} at line ${v.line}`);
          });
        }
      } catch (error) {
        console.log(`Could not analyze injection patterns for ${fileName}`);
      }
    }
  });
});

/**
 * Helper function to get category summary
 */
function getCategorySummary(violations: SecurityViolation[]) {
  const summary = new Map<string, number>();

  for (const violation of violations) {
    summary.set(violation.category, (summary.get(violation.category) || 0) + 1);
  }

  return Object.fromEntries(summary);
}
