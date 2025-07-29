/**
 * ESLint Rules to Enforce DRY Patterns
 *
 * Custom ESLint rules to ensure orchestration tests follow the established
 * DRY patterns and prevent regression to duplicate code patterns.
 */

module.exports = {
  rules: {
    'no-manual-mock-creation': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Disallow manual mock creation in favor of centralized setup',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
          noManualMock:
            'Use centralized mock creation from setup.ts instead of manual mock creation',
          useSetupImport: 'Import createMockWorkflowProvider from "./setup" instead',
        },
      },
      create(context) {
        return {
          VariableDeclarator(node) {
            // Check for manual mock object creation
            if (
              node.id.name?.startsWith('mock') &&
              node.init?.type === 'ObjectExpression' &&
              node.init.properties.some(
                prop =>
                  prop.key?.name === 'execute' &&
                  prop.value?.type === 'CallExpression' &&
                  prop.value.callee?.object?.name === 'vi' &&
                  prop.value.callee?.property?.name === 'fn',
              )
            ) {
              context.report({
                node,
                messageId: 'noManualMock',
                fix(fixer) {
                  return fixer.replaceText(node.init, 'createMockWorkflowProvider()');
                },
              });
            }
          },
        };
      },
    },

    'no-hardcoded-test-data': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Disallow hardcoded test data in favor of generators',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
          noHardcodedData: 'Use test data generators instead of hardcoded test data',
          useGenerators: 'Import generators from "./test-data-generators"',
        },
      },
      create(context) {
        return {
          ObjectExpression(node) {
            // Check for hardcoded workflow objects
            if (
              node.properties.some(
                prop =>
                  prop.key?.name === 'id' &&
                  prop.value?.type === 'Literal' &&
                  prop.value.value?.toString().includes('test-workflow'),
              ) &&
              node.properties.some(
                prop => prop.key?.name === 'name' && prop.value?.type === 'Literal',
              ) &&
              node.properties.some(
                prop => prop.key?.name === 'steps' && prop.value?.type === 'ArrayExpression',
              )
            ) {
              context.report({
                node,
                messageId: 'noHardcodedData',
                fix(fixer) {
                  return fixer.replaceText(node, 'workflowGenerators.simple()');
                },
              });
            }
          },
        };
      },
    },

    'require-centralized-assertions': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Require centralized assertion utilities',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
          useCentralizedAssertions:
            'Use AssertionUtils.assertWorkflow() instead of manual assertions',
          useAssertionUtils: 'Import AssertionUtils from "./test-utils"',
        },
      },
      create(context) {
        return {
          CallExpression(node) {
            // Check for common manual assertion patterns
            if (
              node.callee?.name === 'expect' &&
              node.arguments[0]?.type === 'MemberExpression' &&
              node.arguments[0].property?.name === 'id' &&
              node.parent?.type === 'MemberExpression' &&
              node.parent.property?.name === 'toBeDefined'
            ) {
              // Check if this is part of a workflow assertion pattern
              const sourceCode = context.getSourceCode();
              const text = sourceCode.getText();

              // Look for multiple workflow-related assertions
              if (
                text.includes('expect(result.id).toBeDefined()') &&
                text.includes('expect(result.status).toBeDefined()') &&
                text.includes('expect(result.workflowId)')
              ) {
                context.report({
                  node,
                  messageId: 'useCentralizedAssertions',
                  fix(fixer) {
                    return fixer.replaceText(
                      node.parent.parent,
                      'AssertionUtils.assertWorkflowExecution(result)',
                    );
                  },
                });
              }
            }
          },
        };
      },
    },

    'require-dry-imports': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Require DRY pattern imports in test files',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
          missingDryImports: 'Test files should import DRY utilities',
          addDryImports: 'Add imports for DRY testing patterns',
        },
      },
      create(context) {
        let hasTestFactoryImport = false;
        let hasTestDataImport = false;
        let hasTestUtilsImport = false;
        let hasSetupImport = false;

        return {
          ImportDeclaration(node) {
            if (node.source.value.includes('workflow-test-factory')) {
              hasTestFactoryImport = true;
            }
            if (node.source.value.includes('test-data-generators')) {
              hasTestDataImport = true;
            }
            if (node.source.value.includes('test-utils')) {
              hasTestUtilsImport = true;
            }
            if (node.source.value.includes('setup')) {
              hasSetupImport = true;
            }
          },
          'Program:exit'(node) {
            const filename = context.getFilename();

            // Only check test files
            if (!filename.includes('.test.')) {
              return;
            }

            const sourceCode = context.getSourceCode();
            const text = sourceCode.getText();

            // Check if file uses patterns but doesn't import utilities
            if (
              (text.includes('createWorkflowTestSuite') && !hasTestFactoryImport) ||
              (text.includes('workflowGenerators') && !hasTestDataImport) ||
              (text.includes('AssertionUtils') && !hasTestUtilsImport) ||
              (text.includes('createMockWorkflowProvider') && !hasSetupImport)
            ) {
              context.report({
                node,
                messageId: 'missingDryImports',
                fix(fixer) {
                  const imports = [];

                  if (text.includes('createWorkflowTestSuite') && !hasTestFactoryImport) {
                    imports.push(
                      "import { createWorkflowTestSuite } from './workflow-test-factory';",
                    );
                  }

                  if (text.includes('workflowGenerators') && !hasTestDataImport) {
                    imports.push("import { workflowGenerators } from './test-data-generators';");
                  }

                  if (text.includes('AssertionUtils') && !hasTestUtilsImport) {
                    imports.push("import { AssertionUtils } from './test-utils';");
                  }

                  if (text.includes('createMockWorkflowProvider') && !hasSetupImport) {
                    imports.push("import { createMockWorkflowProvider } from './setup';");
                  }

                  return fixer.insertTextAfter(node.body[0], '\n' + imports.join('\n'));
                },
              });
            }
          },
        };
      },
    },

    'no-duplicate-test-patterns': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Prevent duplicate test patterns that can be DRYed',
          category: 'Best Practices',
          recommended: true,
        },
        schema: [],
        messages: {
          duplicatePattern: 'This test pattern is duplicated. Consider using a test factory.',
          useTestFactory: 'Use createWorkflowTestSuite() to reduce duplication',
        },
      },
      create(context) {
        const testPatterns = [];

        return {
          CallExpression(node) {
            // Track test function calls
            if (
              (node.callee?.name === 'test' || node.callee?.name === 'it') &&
              node.arguments[0]?.type === 'Literal'
            ) {
              const testName = node.arguments[0].value;

              // Check for common duplicate patterns
              if (
                testName.includes('should create') ||
                testName.includes('should execute') ||
                testName.includes('should handle errors')
              ) {
                const pattern = testName.replace(/\s+/g, ' ').trim();

                if (testPatterns.includes(pattern)) {
                  context.report({
                    node,
                    messageId: 'duplicatePattern',
                  });
                } else {
                  testPatterns.push(pattern);
                }
              }
            }
          },
        };
      },
    },

    'prefer-test-suite-generators': {
      meta: {
        type: 'suggestion',
        docs: {
          description: 'Prefer test suite generators over manual test creation',
          category: 'Best Practices',
          recommended: true,
        },
        fixable: 'code',
        schema: [],
        messages: {
          useTestSuite: 'Consider using createWorkflowTestSuite() for better organization',
          replaceWithSuite: 'Replace manual tests with test suite generator',
        },
      },
      create(context) {
        let testCount = 0;
        let hasTestSuite = false;

        return {
          CallExpression(node) {
            if (node.callee?.name === 'test' || node.callee?.name === 'it') {
              testCount++;
            }
            if (
              node.callee?.name === 'createWorkflowTestSuite' ||
              node.callee?.name === 'createProviderTestSuite'
            ) {
              hasTestSuite = true;
            }
          },
          'Program:exit'(node) {
            // If there are many tests but no test suite, suggest using generators
            if (testCount >= 5 && !hasTestSuite) {
              context.report({
                node,
                messageId: 'useTestSuite',
              });
            }
          },
        };
      },
    },
  },
};

/**
 * Configuration for the DRY pattern rules
 */
module.exports.configs = {
  recommended: {
    plugins: ['orchestration-dry'],
    rules: {
      'orchestration-dry/no-manual-mock-creation': 'warn',
      'orchestration-dry/no-hardcoded-test-data': 'warn',
      'orchestration-dry/require-centralized-assertions': 'warn',
      'orchestration-dry/require-dry-imports': 'error',
      'orchestration-dry/no-duplicate-test-patterns': 'warn',
      'orchestration-dry/prefer-test-suite-generators': 'warn',
    },
  },
  strict: {
    plugins: ['orchestration-dry'],
    rules: {
      'orchestration-dry/no-manual-mock-creation': 'error',
      'orchestration-dry/no-hardcoded-test-data': 'error',
      'orchestration-dry/require-centralized-assertions': 'error',
      'orchestration-dry/require-dry-imports': 'error',
      'orchestration-dry/no-duplicate-test-patterns': 'error',
      'orchestration-dry/prefer-test-suite-generators': 'error',
    },
  },
};
