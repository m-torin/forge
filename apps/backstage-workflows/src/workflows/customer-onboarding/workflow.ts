import { serve } from '@upstash/workflow/nextjs';
import type { CustomerOnboardingInput, WorkflowCompletionResult } from './types';
import {
  sendEmail,
  generatePersonalizedMessage,
  generateWelcomeEmailContent,
  generateFollowUpEmailContent,
} from './services';

/**
 * Customer onboarding workflow
 * Demonstrates a multi-step workflow with email sending, delays, and AI generation
 */
export const customerOnboardingWorkflow = serve<CustomerOnboardingInput>(
  async (context) => {
    const { userId, email, name, company, role } = context.requestPayload;

    console.log(`🚀 Starting customer onboarding workflow for ${name} (${email})`);

    // Step 1: Send welcome email
    const welcomeEmailResult = await context.run('send-welcome-email', async () => {
      const welcomeContent = generateWelcomeEmailContent(name, company, role);
      const result = await sendEmail(email, 'Welcome to our platform!', welcomeContent);

      if (result.status === 'failed') {
        throw new Error(`Failed to send welcome email: ${result.error}`);
      }

      return result;
    });

    console.log(`✅ Welcome email sent: ${welcomeEmailResult.messageId}`);

    // Step 2: Wait for 30 seconds (simulating a 3-day delay for demo purposes)
    await context.sleep('wait-for-follow-up', 30);

    console.log(`⏰ Delay completed, proceeding with follow-up`);

    // Step 3: Generate personalized follow-up message using AI
    const aiMessage = await context.run('generate-follow-up-message', async () => {
      const message = await generatePersonalizedMessage(name, company);
      console.log(`🤖 AI generated message (${message.tokensUsed} tokens): ${message.content}`);
      return message;
    });

    // Step 4: Send personalized follow-up email
    const followUpEmailResult = await context.run('send-follow-up-email', async () => {
      const followUpContent = generateFollowUpEmailContent(name, aiMessage.content);
      const result = await sendEmail(email, 'How are you settling in?', followUpContent);

      if (result.status === 'failed') {
        throw new Error(`Failed to send follow-up email: ${result.error}`);
      }

      return result;
    });

    console.log(`✅ Follow-up email sent: ${followUpEmailResult.messageId}`);

    // Step 5: Log completion
    const completionData = await context.run('log-completion', async () => {
      console.log(`🎉 Customer onboarding completed successfully for ${name}`);
      console.log(`📈 Workflow stats:`);
      console.log(`   - User ID: ${userId}`);
      console.log(`   - Welcome Email: ${welcomeEmailResult.messageId}`);
      console.log(`   - AI Tokens Used: ${aiMessage.tokensUsed}`);
      console.log(`   - Follow-up Email: ${followUpEmailResult.messageId}`);

      return {
        userId,
        completedAt: new Date().toISOString(),
        welcomeEmailId: welcomeEmailResult.messageId,
        followUpEmailId: followUpEmailResult.messageId,
        aiTokensUsed: aiMessage.tokensUsed,
      };
    });

    const result: WorkflowCompletionResult = {
      success: true,
      message: `Customer onboarding completed successfully for ${name}`,
      userId,
      emailsSent: 2,
      completedAt: completionData.completedAt,
      welcomeEmailId: completionData.welcomeEmailId,
      followUpEmailId: completionData.followUpEmailId,
      aiTokensUsed: completionData.aiTokensUsed,
    };

    return result;
  },
  {
    // Configure retries and failure handling
    retries: 3,
    verbose: true,
    failureFunction: async ({ context, failStatus, failResponse }) => {
      console.error(`❌ Workflow failed for ${context.requestPayload.name}:`, {
        status: failStatus,
        response: failResponse,
      });

      // In a real implementation, you might want to:
      // - Send an alert to the team
      // - Log the failure to a monitoring system
      // - Trigger a recovery workflow
    },
  },
);
