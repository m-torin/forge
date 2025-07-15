// Type definitions for ESLint rule
type RuleContext = any;
type RuleFixer = any;
type RuleFix = any;
type RuleModule = any;

// ESTree types
interface Node {
  type: string;
  [key: string]: any;
}

interface Identifier extends Node {
  type: 'Identifier';
  name: string;
}

/**
 * Custom ESLint rule to prevent use of variables with leading underscore
 * when they are actually used.
 *
 * This rule enforces the convention that underscore prefix should only be used
 * for intentionally unused variables/parameters. It works by analyzing the scope
 * and checking if underscore-prefixed variables have any references.
 */

// Prisma special fields that are allowed to have underscores
const PRISMA_FIELDS = new Set(['_count', '_sum', '_avg', '_min', '_max']);

// Type definitions for ESLint scope analysis
interface Variable {
  name: string;
  identifiers: Identifier[];
  references: Reference[];
}

interface Reference {
  identifier: Identifier;
  isRead(): boolean;
  isWrite(): boolean;
  init: boolean;
}

interface Scope {
  variables: Variable[];
  childScopes: Scope[];
}

/**
 * Collects all scopes in the program using a non-recursive approach
 */
function collectAllScopes(globalScope: Scope): Scope[] {
  const scopes: Scope[] = [globalScope];
  const stack = [...globalScope.childScopes];

  while (stack.length > 0) {
    const scope = stack.pop()!;
    scopes.push(scope);
    stack.push(...scope.childScopes);
  }

  return scopes;
}

/**
 * Checks if a variable reference represents actual usage
 */
function isVariableUsed(variable: Variable): boolean {
  return variable.references.some(ref => ref.isRead() || (ref.isWrite() && !ref.init));
}

/**
 * Creates fix operations for all occurrences of the variable
 */
function createFixes(variable: Variable, identifier: Identifier, fixer: RuleFixer): RuleFix[] {
  const newName = variable.name.slice(1);
  const fixes: RuleFix[] = [fixer.replaceText(identifier, newName)];

  // Fix all other references
  for (const reference of variable.references) {
    if (reference.identifier !== identifier) {
      fixes.push(fixer.replaceText(reference.identifier, newName));
    }
  }

  return fixes;
}

const noUsedUnderscoreVars: RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow use of variables with leading underscore when they are actually used',
    },
    fixable: 'code',
    schema: [],
    messages: {
      noUsedUnderscore: 'Variable "{{name}}" is used and should not have a leading underscore.',
    },
  },

  create(context: RuleContext) {
    // Use optional chaining for better compatibility
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      'Program:exit'(node: Node) {
        const globalScope = sourceCode.getScope(node) as Scope;
        const allScopes = collectAllScopes(globalScope);

        for (const scope of allScopes) {
          for (const variable of scope.variables) {
            // Skip non-underscore variables
            if (!variable.name.startsWith('_')) {
              continue;
            }

            // Skip Prisma special fields
            if (PRISMA_FIELDS.has(variable.name)) {
              continue;
            }

            // Check if variable is actually used
            if (isVariableUsed(variable)) {
              // Report error for each identifier
              for (const identifier of variable.identifiers) {
                context.report({
                  node: identifier,
                  messageId: 'noUsedUnderscore',
                  data: { name: variable.name },
                  fix: (fixer: RuleFixer) => createFixes(variable, identifier, fixer),
                });
              }
            }
          }
        }
      },
    };
  },
};

export default noUsedUnderscoreVars;
