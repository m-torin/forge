/**
 * Code Analysis Utilities
 * Centralized functions for analyzing code structure and patterns using AST parsing
 * Uses ts-morph and acorn for accurate analysis instead of regex patterns
 * Used across multiple agents to eliminate duplication
 */

import { parse as parseJS } from 'acorn';

/**
 * Extract all import statements from code content using AST parsing
 * Handles TypeScript/JavaScript imports with high accuracy
 * Supports: default, named, namespace, side-effect imports, and CommonJS require
 *
 * @async Function now lazy-loads ts-morph to avoid bundling issues
 */
export async function extractImports(content: string): Promise<string[]> {
  const imports: string[] = [];

  try {
    // Lazy-load ts-morph to avoid bundling @vue/compiler-sfc and template engines
    const { Node, Project } = await import('ts-morph');
    const project = new Project({ useInMemoryFileSystem: true });
    let sourceFile: any;

    // Determine if it's TypeScript or JavaScript by file patterns or syntax
    const isTypeScript =
      /^import\s+type\s+|interface\s+|type\s+\w+\s*=|<.*?>|\bas\s+\w+/m.test(content) ||
      content.includes('import type') ||
      /@types?\//.test(content);

    try {
      sourceFile = project.createSourceFile(isTypeScript ? 'temp.ts' : 'temp.js', content, {
        overwrite: true,
      });

      // Extract ES6/ESM imports
      const importDeclarations = sourceFile.getImportDeclarations();
      for (const importDecl of importDeclarations) {
        const moduleSpecifier = importDecl.getModuleSpecifierValue();
        if (moduleSpecifier && !imports.includes(moduleSpecifier)) {
          imports.push(moduleSpecifier);
        }
      }

      // Extract dynamic imports
      sourceFile.forEachDescendant((node: any) => {
        if (Node.isCallExpression(node)) {
          const expression = node.getExpression();
          if (Node.isIdentifier(expression) && expression.getText() === 'import') {
            const args = node.getArguments();
            if (args.length > 0 && Node.isStringLiteral(args[0])) {
              const moduleSpecifier = args[0].getLiteralValue();
              if (moduleSpecifier && !imports.includes(moduleSpecifier)) {
                imports.push(moduleSpecifier);
              }
            }
          }
        }
      });
    } catch (tsMorphError) {
      // Fallback to basic JavaScript parsing with acorn for invalid TypeScript
      try {
        const ast = parseJS(content, {
          ecmaVersion: 2022,
          sourceType: 'module',
          locations: false,
        });

        extractImportsFromAST(ast, imports);
      } catch (acornError) {
        // Final fallback to improved regex (safer than original)
        return extractImportsRegexFallback(content);
      }
    }

    // Extract CommonJS require statements using AST traversal (only if sourceFile was created successfully)
    if (sourceFile) {
      sourceFile.forEachDescendant((node: any) => {
        if (Node.isCallExpression(node)) {
          const expression = node.getExpression();
          if (Node.isIdentifier(expression) && expression.getText() === 'require') {
            const args = node.getArguments();
            if (args.length > 0 && Node.isStringLiteral(args[0])) {
              const moduleSpecifier = args[0].getLiteralValue();
              if (moduleSpecifier && !imports.includes(moduleSpecifier)) {
                imports.push(moduleSpecifier);
              }
            }
          }
        }
      });
    }
  } catch (error) {
    // Ultimate fallback to safe regex patterns
    return extractImportsRegexFallback(content);
  }

  return imports;
}

/**
 * Extract imports from Acorn AST (for JavaScript files)
 */
function extractImportsFromAST(ast: any, imports: string[]): void {
  if (!ast || typeof ast !== 'object') return;

  if (ast.type === 'ImportDeclaration' && ast.source?.value) {
    if (!imports.includes(ast.source.value)) {
      imports.push(ast.source.value);
    }
  }

  if (
    ast.type === 'CallExpression' &&
    ast.callee?.name === 'require' &&
    ast.arguments?.[0]?.value
  ) {
    if (!imports.includes(ast.arguments[0].value)) {
      imports.push(ast.arguments[0].value);
    }
  }

  // Recursively traverse AST
  for (const key in ast) {
    if (key !== 'parent' && ast[key] && typeof ast[key] === 'object') {
      if (Array.isArray(ast[key])) {
        for (const item of ast[key]) {
          extractImportsFromAST(item, imports);
        }
      } else {
        extractImportsFromAST(ast[key], imports);
      }
    }
  }
}

/**
 * Fallback regex-based import extraction (improved and safer than original)
 */
function extractImportsRegexFallback(content: string): string[] {
  const imports: string[] = [];

  // Safer patterns with specific matching to prevent ReDoS
  const patterns = [
    // ES6 imports - more specific pattern
    /import\s[\w{},*\s]+\sfrom\s+['"]([^'"]{1,200})['"][\s;]*/g,
    // Simple import statements
    /import\s+['"]([^'"]{1,200})['"][\s;]*/g,
    // CommonJS require - more specific pattern
    /(?:const|let|var)\s[\w{},\s]+=\s*require\s*\(\s*['"]([^'"]{1,200})['"]\s*\)/g,
    // Dynamic imports
    /import\s*\(\s*['"]([^'"]{1,200})['"]\s*\)/g,
  ];

  for (const pattern of patterns) {
    let match;
    // Reset lastIndex to prevent infinite loops
    pattern.lastIndex = 0;
    let matchCount = 0;

    while ((match = pattern.exec(content)) !== null && matchCount < 1000) {
      const moduleSpecifier = match[1];
      if (moduleSpecifier && !imports.includes(moduleSpecifier)) {
        imports.push(moduleSpecifier);
      }
      matchCount++;
    }
  }

  return imports;
}

/**
 * Extract all export statements from code content using AST parsing
 * Handles TypeScript/JavaScript exports with high accuracy
 * Supports: default, named, re-exports, class/function/interface/type exports
 *
 * @async Function now lazy-loads ts-morph to avoid bundling issues
 */
export async function extractExports(content: string): Promise<string[]> {
  const exports: string[] = [];

  try {
    // Lazy-load ts-morph to avoid bundling @vue/compiler-sfc and template engines
    const { Node, Project } = await import('ts-morph');
    const project = new Project({ useInMemoryFileSystem: true });
    let sourceFile: any;

    // Determine if it's TypeScript or JavaScript
    const isTypeScript =
      /^export\s+(?:interface|type)\s+|^export\s+type\s+|<.*?>/.test(content) ||
      content.includes('export type') ||
      content.includes('export interface');

    try {
      sourceFile = project.createSourceFile(isTypeScript ? 'temp.ts' : 'temp.js', content, {
        overwrite: true,
      });

      // Extract all export declarations
      const exportDeclarations = sourceFile.getExportDeclarations();
      for (const exportDecl of exportDeclarations) {
        const namedExports = exportDecl.getNamedExports();
        for (const namedExport of namedExports) {
          const name = namedExport.getName();
          if (name && !exports.includes(name)) {
            exports.push(name);
          }
        }
      }

      // Extract export assignments (export = ...)
      const exportAssignments = sourceFile.getExportAssignments();
      for (const exportAssign of exportAssignments) {
        // For export = expressions, use a generic name
        const exportName = 'default';
        if (!exports.includes(exportName)) {
          exports.push(exportName);
        }
      }

      // Extract exported functions, classes, interfaces, types, variables
      sourceFile.forEachDescendant((node: any) => {
        let isExported = false;
        let exportName: string | undefined;

        if (Node.isFunctionDeclaration(node)) {
          isExported = node.isExported();
          exportName = node.getName();
        } else if (Node.isClassDeclaration(node)) {
          isExported = node.isExported();
          exportName = node.getName();
        } else if (Node.isInterfaceDeclaration(node)) {
          isExported = node.isExported();
          exportName = node.getName();
        } else if (Node.isTypeAliasDeclaration(node)) {
          isExported = node.isExported();
          exportName = node.getName();
        } else if (Node.isEnumDeclaration(node)) {
          isExported = node.isExported();
          exportName = node.getName();
        } else if (Node.isVariableStatement(node)) {
          isExported = node.isExported();
          if (isExported) {
            // Handle variable declarations like export const/let/var
            const declarations = node.getDeclarationList().getDeclarations();
            for (const decl of declarations) {
              const name = decl.getName();
              if (name && !exports.includes(name)) {
                exports.push(name);
              }
            }
          }
        }

        if (isExported && exportName && !exports.includes(exportName)) {
          exports.push(exportName);
        }
      });

      // Handle export default
      const exportedSymbols = sourceFile.getExportedDeclarations();
      if (exportedSymbols.has('default')) {
        if (!exports.includes('default')) {
          exports.push('default');
        }
      }
    } catch (tsMorphError) {
      // Fallback to JavaScript parsing with acorn
      try {
        const ast = parseJS(content, {
          ecmaVersion: 2022,
          sourceType: 'module',
          locations: false,
        });

        extractExportsFromAST(ast, exports);
      } catch (acornError) {
        // Final fallback to improved regex
        return extractExportsRegexFallback(content);
      }
    }
  } catch (error) {
    // Ultimate fallback to safe regex patterns
    return extractExportsRegexFallback(content);
  }

  return exports;
}

/**
 * Extract exports from Acorn AST (for JavaScript files)
 */
function extractExportsFromAST(ast: any, exports: string[]): void {
  if (!ast || typeof ast !== 'object') return;

  // Handle different export types
  if (ast.type === 'ExportNamedDeclaration') {
    if (ast.declaration) {
      // export const/let/var/function/class
      if (ast.declaration.declarations) {
        for (const decl of ast.declaration.declarations) {
          if (decl.id?.name && !exports.includes(decl.id.name)) {
            exports.push(decl.id.name);
          }
        }
      } else if (ast.declaration.id?.name) {
        if (!exports.includes(ast.declaration.id.name)) {
          exports.push(ast.declaration.id.name);
        }
      }
    }

    // export { name1, name2 }
    if (ast.specifiers) {
      for (const spec of ast.specifiers) {
        if (spec.exported?.name && !exports.includes(spec.exported.name)) {
          exports.push(spec.exported.name);
        }
      }
    }
  }

  if (ast.type === 'ExportDefaultDeclaration') {
    if (!exports.includes('default')) {
      exports.push('default');
    }
  }

  if (ast.type === 'ExportAllDeclaration' && ast.exported?.name) {
    if (!exports.includes(ast.exported.name)) {
      exports.push(ast.exported.name);
    }
  }

  // Recursively traverse AST
  for (const key in ast) {
    if (key !== 'parent' && ast[key] && typeof ast[key] === 'object') {
      if (Array.isArray(ast[key])) {
        for (const item of ast[key]) {
          extractExportsFromAST(item, exports);
        }
      } else {
        extractExportsFromAST(ast[key], exports);
      }
    }
  }
}

/**
 * Fallback regex-based export extraction (improved and safer than original)
 */
function extractExportsRegexFallback(content: string): string[] {
  const exports: string[] = [];

  // Safer export patterns with length limits
  const patterns = [
    // Named exports: export const/let/var/function/class name
    /^export\s+(?:const|let|var|function|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]{0,100})/gm,
    // TypeScript exports: interface, type, enum
    /^export\s+(?:interface|type|enum)\s+([a-zA-Z_$][a-zA-Z0-9_$]{0,100})/gm,
    // Export lists: export { name1, name2 }
    /export\s*\{([^}]+)\}/g, // Fixed ReDoS - removed problematic quantifiers
  ];

  for (const pattern of patterns) {
    let match;
    pattern.lastIndex = 0;
    let matchCount = 0;

    while ((match = pattern.exec(content)) !== null && matchCount < 1000) {
      if (pattern.source.includes('{')) {
        // Handle export { name1, name2 } pattern
        const names = match[1].split(',').map(s =>
          s
            .trim()
            .split(/\s+as\s+/)[0]
            .trim(),
        );
        for (const name of names) {
          if (name && /^[a-z_$][a-z0-9_$]*$/i.test(name) && !exports.includes(name)) {
            exports.push(name);
          }
        }
      } else {
        const exportName = match[1];
        if (exportName && !exports.includes(exportName)) {
          exports.push(exportName);
        }
      }
      matchCount++;
    }
  }

  // Check for default export
  if (/export\s+default\b/.test(content) && !exports.includes('default')) {
    exports.push('default');
  }

  return exports;
}

/**
 * Calculate cyclomatic complexity of code using AST analysis
 * Counts decision points in the code structure accurately
 *
 * @async Function now lazy-loads ts-morph to avoid bundling issues
 */
export async function calculateComplexity(content: string): Promise<number> {
  let complexity = 1; // Base complexity

  try {
    // Lazy-load ts-morph to avoid bundling @vue/compiler-sfc and template engines
    const { Node, Project } = await import('ts-morph');
    const project = new Project({ useInMemoryFileSystem: true });
    let sourceFile: any;

    const isTypeScript = /interface\s+|type\s+\w+\s*=|<.*?>/.test(content);

    try {
      sourceFile = project.createSourceFile(isTypeScript ? 'temp.ts' : 'temp.js', content, {
        overwrite: true,
      });

      // Calculate complexity using AST traversal
      complexity = calculateComplexityFromAST(sourceFile, Node);
    } catch (tsMorphError) {
      // Fallback to JavaScript parsing with acorn
      try {
        const ast = parseJS(content, {
          ecmaVersion: 2022,
          sourceType: 'module',
          locations: false,
        });

        complexity = calculateComplexityFromAcornAST(ast);
      } catch (acornError) {
        // Final fallback to improved regex
        return calculateComplexityRegexFallback(content);
      }
    }
  } catch (error) {
    // Ultimate fallback to regex-based calculation
    return calculateComplexityRegexFallback(content);
  }

  return Math.max(1, complexity); // Ensure minimum complexity of 1
}

/**
 * Calculate complexity from ts-morph AST
 * @param sourceFile - ts-morph SourceFile instance
 * @param Node - ts-morph Node class from dynamic import
 */
function calculateComplexityFromAST(sourceFile: any, Node: any): number {
  let complexity = 1; // Base complexity

  sourceFile.forEachDescendant((node: any) => {
    // Control flow statements that increase complexity
    if (Node.isIfStatement(node)) {
      complexity++; // +1 for if

      // Count else-if chains
      let current = node;
      while (current.getElseStatement() && Node.isIfStatement(current.getElseStatement())) {
        complexity++; // +1 for each else-if
        current = current.getElseStatement() as any;
      }
    } else if (
      Node.isForStatement(node) ||
      Node.isForInStatement(node) ||
      Node.isForOfStatement(node)
    ) {
      complexity++; // +1 for for loops
    } else if (Node.isWhileStatement(node) || Node.isDoStatement(node)) {
      complexity++; // +1 for while/do-while loops
    } else if (Node.isSwitchStatement(node)) {
      // Count case statements
      const caseCount = node.getClauses().filter((clause: any) => Node.isCaseClause(clause)).length;
      complexity += caseCount; // +1 for each case
    } else if (Node.isCatchClause(node)) {
      complexity++; // +1 for catch blocks
    } else if (Node.isConditionalExpression(node)) {
      complexity++; // +1 for ternary operators
    } else if (Node.isBinaryExpression(node)) {
      const operator = node.getOperatorToken().getText();
      if (operator === '&&' || operator === '||') {
        complexity++; // +1 for logical operators
      }
    }
  });

  return complexity;
}

/**
 * Calculate complexity from Acorn AST
 */
function calculateComplexityFromAcornAST(ast: any): number {
  let complexity = 1; // Base complexity

  function traverse(node: any): void {
    if (!node || typeof node !== 'object') return;

    switch (node.type) {
      case 'IfStatement':
        complexity++;
        break;
      case 'ForStatement':
      case 'ForInStatement':
      case 'ForOfStatement':
      case 'WhileStatement':
      case 'DoWhileStatement':
        complexity++;
        break;
      case 'SwitchCase':
        if (node.test) {
          // Not default case
          complexity++;
        }
        break;
      case 'CatchClause':
        complexity++;
        break;
      case 'ConditionalExpression':
        complexity++;
        break;
      case 'LogicalExpression':
        if (node.operator === '&&' || node.operator === '||') {
          complexity++;
        }
        break;
    }

    // Recursively traverse all child nodes
    for (const key in node) {
      if (key !== 'parent' && node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          for (const item of node[key]) {
            traverse(item);
          }
        } else {
          traverse(node[key]);
        }
      }
    }
  }

  traverse(ast);
  return complexity;
}

/**
 * Fallback regex-based complexity calculation (improved and safer)
 */
function calculateComplexityRegexFallback(content: string): number {
  let complexity = 1; // Base complexity

  // Safer patterns with reasonable limits
  const patterns = [
    { pattern: /\bif\s*\(/g, weight: 1 },
    { pattern: /\belse\s+if\s*\(/g, weight: 1 },
    { pattern: /\bfor\s*\(/g, weight: 1 },
    { pattern: /\bwhile\s*\(/g, weight: 1 },
    { pattern: /\bdo\s*\{/g, weight: 1 },
    { pattern: /\bcase\s+[^:]{1,50}:/g, weight: 1 }, // Limit case pattern length
    { pattern: /\bcatch\s*\(/g, weight: 1 },
    { pattern: /\?\s*[^:]{1,100}:/g, weight: 1 }, // Ternary with length limit
    { pattern: /&&(?![&=])/g, weight: 1 }, // Logical AND (not &&=)
    { pattern: /\|\|(?![\|=])/g, weight: 1 }, // Logical OR (not ||=)
  ];

  for (const { pattern, weight } of patterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      // Prevent excessive complexity from malformed code
      const count = Math.min(matches.length, 1000);
      complexity += count * weight;
    }
  }

  return complexity;
}

/**
 * Extract file metadata for analysis
 * Common metadata needed across agents
 */
export interface FileMetadata {
  size: number;
  lines: number;
  imports: string[];
  exports: string[];
  complexity: number;
  hasTests: boolean;
  isComponent: boolean;
  isApiRoute: boolean;
  isMiddleware: boolean;
}

export async function extractFileMetadata(
  filePath: string,
  content: string,
): Promise<FileMetadata> {
  const lines = content.split('\n').length;

  return {
    size: content.length,
    lines,
    imports: await extractImports(content),
    exports: await extractExports(content),
    complexity: await calculateComplexity(content),
    hasTests: /\b(?:test|describe|it|expect)\s*\(/.test(content),
    isComponent:
      /\.(?:tsx|jsx)$/.test(filePath) &&
      /(?:export\s+default|export\s+function|export\s+const)/.test(content),
    isApiRoute: filePath.includes('/api/') || filePath.includes('/pages/api/'),
    isMiddleware:
      filePath.includes('middleware') ||
      /\bexport\s+middleware\b/.test(content) ||
      /\bexport\s+default\s+middleware\b/.test(content),
  };
}
