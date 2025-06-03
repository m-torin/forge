import 'server-only';

import {
  sendApiKeyCreatedEmail as sendApiKeyCreatedEmailTemplate,
  sendMagicLinkEmail,
  sendOrganizationInvitationEmail,
  sendPasswordResetEmail as sendPasswordResetEmailTemplate,
  sendVerificationEmail as sendVerificationEmailTemplate,
  sendWelcomeEmail as sendWelcomeEmailTemplate,
} from '@repo/email';

interface InvitationEmailData {
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

export const sendOrganizationInvitation = async (data: InvitationEmailData) => {
  try {
    const inviteLink = `${process.env.BETTER_AUTH_URL}/accept-invitation/${data.id}`;

    await sendOrganizationInvitationEmail({
      email: data.email,
      expiresIn: '48 hours',
      inviteLink,
      inviterEmail: data.inviter.user.email,
      inviterName: data.inviter.user.name,
      organizationName: data.organization.name,
    });
  } catch (error) {
    console.error('Failed to send organization invitation email:', error);
    throw new Error('Failed to send invitation email');
  }
};

export const sendWelcomeEmail = async (data: {
  email: string;
  name: string;
  organizationName: string;
}) => {
  try {
    await sendWelcomeEmailTemplate({
      name: data.name,
      dashboardUrl: `${process.env.BETTER_AUTH_URL}/dashboard`,
      email: data.email,
      organizationName: data.organizationName,
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

export const sendApiKeyCreatedEmail = async (data: {
  email: string;
  name: string;
  apiKeyName: string;
  apiKeyId: string;
}) => {
  try {
    await sendApiKeyCreatedEmailTemplate({
      name: data.name,
      apiKeyId: data.apiKeyId,
      apiKeyName: data.apiKeyName,
      dashboardUrl: `${process.env.BETTER_AUTH_URL}/api-keys`,
      email: data.email,
    });
  } catch (error) {
    console.error('Failed to send API key created email:', error);
    throw new Error('Failed to send API key created email');
  }
};

export const sendVerificationEmail = async (data: {
  user: { email: string; name?: string | null };
  url: string;
  token: string;
}) => {
  try {
    await sendVerificationEmailTemplate({
      name: data.user.name,
      email: data.user.email,
      verificationLink: data.url,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (data: {
  user: { email: string; name?: string | null };
  url: string;
  token: string;
}) => {
  try {
    await sendPasswordResetEmailTemplate({
      name: data.user.name,
      email: data.user.email,
      resetLink: data.url,
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export const sendMagicLinkEmailAuth = async (data: {
  user: { email: string; name?: string | null };
  url: string;
  token: string;
}) => {
  try {
    await sendMagicLinkEmail({
      name: data.user.name,
      email: data.user.email,
      expiresIn: '20 minutes',
      magicLink: data.url,
    });
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    throw new Error('Failed to send magic link email');
  }
};
