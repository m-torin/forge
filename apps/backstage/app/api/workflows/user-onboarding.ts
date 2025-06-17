/**
 * User Onboarding Workflow
 * Multi-step user onboarding with conditional paths and integrations
 */

import { z } from 'zod';

import {
  compose,
  createStep,
  createStepWithValidation,
  StepTemplates,
  withStepMonitoring,
  withStepRetry,
} from '@repo/orchestration/server/next';

// Input schemas
const UserOnboardingInput = z.object({
  email: z.string().email(),
  preferences: z
    .object({
      marketingEmails: z.boolean().default(false),
      newsletter: z.boolean().default(true),
      productUpdates: z.boolean().default(true),
    })
    .optional(),
  referralCode: z.string().optional(),
  signupSource: z.enum(['organic', 'social', 'referral', 'paid']),
  userId: z.string(),
});

// Step 1: Create user profile
export const createUserProfileStep = compose(
  createStepWithValidation(
    'create-user-profile',
    async (input: z.infer<typeof UserOnboardingInput>) => {
      // Initialize user profile with defaults
      const profile = {
        createdAt: new Date().toISOString(),
        email: input.email,
        metadata: {
          onboardingVersion: '2.0',
          referralCode: input.referralCode,
          signupSource: input.signupSource,
        },
        settings: {
          currency: 'USD',
          language: 'en',
          theme: 'light',
          timezone: 'UTC',
        },
        stats: {
          completedOnboarding: false,
          lastLoginAt: null,
          loginCount: 0,
        },
        status: 'active',
        tier: 'free',
        userId: input.userId,
      };

      // Simulate database save
      await new Promise((resolve) => setTimeout(resolve, 100));

      return {
        ...input,
        profile,
        profileCreated: true,
      };
    },
    (input: any) => !!input.userId && !!input.email,
    (output: any) => !!output.profile,
  ),
  (step: any) => withStepMonitoring(step),
);

// Step 2: Send welcome email
export const sendWelcomeEmailStep = compose(
  StepTemplates.notification('send-welcome-email', 'info'),
  (step: any) => withStepRetry(step, { maxRetries: 3 }),
);

// Step 3: Check referral code
export const checkReferralStep = createStep('check-referral', async (data: any) => {
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
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Mock referral data
  const isValid = referralCode.startsWith('REF');
  const referrer = isValid
    ? {
        name: 'John Doe',
        tier: 'premium',
        userId: 'user_' + referralCode.slice(3),
      }
    : null;

  return {
    ...data,
    referral: {
      valid: isValid,
      code: referralCode,
      referrer,
      rewards: isValid
        ? {
            newUserBonus: 25, // $25 credit
            referrerBonus: 50, // $50 credit
          }
        : null,
    },
  };
});

// Step 4: Apply referral rewards (conditional)
export const applyReferralRewardsStep = StepTemplates.conditional(
  'apply-referral-rewards',
  (input: any) => input.referral?.isValid === true,
  {
    falseStep: createStep('skip-rewards', async (data: any) => ({
      ...data,
      rewardsApplied: false,
    })),
    trueStep: createStep('grant-rewards', async (data: any) => {
      const { referral, userId } = data;

      // Grant credits to both users
      const transactions = [
        {
          type: 'referral_bonus',
          amount: referral.rewards.newUserBonus,
          description: 'Welcome bonus from referral',
          userId: userId,
        },
        {
          type: 'referral_reward',
          amount: referral.rewards.referrerBonus,
          description: `Referral reward for inviting user ${userId}`,
          userId: referral.referrer.userId,
        },
      ];

      return {
        ...data,
        rewardsApplied: true,
        transactions,
      };
    }),
  },
);

// Step 5: Create initial workspace
export const createWorkspaceStep = createStep('create-workspace', async (data: any) => {
  const { profile, userId } = data;

  const workspace = {
    id: `ws_${Date.now()}`,
    name: `${profile.email.split('@')[0]}'s Workspace`,
    createdAt: new Date().toISOString(),
    features: {
      maxProjects: 3,
      maxTeamMembers: 5,
      storage: 5 * 1024 * 1024 * 1024, // 5GB
    },
    ownerId: userId,
    plan: 'free',
  };

  // Create default project
  const defaultProject = {
    id: `proj_${Date.now()}`,
    name: 'My First Project',
    createdAt: new Date().toISOString(),
    description: 'Get started with your first project',
    template: 'blank',
    workspaceId: workspace.id,
  };

  return {
    ...data,
    defaultProject,
    workspace,
  };
});

// Step 6: Setup integrations based on signup source
export const setupIntegrationsStep = createStep('setup-integrations', async (data: any) => {
  const { signupSource, userId } = data;
  const integrations = [];

  // Configure integrations based on source
  switch (signupSource) {
    case 'social':
      integrations.push({
        provider: 'google',
        type: 'oauth',
        status: 'pending_connection',
      });
      break;
    case 'paid':
      integrations.push({
        provider: 'mixpanel',
        type: 'analytics',
        config: { track_premium: true },
        status: 'auto_enabled',
      });
      break;
    case 'referral':
      integrations.push({
        provider: 'internal',
        type: 'referral_tracking',
        status: 'active',
      });
      break;
  }

  // Common integrations
  integrations.push(
    {
      provider: 'sendgrid',
      type: 'email',
      status: 'active',
    },
    {
      provider: 'intercom',
      type: 'support',
      config: {
        user_id: userId,
        signup_date: new Date().toISOString(),
      },
      status: 'active',
    },
  );

  return {
    ...data,
    integrations,
    integrationsConfigured: true,
  };
});

// Step 7: Schedule onboarding emails
export const scheduleOnboardingEmailsStep = createStep('schedule-emails', async (data: any) => {
  const { email, preferences, userId } = data;

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
      },
    );
  }

  if (preferences?.newsletter) {
    emailSchedule.push({
      type: 'weekly_newsletter',
      recurring: true,
      scheduledFor: new Date(Date.now() + 604800000).toISOString(), // 7 days
      templateId: 'newsletter_welcome',
    });
  }

  return {
    ...data,
    emailSchedule,
    totalScheduled: emailSchedule.length,
  };
});

// Step 8: Track onboarding analytics
export const trackAnalyticsStep = compose(
  createStep('track-analytics', async (data: any) => {
    const events: any[] = [
      {
        event: 'user_onboarded',
        properties: {
          emailsScheduled: data.totalScheduled || 0,
          hasReferral: !!data.referralCode,
          integrationsCount: data.integrations?.length || 0,
          source: data.signupSource,
          workspaceCreated: true,
        },
        timestamp: new Date().toISOString(),
        userId: data.userId,
      },
    ];

    // Add referral event if applicable
    if (data.referral?.valid) {
      events.push({
        event: 'referral_completed',
        properties: {
          rewardAmount: data.referral.rewards.referrerBonus,
        },
        timestamp: new Date().toISOString(),
        userId: data.referral.referrer.userId,
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
  (step: any) => withStepRetry(step, { maxRetries: 2 }),
);

// Step 9: Send internal notification
export const notifyInternalTeamStep = StepTemplates.notification('notify-team', 'info');

// Step 10: Finalize onboarding
export const finalizeOnboardingStep = createStep('finalize-onboarding', async (data: any) => {
  // Update user status
  const summary = {
    completedAt: new Date().toISOString(),
    duration: Date.now() - new Date(data.profile.createdAt).getTime(),
    nextSteps: [
      'Complete profile setup',
      'Invite team members',
      'Create first real project',
      'Connect additional integrations',
    ],
    steps: {
      emailsScheduled: data.totalScheduled || 0,
      integrationsSetup: data.integrations?.length || 0,
      profileCreated: true,
      referralProcessed: data.referral?.valid || false,
      welcomeEmailSent: true,
      workspaceCreated: true,
    },
    userId: data.userId,
  };

  return {
    ...data,
    onboardingComplete: true,
    summary,
  };
});

// Main workflow definition
export const userOnboardingWorkflow = {
  id: 'user-onboarding',
  name: 'User Onboarding',
  config: {
    criticalSteps: ['create-user-profile', 'create-workspace'], // Must succeed
    maxDuration: 120000, // 2 minutes
  },
  description: 'Multi-step user onboarding with conditional paths and integrations',
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
  version: '1.0.0',
};
