import { customerOnboardingWorkflow } from '../../../../workflows/customer-onboarding';

/**
 * Customer onboarding workflow API route
 * This exposes the centralized workflow as a Next.js API route
 */
export const { POST } = customerOnboardingWorkflow;
