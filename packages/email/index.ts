import { render } from '@react-email/render';
import { Resend } from 'resend';

import { keys } from './keys';
import { ApiKeyCreatedTemplate } from './templates/api-key-created';
import { ContactTemplate } from './templates/contact';
import { MagicLinkTemplate } from './templates/magic-link';
import { OrganizationInvitationTemplate } from './templates/organization-invitation';
import { PasswordResetTemplate } from './templates/password-reset';
import { VerificationTemplate } from './templates/verification';
import { WelcomeTemplate } from './templates/welcome';

let resendInstance: Resend | null = null;
let hasLoggedWarning = false;

export const resend = new Proxy({ emails: {} } as Resend, {
  get(_, prop) {
    const { RESEND_TOKEN } = keys();

    // Return no-op functions if token is missing
    if (!RESEND_TOKEN) {
      if (!hasLoggedWarning) {
        console.warn('Resend email service is disabled: Missing RESEND_TOKEN');
        hasLoggedWarning = true;
      }

      if (typeof prop === 'string' && ['emails', 'send'].includes(prop)) {
        return {
          create: () => Promise.resolve({ data: { id: 'mock-email-id' }, error: null }),
          send: () => Promise.resolve({ data: { id: 'mock-email-id' }, error: null }),
        };
      }
      return undefined;
    }

    // Initialize Resend instance on first use
    if (!resendInstance) {
      resendInstance = new Resend(RESEND_TOKEN);
    }

    return resendInstance[prop as keyof Resend];
  },
});

// Email sending functions
export const sendMagicLinkEmail = async (data: {
  email: string;
  magicLink: string;
  name?: string | null;
  expiresIn?: string;
}) => {
  const { RESEND_FROM } = keys();

  try {
    const html = render(
      MagicLinkTemplate({
        name: data.name,
        email: data.email,
        expiresIn: data.expiresIn || '20 minutes',
        magicLink: data.magicLink,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: 'Your magic link to sign in',
      to: data.email,
    });

    return result;
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    throw new Error('Failed to send magic link email');
  }
};

export const sendVerificationEmail = async (data: {
  email: string;
  verificationLink: string;
  name?: string | null;
}) => {
  const { RESEND_FROM } = keys();

  try {
    const html = render(
      VerificationTemplate({
        name: data.name,
        email: data.email,
        verificationLink: data.verificationLink,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: 'Verify your email address',
      to: data.email,
    });

    return result;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (data: {
  email: string;
  resetLink: string;
  name?: string | null;
}) => {
  const { RESEND_FROM } = keys();

  try {
    const html = render(
      PasswordResetTemplate({
        name: data.name,
        email: data.email,
        resetLink: data.resetLink,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: 'Reset your password',
      to: data.email,
    });

    return result;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

export const sendContactEmail = async (data: {
  email: string;
  name: string;
  message: string;
  to?: string;
}) => {
  const { RESEND_FROM } = keys();

  try {
    const html = render(
      ContactTemplate({
        name: data.name,
        email: data.email,
        message: data.message,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: `New contact form submission from ${data.name}`,
      to: data.to || 'contact@example.com',
    });

    return result;
  } catch (error) {
    console.error('Failed to send contact email:', error);
    throw new Error('Failed to send contact email');
  }
};

export const sendOrganizationInvitationEmail = async (data: {
  email: string;
  inviteLink: string;
  organizationName: string;
  inviterName?: string | null;
  inviterEmail: string;
  expiresIn?: string;
}) => {
  const { RESEND_FROM } = keys();

  try {
    const html = render(
      OrganizationInvitationTemplate({
        email: data.email,
        expiresIn: data.expiresIn || '48 hours',
        inviteLink: data.inviteLink,
        inviterEmail: data.inviterEmail,
        inviterName: data.inviterName,
        organizationName: data.organizationName,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: `Invitation to join ${data.organizationName}`,
      to: data.email,
    });

    return result;
  } catch (error) {
    console.error('Failed to send organization invitation email:', error);
    throw new Error('Failed to send organization invitation email');
  }
};

export const sendWelcomeEmail = async (data: {
  email: string;
  name: string;
  organizationName: string;
  dashboardUrl?: string;
}) => {
  const { RESEND_FROM } = keys();

  try {
    const html = render(
      WelcomeTemplate({
        name: data.name,
        dashboardUrl: data.dashboardUrl,
        email: data.email,
        organizationName: data.organizationName,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: `Welcome to ${data.organizationName}!`,
      to: data.email,
    });

    return result;
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
  dashboardUrl?: string;
}) => {
  const { RESEND_FROM } = keys();

  try {
    const html = render(
      ApiKeyCreatedTemplate({
        name: data.name,
        apiKeyId: data.apiKeyId,
        apiKeyName: data.apiKeyName,
        dashboardUrl: data.dashboardUrl,
        email: data.email,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: `API Key "${data.apiKeyName}" Created`,
      to: data.email,
    });

    return result;
  } catch (error) {
    console.error('Failed to send API key created email:', error);
    throw new Error('Failed to send API key created email');
  }
};

// Export templates for testing/development
export {
  ApiKeyCreatedTemplate,
  ContactTemplate,
  MagicLinkTemplate,
  OrganizationInvitationTemplate,
  PasswordResetTemplate,
  VerificationTemplate,
  WelcomeTemplate,
};
