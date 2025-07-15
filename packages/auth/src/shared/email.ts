/**
 * Email integration for authentication
 */

import 'server-only';

import {
  sendApiKeyCreatedEmail as sendApiKeyCreatedEmailTemplate,
  sendMagicLinkEmail,
  sendOrganizationInvitationEmail,
  sendPasswordResetEmail as sendPasswordResetEmailTemplate,
  sendVerificationEmail as sendVerificationEmailTemplate,
  sendWelcomeEmail as sendWelcomeEmailTemplate,
} from '@repo/email/server';
import { logError } from '@repo/observability/shared-env';

// Type definitions for email data
export interface InvitationEmailData {
  email: string;
  id: string;
  inviter: {
    user: {
      name: string | null;
      email: string;
    };
  };
  organization: {
    name: string;
  };
}

export interface UserEmailData {
  email: string;
  name?: string | null;
}

export interface EmailUrlData {
  token: string;
  url: string;
}

export interface WelcomeEmailData {
  email: string;
  name: string;
  organizationName: string;
}

export interface ApiKeyEmailData {
  apiKeyId: string;
  apiKeyName: string;
  email: string;
  name: string;
}

/**
 * Send organization invitation email
 */
export async function sendOrganizationInvitation(data: InvitationEmailData): Promise<void> {
  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invitation/${data.id}`;

  try {
    await sendOrganizationInvitationEmail({
      email: data.email,
      expiresIn: '48 hours' as const,
      inviteLink,
      inviterEmail: data.inviter.user.email,
      inviterName: data.inviter.user.name,
      organizationName: data.organization.name,
    });
  } catch (error) {
    logError(
      'Failed to send organization invitation email:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw new Error('Failed to send invitation email');
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<void> {
  try {
    await sendWelcomeEmailTemplate({
      name: data.name,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      email: data.email,
      organizationName: data.organizationName,
    });
  } catch (error) {
    logError(
      'Failed to send welcome email:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw new Error('Failed to send welcome email');
  }
}

/**
 * Send API key created notification email
 */
export async function sendApiKeyCreatedEmail(data: ApiKeyEmailData): Promise<void> {
  try {
    await sendApiKeyCreatedEmailTemplate({
      name: data.name,
      apiKeyId: data.apiKeyId,
      apiKeyName: data.apiKeyName,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api-keys`,
      email: data.email,
    });
  } catch (error) {
    logError(
      'Failed to send API key created email:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw new Error('Failed to send API key created email');
  }
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(data: UserEmailData & EmailUrlData): Promise<void> {
  try {
    await sendVerificationEmailTemplate({
      name: data.name,
      email: data.email,
      verificationLink: data.url,
    });
  } catch (error) {
    logError(
      'Failed to send verification email:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(data: UserEmailData & EmailUrlData): Promise<void> {
  try {
    await sendPasswordResetEmailTemplate({
      name: data.name,
      email: data.email,
      resetLink: data.url,
    });
  } catch (error) {
    logError(
      'Failed to send password reset email:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send magic link authentication email
 */
export async function sendMagicLinkEmailAuth(data: UserEmailData & EmailUrlData): Promise<void> {
  try {
    await sendMagicLinkEmail({
      name: data.name,
      email: data.email,
      expiresIn: '20 minutes',
      magicLink: data.url,
    });
  } catch (error) {
    logError(
      'Failed to send magic link email:',
      error instanceof Error ? error : new Error(String(error)),
    );
    throw new Error('Failed to send magic link email');
  }
}
