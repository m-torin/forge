/**
 * Computer Use Tools Examples
 * Demonstrates how to use Anthropic's computer use tools with AI SDK v5
 */

import { anthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';
import {
  computerUsePatterns,
  createComputerUseTools,
  createSecureComputerUseTools,
  getComputerUsePreset,
} from '../src/server/tools/computer-use';

/**
 * Example 1: Basic screenshot and click
 */
export async function screenshotAndClickExample() {
  const tools = createComputerUseTools({ sandbox: true });

  const result = await generateText({
    model: anthropic('claude-3-opus-20241022'),
    tools: tools.all,
    maxSteps: 5,
    prompt: 'Take a screenshot and click on the "Submit" button',
  });

  console.log('Result:', result);
  return result;
}

/**
 * Example 2: Fill out a web form
 */
export async function fillWebFormExample() {
  const tools = getComputerUsePreset('webAutomation');

  const result = await generateText({
    model: anthropic('claude-3-opus-20241022'),
    tools,
    maxSteps: 10,
    prompt: `Fill out the contact form with:
    - Name: John Doe
    - Email: john@example.com
    - Message: Hello, I'm interested in your services`,
  });

  return result;
}

/**
 * Example 3: Code development workflow
 */
export async function codeDevelopmentExample() {
  const tools = getComputerUsePreset('development');

  const result = await streamText({
    model: anthropic('claude-3-opus-20241022'),
    tools,
    maxSteps: 20,
    prompt: `Create a new TypeScript file called "utils.ts" with:
    1. A function to format dates
    2. A function to validate email addresses
    3. Export both functions
    Then run TypeScript compilation to check for errors`,
  });

  // Stream the results
  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }

  return result;
}

/**
 * Example 4: Research and documentation
 */
export async function researchDocumentationExample() {
  const tools = getComputerUsePreset('research');

  const result = await generateText({
    model: anthropic('claude-3-opus-20241022'),
    tools,
    maxSteps: 15,
    prompt: `Research the project structure by:
    1. List all TypeScript files in the src directory
    2. Find all files that import from 'ai' package
    3. Create a summary of the AI SDK usage patterns`,
  });

  return result;
}

/**
 * Example 5: Data processing pipeline
 */
export async function dataProcessingExample() {
  const tools = getComputerUsePreset('dataProcessing');

  const result = await generateText({
    model: anthropic('claude-3-opus-20241022'),
    tools,
    maxSteps: 10,
    prompt: `Process the sales data:
    1. Read the sales.csv file
    2. Calculate total revenue by product category
    3. Create a summary report in summary.json
    4. Sort results by revenue descending`,
  });

  return result;
}

/**
 * Example 6: System monitoring
 */
export async function systemMonitoringExample() {
  const tools = createComputerUseTools({
    bash: { enableExecution: true },
    computer: { enableScreenshot: true },
  });

  // Use the monitoring pattern
  const result = await computerUsePatterns.monitorProcess(
    'node',
    30, // Monitor for 30 seconds
    tools,
  );

  console.log('Monitoring result:', result);
  return result;
}

/**
 * Example 7: Secure code review
 */
export async function codeReviewExample() {
  const tools = getComputerUsePreset('codeReview');

  const result = await generateText({
    model: anthropic('claude-3-opus-20241022'),
    tools,
    maxSteps: 15,
    prompt: `Review the authentication implementation:
    1. Find all files related to authentication
    2. Check for security best practices
    3. Look for hardcoded secrets or credentials
    4. Summarize findings`,
  });

  return result;
}

/**
 * Example 8: Multi-agent collaboration with computer use
 */
export async function multiAgentComputerUseExample() {
  const researchTools = getComputerUsePreset('research');
  const docTools = getComputerUsePreset('documentation');

  // Research agent finds information
  const researchResult = await generateText({
    model: anthropic('claude-3-opus-20241022'),
    tools: researchTools,
    maxSteps: 10,
    prompt: 'Find all API endpoints in the codebase and their documentation',
  });

  // Documentation agent creates docs
  const docResult = await generateText({
    model: anthropic('claude-3-opus-20241022'),
    tools: docTools,
    maxSteps: 10,
    prompt: `Based on this research: ${researchResult.text}

    Create a comprehensive API documentation file in docs/api-reference.md`,
  });

  return { researchResult, docResult };
}

/**
 * Example 9: Interactive debugging session
 */
export async function interactiveDebuggingExample() {
  const tools = createComputerUseTools({
    enableAll: true,
    sandbox: false, // Real execution for debugging
  });

  const result = await streamText({
    model: anthropic('claude-3-opus-20241022'),
    tools: tools.all,
    maxSteps: 25,
    experimental_prepareStep: ({ stepNumber, steps: _steps }) => {
      // Adjust behavior based on debugging progress
      if (stepNumber < 5) {
        return {
          temperature: 0.3, // Be precise when gathering information
        };
      } else if (stepNumber < 15) {
        return {
          temperature: 0.5, // Be creative when trying solutions
        };
      } else {
        return {
          temperature: 0.7, // Be more creative if stuck
        };
      }
    },
    prompt: `Debug the failing test:
    1. Run the test suite and identify the failing test
    2. Examine the test file and the code it's testing
    3. Add console.log statements to trace the issue
    4. Fix the bug and verify the test passes`,
  });

  for await (const chunk of result.textStream) {
    process.stdout.write(chunk);
  }

  return result;
}

/**
 * Example 10: Automated deployment
 */
export async function automatedDeploymentExample() {
  const tools = createSecureComputerUseTools({
    bash: {
      allowedCommands: [
        /^git\s+(status|pull|push)/,
        /^npm\s+(test|build)/,
        /^docker\s/,
        /^kubectl\s/,
      ],
    },
  });

  const result = await generateText({
    model: anthropic('claude-3-opus-20241022'),
    tools: tools.all,
    maxSteps: 20,
    prompt: `Deploy the application:
    1. Check git status and ensure clean working directory
    2. Pull latest changes from main branch
    3. Run tests to ensure they pass
    4. Build the Docker image
    5. Deploy to Kubernetes
    6. Verify deployment health`,
  });

  return result;
}

/**
 * Example usage with error handling
 */
export async function runComputerUseExample() {
  try {
    console.log('Starting computer use examples...');

    // Run a simple example
    console.log('1. Screenshot and Click Example:');
    const screenshotResult = await screenshotAndClickExample();
    console.log(`Steps executed: ${screenshotResult.steps?.length || 0}`);

    // Run a complex example
    console.log('2. Code Development Example:');
    await codeDevelopmentExample();
    console.log('');

    // Run a secure example
    console.log('3. Code Review Example:');
    const reviewResult = await codeReviewExample();
    console.log(`Review completed with ${reviewResult.steps?.length || 0} steps
`);
  } catch (error) {
    console.error('Error in computer use example:', error);
  }
}

// Run examples if this file is executed directly
// Comment out to avoid runtime errors in the build
// if (require.main === module) {
//   runComputerUseExample();
// }
