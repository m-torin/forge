import { z } from 'zod';

/**
 * Customer onboarding workflow input data
 */
export const CustomerOnboardingInputSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  email: z.string().email('Valid email is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().optional(),
  role: z.string().optional(),
});

export type CustomerOnboardingInput = z.infer<typeof CustomerOnboardingInputSchema>;

/**
 * Workflow trigger options
 */
export const TriggerWorkflowSchema = z.object({
  workflowRunId: z.string().optional(),
  retries: z.number().min(0).max(10).default(3),
  delay: z.string().optional(),
});

export type TriggerWorkflowInput = z.infer<typeof TriggerWorkflowSchema>;

/**
 * Email sending result
 */
export interface EmailResult {
  messageId: string;
  status: 'sent' | 'failed';
  error?: string;
}

/**
 * AI-generated message response
 */
export interface AIMessageResponse {
  content: string;
  model: string;
  tokensUsed: number;
}

/**
 * Workflow completion result
 */
export interface WorkflowCompletionResult {
  success: boolean;
  message: string;
  userId: string;
  emailsSent: number;
  completedAt: string;
  welcomeEmailId: string;
  followUpEmailId: string;
  aiTokensUsed: number;
}
