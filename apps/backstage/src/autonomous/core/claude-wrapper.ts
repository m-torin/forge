// Claude CLI wrapper for programmatic code generation and repair
import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { WorkflowSpecification, ErrorAnalysis, RepairStrategy } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ClaudeWrapper {
  private tempDir = join(__dirname, '../../../temp-claude-prompts');
  private outputDir = join(__dirname, '../../../');
  private maxRetries = 3;
  private claudeModel = 'claude-3-opus-20240229'; // Use latest Opus model

  constructor() {
    this.ensureTempDir();
  }

  async generateWorkflowCode(spec: WorkflowSpecification, strategy?: RepairStrategy): Promise<boolean> {
    const prompt = this.buildGenerationPrompt(spec, strategy);
    return await this.executeClaude(prompt, 'generate', spec.name);
  }

  async repairCode(spec: WorkflowSpecification, errorAnalysis: ErrorAnalysis, strategy?: RepairStrategy): Promise<boolean> {
    const prompt = this.buildRepairPrompt(spec, errorAnalysis, strategy);
    return await this.executeClaude(prompt, 'repair', spec.name);
  }

  private buildGenerationPrompt(spec: WorkflowSpecification, strategy?: RepairStrategy): string {
    const strategyGuidance = strategy ? `
## Code Generation Strategy
Based on learning data, use the following approach:
- **Pattern**: ${strategy.pattern}
- **Success Rate**: ${(strategy.successRate * 100).toFixed(1)}%
- **Key Considerations**: ${strategy.considerations.join(', ')}
` : '';

    return `# Autonomous Workflow Code Generation

Generate a complete Upstash Workflow implementation based on this specification.

## Workflow Specification
- **Name**: ${spec.name}
- **Description**: ${spec.description}
- **Type**: ${spec.type || 'general'}

## Input Contract
\`\`\`typescript
${JSON.stringify(spec.inputContract, null, 2)}
\`\`\`

## Output Contract
\`\`\`typescript
${JSON.stringify(spec.outputContract, null, 2)}
\`\`\`

## Business Logic Requirements
${spec.businessLogic.map((logic, i) => `${i + 1}. ${logic}`).join('\n')}

## Error Handling Requirements
${spec.errorHandling?.map((handler, i) => `${i + 1}. ${handler}`).join('\n') || 'Standard error handling with retries'}

## Performance Requirements
${spec.performance ? `
- **Timeout**: ${spec.performance.timeout || 120000}ms
- **Retries**: ${spec.performance.retries || 3}
- **Rate Limit**: ${spec.performance.rateLimit || 'None'}
` : 'Default performance settings'}

${strategyGuidance}

## Implementation Requirements

### 1. Main Workflow File: \`src/workflows/${spec.name}.ts\`

\`\`\`typescript
// Required structure:
import { serve } from '@upstash/workflow/nextjs';
import { z } from 'zod';

// Define input/output schemas using Zod
const inputSchema = z.object({
  // Match the input contract exactly
});

const outputSchema = z.object({
  // Match the output contract exactly  
});

export const { POST } = serve<z.infer<typeof inputSchema>, z.infer<typeof outputSchema>>(
  async (context) => {
    // Implement business logic with proper error handling
    // Use context.run() for each step
    // Include logging and monitoring
  },
  {
    retries: ${spec.performance?.retries || 3},
    timeout: ${spec.performance?.timeout || '120s'}
  }
);
\`\`\`

### 2. Unit Tests: \`tests/unit/${spec.name}.test.ts\`

Generate comprehensive unit tests using Vitest:
- Test input validation
- Test each business logic step
- Test error scenarios
- Test edge cases
- Mock external dependencies

### 3. E2E Tests: \`tests/e2e/${spec.name}.e2e.ts\`

Generate Playwright end-to-end tests:
- Test complete workflow execution
- Test API endpoints
- Test error recovery
- Test performance requirements
- Test concurrent executions

## Code Generation Instructions

1. **Use TypeScript** with strict typing
2. **Follow Upstash Workflow patterns** from official documentation
3. **Implement comprehensive error handling** with structured error types
4. **Add detailed logging** at each step for observability
5. **Include JSDoc documentation** for all public functions
6. **Ensure idempotency** where applicable
7. **Add input/output validation** using Zod schemas
8. **Implement proper timeout handling**
9. **Use environment variables** for configuration
10. **Generate realistic test data** for all test cases

## Quality Requirements

- All code must pass TypeScript compilation with strict mode
- 100% test coverage for business logic
- No ESLint errors or warnings
- Proper error boundaries and fallbacks
- Performance monitoring hooks
- Security best practices (no hardcoded secrets, input sanitization)

Generate all files with complete, production-ready implementations.`;
  }

  private buildRepairPrompt(spec: WorkflowSpecification, errorAnalysis: ErrorAnalysis, strategy?: RepairStrategy): string {
    const strategyGuidance = strategy ? `
## Repair Strategy
Based on learning data, apply this repair approach:
- **Pattern**: ${strategy.pattern}
- **Success Rate**: ${(strategy.successRate * 100).toFixed(1)}%
- **Risk Level**: ${strategy.riskLevel}
- **Key Focus Areas**: ${strategy.considerations.join(', ')}
` : '';

    return `# Autonomous Code Repair

Fix the failing tests for workflow: ${spec.name}

## Current Error Analysis
- **Error Categories**: ${errorAnalysis.categories.join(', ')}
- **Confidence Level**: ${(errorAnalysis.confidence * 100).toFixed(1)}%
- **Primary Errors**: 
${errorAnalysis.errors.map(error => `  - ${error.message} (${error.file}:${error.line})`).join('\n')}

## Suggested Repair Strategy
${errorAnalysis.suggestedStrategy}

${strategyGuidance}

## Test Failures
${errorAnalysis.testFailures.map((failure, i) => `
### ${i + 1}. ${failure.testName}
- **Error**: ${failure.error}
- **Expected**: ${failure.expected}
- **Actual**: ${failure.actual}
- **Stack**: 
\`\`\`
${failure.stack}
\`\`\`
`).join('\n')}

## Root Cause Analysis
${this.performRootCauseAnalysis(errorAnalysis)}

## Repair Instructions

### Priority 1: Fix Critical Errors
1. **Address type errors** - Ensure all TypeScript types are correctly defined
2. **Fix contract violations** - Align implementation with input/output contracts
3. **Resolve import errors** - Check all module imports and dependencies

### Priority 2: Fix Logic Errors  
1. **Correct business logic** - Ensure steps execute in the right order
2. **Fix async/await issues** - Proper promise handling
3. **Update error handling** - Catch and handle all error scenarios

### Priority 3: Fix Test Issues
1. **Update test assertions** - Only if the implementation is correct
2. **Fix test timeouts** - Increase timeouts for slow operations
3. **Mock external dependencies** - Ensure tests are isolated

## Repair Guidelines

- **Preserve working functionality** - Don't break what's already working
- **Make targeted fixes** - Address specific errors, not complete rewrites
- **Maintain type safety** - Keep TypeScript strict mode compliance
- **Update tests carefully** - Only change tests if specifications were misunderstood
- **Add missing error handling** - Ensure all edge cases are covered
- **Document changes** - Add comments explaining significant fixes

## Code Context

Current implementation files:
- \`src/workflows/${spec.name}.ts\`
- \`tests/unit/${spec.name}.test.ts\`
- \`tests/e2e/${spec.name}.e2e.ts\`

Focus on fixing the specific errors identified in the test failures.`;
  }

  private performRootCauseAnalysis(errorAnalysis: ErrorAnalysis): string {
    const analysis: string[] = [];
    
    // Analyze error patterns
    if (errorAnalysis.categories.includes('type-error')) {
      analysis.push('- **Type Mismatches**: Check schema definitions and ensure consistency between contracts and implementation');
    }
    
    if (errorAnalysis.categories.includes('contract-violation')) {
      analysis.push('- **Contract Issues**: Implementation doesn\'t match specified input/output contracts');
    }
    
    if (errorAnalysis.categories.includes('logic-error')) {
      analysis.push('- **Logic Problems**: Business logic steps may be in wrong order or missing critical operations');
    }
    
    if (errorAnalysis.categories.includes('performance-issue')) {
      analysis.push('- **Performance**: Operations taking too long, consider optimization or timeout adjustments');
    }
    
    // Add pattern-specific analysis
    const commonPatterns = this.identifyCommonPatterns(errorAnalysis.errors);
    if (commonPatterns.length > 0) {
      analysis.push(`- **Common Patterns**: ${commonPatterns.join(', ')}`);
    }
    
    return analysis.length > 0 ? analysis.join('\n') : 'No clear root cause identified, manual investigation required';
  }

  private identifyCommonPatterns(errors: any[]): string[] {
    const patterns: string[] = [];
    
    // Count error types
    const errorCounts = new Map<string, number>();
    errors.forEach(error => {
      const key = error.message.split(':')[0];
      errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
    });
    
    // Identify patterns
    errorCounts.forEach((count, errorType) => {
      if (count >= 3) {
        patterns.push(`Multiple ${errorType} errors (${count} occurrences)`);
      }
    });
    
    return patterns;
  }

  private async executeClaude(prompt: string, type: string, workflowName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      // Write prompt to temp file
      const promptFile = join(this.tempDir, `${type}-${workflowName}-${Date.now()}.md`);
      writeFileSync(promptFile, prompt);

      console.log(`📝 Executing Claude ${type} for ${workflowName}...`);

      // Execute Claude CLI with proper flags
      const claudeArgs = [
        '-p', promptFile,
        '--max-tokens', '8192',
        '--temperature', '0.2', // Lower temperature for more consistent code
        '--model', this.claudeModel,
        '--no-cache', // Ensure fresh generation
        '--output-dir', this.outputDir
      ];

      // Add additional flags for repair operations
      if (type === 'repair') {
        claudeArgs.push('--edit-mode'); // Enable edit mode for repairs
      }

      const claude = spawn('claude', claudeArgs, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { 
          ...process.env, 
          CLAUDE_SKIP_PERMISSIONS: 'true',
          CLAUDE_AUTO_CONFIRM: 'true' // Auto-confirm file operations
        }
      });

      let output = '';
      let errorOutput = '';

      claude.stdout.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        // Log progress indicators
        if (chunk.includes('Generating') || chunk.includes('Writing')) {
          process.stdout.write('.');
        }
      });

      claude.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      claude.on('close', (code) => {
        console.log(''); // New line after progress dots
        
        if (code === 0) {
          console.log(`✅ Claude ${type} completed successfully`);
          
          // Verify files were created
          const filesCreated = this.verifyGeneratedFiles(workflowName);
          if (filesCreated) {
            console.log('📁 Files generated successfully');
            resolve(true);
          } else {
            console.error('❌ Files were not created as expected');
            resolve(false);
          }
        } else {
          console.error(`❌ Claude ${type} failed with code ${code}`);
          if (errorOutput) {
            console.error('Error output:', errorOutput);
          }
          resolve(false);
        }
      });

      claude.on('error', (error) => {
        console.error(`💥 Failed to execute Claude:`, error);
        reject(error);
      });

      // Set timeout for long-running operations
      setTimeout(() => {
        claude.kill('SIGTERM');
        console.error('⏱️ Claude operation timed out after 5 minutes');
        resolve(false);
      }, 5 * 60 * 1000);
    });
  }

  private verifyGeneratedFiles(workflowName: string): boolean {
    const requiredFiles = [
      join(this.outputDir, 'src/workflows', `${workflowName}.ts`),
      join(this.outputDir, 'tests/unit', `${workflowName}.test.ts`),
      join(this.outputDir, 'tests/e2e', `${workflowName}.e2e.ts`)
    ];

    return requiredFiles.every(file => {
      const exists = existsSync(file);
      if (!exists) {
        console.warn(`⚠️ Missing expected file: ${file}`);
      }
      return exists;
    });
  }

  private ensureTempDir(): void {
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // Helper method to extract generated code from Claude's output
  async getGeneratedCode(workflowName: string): Promise<{
    workflow: string;
    unitTests: string;
    e2eTests: string;
  } | null> {
    try {
      const workflowPath = join(this.outputDir, 'src/workflows', `${workflowName}.ts`);
      const unitTestPath = join(this.outputDir, 'tests/unit', `${workflowName}.test.ts`);
      const e2eTestPath = join(this.outputDir, 'tests/e2e', `${workflowName}.e2e.ts`);

      if (!existsSync(workflowPath) || !existsSync(unitTestPath) || !existsSync(e2eTestPath)) {
        return null;
      }

      return {
        workflow: readFileSync(workflowPath, 'utf-8'),
        unitTests: readFileSync(unitTestPath, 'utf-8'),
        e2eTests: readFileSync(e2eTestPath, 'utf-8')
      };
    } catch (error) {
      console.error('Error reading generated files:', error);
      return null;
    }
  }

  // Method to clean up temporary files
  async cleanup(): Promise<void> {
    // Clean up old prompt files (older than 24 hours)
    if (existsSync(this.tempDir)) {
      const files = require('fs').readdirSync(this.tempDir);
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000;

      files.forEach((file: string) => {
        const filePath = join(this.tempDir, file);
        const stats = require('fs').statSync(filePath);
        if (now - stats.mtime.getTime() > oneDayMs) {
          require('fs').unlinkSync(filePath);
        }
      });
    }
  }
}