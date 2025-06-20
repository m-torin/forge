/**
 * Custom ESLint rule to prevent use of variables with leading underscore
 * unless they are unused function parameters.
 *
 * This rule enforces the convention that underscore prefix should only be used
 * for intentionally unused variables/parameters.
 */
const rule = {
  meta: {
    type: 'problem' as const,
    docs: {
      description:
        'Disallow use of variables with leading underscore unless they are unused parameters',
      category: 'Best Practices',
      recommended: false,
    },
    fixable: 'code' as const,
    schema: [],
    messages: {
      noUsedUnderscore: 'Remove leading underscore from used variable "{{name}}".',
    },
  },
  create(context: any) {
    return {
      Identifier(node: any) {
        // Only check variables that start with underscore
        if (!node.name.startsWith('_')) {
          return;
        }

        // Skip property names (handled by no-underscore-dangle if needed)
        if (node.parent?.type === 'MemberExpression' && node.parent.property === node) {
          return;
        }

        // Skip object property names
        if (node.parent?.type === 'Property' && node.parent.key === node) {
          return;
        }

        // Allow unused function parameters (handled by unused-vars rule)
        if (
          node.parent?.type === 'FunctionDeclaration' ||
          node.parent?.type === 'FunctionExpression' ||
          node.parent?.type === 'ArrowFunctionExpression'
        ) {
          // Check if this is a parameter
          const params = node.parent.params;
          if (params.some((param: any) => param.name === node.name)) {
            return; // Allow underscore prefix for function parameters
          }
        }

        // Allow destructuring patterns with underscore prefix
        if (node.parent?.type === 'ObjectPattern' || node.parent?.type === 'ArrayPattern') {
          return;
        }

        // Report the issue
        context.report({
          node,
          messageId: 'noUsedUnderscore',
          data: { name: node.name },
          fix(fixer: any) {
            // Remove the leading underscore
            return fixer.replaceText(node, node.name.slice(1));
          },
        });
      },
    };
  },
};

export default rule;
