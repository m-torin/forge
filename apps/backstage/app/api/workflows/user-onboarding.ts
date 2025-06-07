/**
 * User Onboarding Workflow
 * Multi-step user onboarding with conditional paths and integrations
 */

import {
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepRetry,
  withStepMonitoring,
  compose,
} from '@repo/orchestration';
import { z } from 'zod';

// Input schemas
const UserOnboardingInput = z.object({
  userId: z.string(),
  email: z.string().email(),
  signupSource: z.enum(['organic', 'social', 'referral', 'paid']),
  referralCode: z.string().optional(),
  preferences: z.object({
    newsletter: z.boolean().default(true),
    productUpdates: z.boolean().default(true),
    marketingEmails: z.boolean().default(false),
  }).optional(),
});

// Step 1: Create user profile
export const createUserProfileStep = compose(
  createStepWithValidation(
    'create-user-profile',
    async (input: z.infer<typeof UserOnboardingInput>) => {
      // Initialize user profile with defaults
      const profile = {
        userId: input.userId,
        email: input.email,
        createdAt: new Date().toISOString(),
        status: 'active',
        tier: 'free',
        settings: {
          language: 'en',
          timezone: 'UTC',
          currency: 'USD',
          theme: 'light',
        },
        metadata: {
          signupSource: input.signupSource,
          referralCode: input.referralCode,
          onboardingVersion: '2.0',
        },
        stats: {
          loginCount: 0,
          lastLoginAt: null,
          completedOnboarding: false,
        },
      };

      // Simulate database save
      await new Promise(resolve => setTimeout(resolve, 100));

      return {
        ...input,
        profile,
        profileCreated: true,
      };
    },
    (input) => !!input.userId && !!input.email,
    (output) => !!output.profile
  ),
  (step) => withStepMonitoring(step, { enableDetailedLogging: true })
);

// Step 2: Send welcome email
export const sendWelcomeEmailStep = compose(
  StepTemplates.notification(
    'send-welcome-email',
    'Send personalized welcome email',
    {
      channels: ['email'],
      template: {
        templateId: 'welcome-v2',
        subject: 'Welcome to {{appName}}! 🎉',
      },
    }
  ),
  (step) => withStepRetry(step, { maxAttempts: 3 })
);

// Step 3: Check referral code
export const checkReferralStep = createStep(
  'check-referral',
  async (data: any) => {
    const { referralCode, userId } = data;
    
    if (!referralCode) {
      return {
        ...data,
        referral: {
          valid: false,
          skipped: true,
        },
      };
    }

    // Simulate referral validation
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Mock referral data
    const isValid = referralCode.startsWith('REF');
    const referrer = isValid ? {
      userId: 'user_' + referralCode.slice(3),
      name: 'John Doe',
      tier: 'premium',
    } : null;

    return {
      ...data,
      referral: {
        valid: isValid,
        code: referralCode,
        referrer,
        rewards: isValid ? {
          referrerBonus: 50, // $50 credit
          newUserBonus: 25, // $25 credit
        } : null,
      },
    };
  }
);

// Step 4: Apply referral rewards (conditional)
export const applyReferralRewardsStep = StepTemplates.conditional(
  'apply-referral-rewards',
  'Apply referral bonuses if valid',
  {
    condition: (data: any) => data.referral?.valid === true,
    trueStep: createStep('grant-rewards', async (data: any) => {
      const { userId, referral } = data;
      
      // Grant credits to both users
      const transactions = [
        {
          userId: userId,
          amount: referral.rewards.newUserBonus,
          type: 'referral_bonus',
          description: 'Welcome bonus from referral',
        },
        {
          userId: referral.referrer.userId,
          amount: referral.rewards.referrerBonus,
          type: 'referral_reward',
          description: `Referral reward for inviting user ${userId}`,
        },
      ];

      return {
        ...data,
        rewardsApplied: true,
        transactions,
      };
    }),
    falseStep: createStep('skip-rewards', async (data: any) => ({
      ...data,
      rewardsApplied: false,
    })),
  }
);

// Step 5: Create initial workspace
export const createWorkspaceStep = createStep(
  'create-workspace',
  async (data: any) => {
    const { userId, profile } = data;
    
    const workspace = {
      id: `ws_${Date.now()}`,
      name: `${profile.email.split('@')[0]}'s Workspace`,
      ownerId: userId,
      plan: 'free',
      features: {
        maxProjects: 3,
        maxTeamMembers: 5,
        storage: 5 * 1024 * 1024 * 1024, // 5GB
      },
      createdAt: new Date().toISOString(),
    };

    // Create default project
    const defaultProject = {
      id: `proj_${Date.now()}`,
      workspaceId: workspace.id,
      name: 'My First Project',
      description: 'Get started with your first project',
      template: 'blank',
      createdAt: new Date().toISOString(),
    };

    return {
      ...data,
      workspace,
      defaultProject,
    };
  }
);

// Step 6: Setup integrations based on signup source
export const setupIntegrationsStep = createStep(
  'setup-integrations',
  async (data: any) => {
    const { signupSource, userId } = data;
    const integrations = [];

    // Configure integrations based on source
    switch (signupSource) {
      case 'social':
        integrations.push({
          type: 'oauth',
          provider: 'google',
          status: 'pending_connection',
        });
        break;
      case 'paid':
        integrations.push({
          type: 'analytics',
          provider: 'mixpanel',
          status: 'auto_enabled',
          config: { track_premium: true },
        });
        break;
      case 'referral':
        integrations.push({
          type: 'referral_tracking',
          provider: 'internal',
          status: 'active',
        });
        break;
    }

    // Common integrations
    integrations.push(
      {
        type: 'email',
        provider: 'sendgrid',
        status: 'active',
      },
      {
        type: 'support',
        provider: 'intercom',
        status: 'active',
        config: {
          user_id: userId,
          signup_date: new Date().toISOString(),
        },
      }
    );

    return {
      ...data,
      integrations,
      integrationsConfigured: true,
    };
  }
);

// Step 7: Schedule onboarding emails
export const scheduleOnboardingEmailsStep = createStep(
  'schedule-emails',
  async (data: any) => {
    const { userId, email, preferences } = data;
    
    const emailSchedule = [];
    
    if (preferences?.productUpdates) {
      emailSchedule.push(
        {
          type: 'day_1_tips',
          scheduledFor: new Date(Date.now() + 86400000).toISOString(), // 1 day
          templateId: 'onboarding_day_1',
        },
        {
          type: 'day_3_features',
          scheduledFor: new Date(Date.now() + 259200000).toISOString(), // 3 days
          templateId: 'onboarding_day_3',
        },
        {
          type: 'day_7_checkin',
          scheduledFor: new Date(Date.now() + 604800000).toISOString(), // 7 days
          templateId: 'onboarding_day_7',
        }
      );
    }

    if (preferences?.newsletter) {
      emailSchedule.push({
        type: 'weekly_newsletter',
        scheduledFor: new Date(Date.now() + 604800000).toISOString(), // 7 days
        templateId: 'newsletter_welcome',
        recurring: true,
      });
    }

    return {
      ...data,
      emailSchedule,
      totalScheduled: emailSchedule.length,
    };
  }
);

// Step 8: Track onboarding analytics
export const trackAnalyticsStep = compose(
  createStep('track-analytics', async (data: any) => {
    const events = [
      {
        event: 'user_onboarded',
        userId: data.userId,
        properties: {
          source: data.signupSource,
          hasReferral: !!data.referralCode,
          workspaceCreated: true,
          integrationsCount: data.integrations?.length || 0,
          emailsScheduled: data.totalScheduled || 0,
        },
        timestamp: new Date().toISOString(),
      },
    ];

    // Add referral event if applicable
    if (data.referral?.valid) {
      events.push({
        event: 'referral_completed',
        userId: data.referral.referrer.userId,
        properties: {
          referredUserId: data.userId,
          rewardAmount: data.referral.rewards.referrerBonus,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Simulate sending to analytics service
    console.log('Analytics events:', events);

    return {
      ...data,
      analyticsTracked: true,
      events,
    };
  }),
  (step) => withStepRetry(step, { maxAttempts: 2 })
);

// Step 9: Send internal notification
export const notifyInternalTeamStep = StepTemplates.notification(
  'notify-team',
  'Alert sales/success team about new signup',
  {
    channels: ['slack'],
    condition: (data: any) => 
      data.signupSource === 'paid' || data.referral?.referrer?.tier === 'premium',
    template: {
      channel: '#new-signups',
      text: 'New {{tier}} user signup from {{source}}',
    },
  }
);

// Step 10: Finalize onboarding
export const finalizeOnboardingStep = createStep(
  'finalize-onboarding',
  async (data: any) => {
    // Update user status
    const summary = {
      userId: data.userId,
      completedAt: new Date().toISOString(),
      duration: Date.now() - new Date(data.profile.createdAt).getTime(),
      steps: {
        profileCreated: true,
        welcomeEmailSent: true,
        referralProcessed: data.referral?.valid || false,
        workspaceCreated: true,
        integrationsSetup: data.integrations?.length || 0,
        emailsScheduled: data.totalScheduled || 0,
      },
      nextSteps: [
        'Complete profile setup',
        'Invite team members',
        'Create first real project',
        'Connect additional integrations',
      ],
    };

    return {
      ...data,
      onboardingComplete: true,
      summary,
    };
  }
);

// Main workflow definition
export const userOnboardingWorkflow = {
  id: 'user-onboarding',
  name: 'User Onboarding',
  description: 'Multi-step user onboarding with conditional paths and integrations',
  version: '1.0.0',
  steps: [
    createUserProfileStep,
    sendWelcomeEmailStep,
    checkReferralStep,
    applyReferralRewardsStep,
    createWorkspaceStep,
    setupIntegrationsStep,
    scheduleOnboardingEmailsStep,
    trackAnalyticsStep,
    notifyInternalTeamStep,
    finalizeOnboardingStep,
  ],
  config: {
    maxDuration: 120000, // 2 minutes
    criticalSteps: ['create-user-profile', 'create-workspace'], // Must succeed
  },
};