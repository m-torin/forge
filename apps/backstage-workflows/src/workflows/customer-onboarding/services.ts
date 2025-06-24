import type { EmailResult, AIMessageResponse } from './types';

/**
 * Mock email sending function
 * In a real implementation, this would use @repo/email or another email service
 */
export async function sendEmail(
  email: string,
  subject: string,
  content: string,
): Promise<EmailResult> {
  // Simulate email sending delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  console.log(`📧 Sending email to ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content: ${content}`);

  // Simulate occasional failures for demo purposes
  const shouldFail = Math.random() < 0.1; // 10% failure rate

  if (shouldFail) {
    return {
      messageId: '',
      status: 'failed',
      error: 'Failed to send email - simulated failure',
    };
  }

  return {
    messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'sent',
  };
}

/**
 * Mock AI message generation function
 * In a real implementation, this would use @repo/ai or call OpenAI directly
 */
export async function generatePersonalizedMessage(
  name: string,
  company?: string,
): Promise<AIMessageResponse> {
  // Simulate AI processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const messages = [
    `Hi ${name}! Welcome to our platform. We're excited to have you on board!`,
    `Hello ${name}, thanks for joining us! We hope you'll find our tools helpful for your work${company ? ` at ${company}` : ''}.`,
    `Welcome ${name}! We've prepared some resources to help you get started. Feel free to reach out if you have any questions.`,
    `Hi ${name}, we're thrilled you've joined our community! Let us know how we can help you succeed${company ? ` with your team at ${company}` : ''}.`,
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return {
    content: randomMessage,
    model: 'gpt-3.5-turbo-simulated',
    tokensUsed: Math.floor(Math.random() * 100) + 50,
  };
}

/**
 * Generate welcome email content
 */
export function generateWelcomeEmailContent(name: string, company?: string, role?: string): string {
  return `Hi ${name},

Welcome to our platform! We're excited to have you join us${company ? ` from ${company}` : ''}${role ? ` as a ${role}` : ''}.

Here are some quick next steps to get you started:
1. Complete your profile setup
2. Explore our dashboard
3. Join our community forum

If you have any questions, don't hesitate to reach out to our support team.

Best regards,
The Team`;
}

/**
 * Generate follow-up email content
 */
export function generateFollowUpEmailContent(name: string, aiMessage: string): string {
  return `Hi ${name},

${aiMessage}

We wanted to check in and see how your first few days have been. Here are some popular features our users love:

🎯 Smart dashboard that adapts to your workflow
📊 Advanced analytics and reporting
🤝 Collaboration tools for team productivity
📚 Comprehensive learning resources

Is there anything specific you'd like to learn more about? Our team is here to help!

You can reply to this email or schedule a quick call with our success team.

Best regards,
Your Success Team

P.S. Don't forget to check out our new feature announcements in your dashboard!`;
}
