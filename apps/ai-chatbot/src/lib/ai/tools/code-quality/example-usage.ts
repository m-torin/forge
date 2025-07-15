/**
 * Example Usage of Code Quality Tools in AI Chatbot
 *
 * This file demonstrates how to integrate and use the code quality analysis tools
 * within the AI chatbot application.
 */

import { openai } from '@repo/ai/shared/providers';
import { generateText } from 'ai';
import type { Session } from 'next-auth';
import { createAdvancedToolsSuite } from '../../advanced-tools';

/**
 * Example: Code Quality Analysis Workflow
 *
 * This demonstrates how a user can initiate code quality analysis through the chatbot
 */
export async function exampleCodeQualityAnalysis() {
  // Mock user session (in real usage, this comes from authentication)
  const mockSession: Session = {
    user: { id: 'user-123', name: 'Developer', email: 'dev@example.com' },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  // Create tools suite with code quality enabled
  const toolsConfig = {
    userId: 'user-123',
    session: mockSession,
    enableCodeQuality: true,
    enableAdvancedAnalysis: false, // Disable other tools for this example
    enableWorkflows: false,
    enableCollaboration: false,
  };

  const tools = createAdvancedToolsSuite(toolsConfig);

  // Simulate user request for code quality analysis
  const userPrompt = `I'd like to analyze the code quality of my TypeScript project at /Users/myuser/my-project. 
  Please run a comprehensive analysis and create a pull request with improvements.`;

  try {
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: userPrompt,
      tools,
      maxSteps: 10, // Allow multiple tool calls for complete workflow
    });

    console.log('Code Quality Analysis Result:', result);
    return result;
  } catch (error) {
    console.error('Code quality analysis failed:', error);
    throw error;
  }
}

/**
 * Example: Quick Code Review
 *
 * This demonstrates how to use the quick code review tool for immediate feedback
 */
export async function exampleQuickCodeReview() {
  const mockSession: Session = {
    user: { id: 'user-456', name: 'Reviewer', email: 'reviewer@example.com' },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  const toolsConfig = {
    userId: 'user-456',
    session: mockSession,
    enableCodeQuality: true,
    enableAdvancedAnalysis: false,
    enableWorkflows: false,
    enableCollaboration: false,
  };

  const tools = createAdvancedToolsSuite(toolsConfig);

  const userPrompt = `Can you quickly review this file: /Users/myuser/src/components/MyComponent.tsx
  Focus on TypeScript errors and code complexity issues.`;

  try {
    const result = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: userPrompt,
      tools,
      maxSteps: 3, // Quick review should be fast
    });

    console.log('Quick Code Review Result:', result);
    return result;
  } catch (error) {
    console.error('Quick code review failed:', error);
    throw error;
  }
}

/**
 * Example: Integration with Chat Interface
 *
 * This shows how the code quality tools integrate with the chat interface
 */
export function getCodeQualitySystemPrompt(): string {
  return `You are an AI assistant with advanced code quality analysis capabilities. You can:

1. **Comprehensive Code Quality Analysis**: Analyze entire codebases for:
   - TypeScript/JavaScript errors and warnings
   - ESLint issues and best practices
   - Code complexity and maintainability
   - Architectural patterns and consistency
   - Vercel-specific optimizations
   - Generate detailed reports with actionable recommendations
   - Optionally create pull requests with improvements

2. **Quick Code Reviews**: Provide immediate feedback on specific files focusing on:
   - TypeScript type errors
   - Code complexity issues
   - Common anti-patterns
   - Performance concerns

When users ask about code quality, code review, or want to improve their codebase:
- Use the codeQualityAnalysis tool for comprehensive analysis
- Use the quickCodeReview tool for quick feedback on specific files
- Always explain what the analysis will do before starting
- Provide clear, actionable recommendations based on the results

Key features of the code quality analysis:
- **Safe Analysis**: Uses Git worktrees for isolation - no changes to original code
- **Comprehensive Coverage**: Analyzes patterns, complexity, TypeScript, ESLint, and Vercel optimizations  
- **Smart Recommendations**: Prioritizes critical issues and provides specific solutions
- **Automated Improvements**: Can create pull requests with fixes when requested
- **Flexible Presets**: Quick (5 min), comprehensive (15 min), or automated (20 min) analysis modes

Always ask for clarification if the user's request is ambiguous about which type of analysis they want.`;
}

/**
 * Example: Error Handling and User Feedback
 */
export function handleCodeQualityErrors(error: any): string {
  if (error.message?.includes('Session not found')) {
    return "I couldn't start the code quality analysis because the session wasn't properly initialized. Please try again.";
  }

  if (error.message?.includes('Package path not found')) {
    return "The specified package path doesn't exist or isn't accessible. Please check the path and try again.";
  }

  if (error.message?.includes('Git worktree')) {
    return 'There was an issue creating an isolated environment for analysis. Make sure the directory is a Git repository and try again.';
  }

  if (error.message?.includes('Permission denied')) {
    return "I don't have permission to access the specified directory. Please check the permissions and try again.";
  }

  return `Code quality analysis failed: ${error.message}. Please try again or contact support if the issue persists.`;
}

/**
 * Example: Tool Configuration for Different User Types
 */
export function getCodeQualityConfigForUser(userType: 'free' | 'pro' | 'enterprise'): any {
  const baseConfig = {
    enableCodeQuality: true,
    enableAdvancedAnalysis: false,
    enableWorkflows: false,
    enableCollaboration: false,
  };

  switch (userType) {
    case 'free':
      return {
        ...baseConfig,
        // Free users get basic code quality only
      };

    case 'pro':
      return {
        ...baseConfig,
        enableAdvancedAnalysis: true, // Pro users get advanced analysis
      };

    case 'enterprise':
      return {
        ...baseConfig,
        enableAdvancedAnalysis: true,
        enableWorkflows: true,
        enableCollaboration: true, // Enterprise gets everything
      };

    default:
      return baseConfig;
  }
}

export {
  exampleCodeQualityAnalysis,
  exampleQuickCodeReview,
  getCodeQualityConfigForUser,
  getCodeQualitySystemPrompt,
  handleCodeQualityErrors,
};
