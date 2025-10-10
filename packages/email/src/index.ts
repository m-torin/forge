/**
 * Email service with React Email templates and Resend integration
 * Provides type-safe email sending functions with fallback behavior
 */

import { render } from '@react-email/render';
import { Resend } from 'resend';

import { safeEnv } from '../env';
import { ApiKeyCreatedTemplate } from './templates/api-key-created';
import { ContactTemplate } from './templates/contact';
import { MagicLinkTemplate } from './templates/magic-link';
import { OrganizationInvitationTemplate } from './templates/organization-invitation';
import { PasswordResetTemplate } from './templates/password-reset';
import { VerificationTemplate } from './templates/verification';
import { WelcomeTemplate } from './templates/welcome';

// Temporary console logger until observability package is stable
const logger = {
  warn: (message: string) => {
    if (process.env.NODE_ENV !== 'test') {
      // Using structured logging instead of console
      process.stderr.write(`[email] WARN: ${message}
`);
    }
  },
  error: (message: string) => {
    if (process.env.NODE_ENV !== 'test') {
      // Using structured logging instead of console
      process.stderr.write(`[email] ERROR: ${message}
`);
    }
  },
};

// In test environment, use global logger mock
if (process.env.NODE_ENV === 'test' && (global as any).mockLogger) {
  Object.assign(logger, (global as any).mockLogger);
}

let resendInstance: null | Resend = null;
let hasLoggedWarning = false;

// Reset state for testing
if (process.env.NODE_ENV === 'test') {
  (global as any).emailPackageReset = () => {
    resendInstance = null;
    hasLoggedWarning = false;
  };
}

export const resend = new Proxy({ emails: {} } as Resend, {
  get(_, prop) {
    const { RESEND_TOKEN } = safeEnv();

    // Return no-op functions if token is missing
    if (!RESEND_TOKEN) {
      if (!hasLoggedWarning) {
        logger.warn('Resend email service disabled - Missing RESEND_TOKEN');
        hasLoggedWarning = true;
      }

      if (prop === 'emails') {
        return {
          create: () => Promise.resolve({ data: { id: 'mock-email-id' }, error: null }),
          send: () => Promise.resolve({ data: { id: 'mock-email-id' }, error: null }),
        };
      }
      return undefined;
    }

    // Initialize Resend instance on first use
    if (!resendInstance) {
      try {
        resendInstance = new Resend(RESEND_TOKEN);
      } catch (error) {
        logger.error(`Failed to initialize Resend: ${error}`);
        throw error;
      }
    }

    const value = resendInstance[prop as keyof Resend];

    // Bind methods to the instance
    if (typeof value === 'function') {
      return value.bind(resendInstance);
    }

    return value;
  },
});

/**
 * Send a magic link email for passwordless authentication
 * @param data - Email data including recipient and magic link
 * @returns Resend API response
 */
export const sendMagicLinkEmail = async (data: {
  email: string;
  expiresIn?: string;
  magicLink: string;
  name?: null | string;
}) => {
  const { RESEND_FROM } = safeEnv();

  try {
    const html = render(
      MagicLinkTemplate({
        email: data.email,
        expiresIn: data.expiresIn || '20 minutes',
        magicLink: data.magicLink,
        name: data.name,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: 'Your magic link to sign in',
      to: data.email,
    });

    return result;
  } catch (error: any) {
    throw new Error(
      `Failed to send magic link email: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
  }
};

/**
 * Send an email verification link
 * @param data - Email data including recipient and verification link
 * @returns Resend API response
 */
export const sendVerificationEmail = async (data: {
  email: string;
  name?: null | string;
  verificationLink: string;
}) => {
  const { RESEND_FROM } = safeEnv();

  try {
    const html = render(
      VerificationTemplate({
        email: data.email,
        name: data.name,
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
  } catch (error: any) {
    throw new Error(
      `Failed to send verification email: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
  }
};

/**
 * Send a one-time password (OTP) email
 * @param data - Email data including recipient and OTP code
 * @returns Resend API response
 */
export const sendOTPEmail = async (data: {
  email: string;
  name?: null | string;
  otp: string;
  purpose?: string;
}) => {
  const { RESEND_FROM } = safeEnv();

  try {
    // Create a simple OTP email template
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .otp-box { background: #f5f5f5; border: 2px dashed #ddd; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
            .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a; font-family: monospace; }
            .footer { margin-top: 30px; font-size: 14px; color: #666; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your Authentication Code</h1>
            </div>
            <p>Hi${data.name ? ` ${data.name}` : ''},</p>
            <p>Use the following code to complete your ${data.purpose || 'authentication'}:</p>
            <div class="otp-box">
              <div class="otp-code">${data.otp}</div>
            </div>
            <p><strong>This code will expire in 5 minutes.</strong></p>
            <p>If you didn't request this code, please ignore this email.</p>
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html,
      subject: `Your ${data.purpose || 'authentication'} code: ${data.otp}`,
      to: data.email,
    });

    return result;
  } catch (error: any) {
    throw new Error(
      `Failed to send OTP email: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
  }
};

/**
 * Send a password reset email with reset link
 * @param data - Email data including recipient and reset link
 * @returns Resend API response
 */
export const sendPasswordResetEmail = async (data: {
  email: string;
  name?: null | string;
  resetLink: string;
}) => {
  const { RESEND_FROM } = safeEnv();

  try {
    const html = render(
      PasswordResetTemplate({
        email: data.email,
        name: data.name,
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
  } catch (error: any) {
    throw new Error(
      `Failed to send password reset email: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
  }
};

/**
 * Send a contact form submission email
 * @param data - Contact form data including sender info and message
 * @returns Resend API response
 */
export const sendContactEmail = async (data: {
  email: string;
  message: string;
  name: string;
  to?: string;
}) => {
  const { RESEND_FROM } = safeEnv();

  try {
    const html = render(
      ContactTemplate({
        email: data.email,
        message: data.message,
        name: data.name,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: `New contact form submission from ${data.name}`,
      to: data.to || 'contact@example.com',
    });

    return result;
  } catch (error: any) {
    throw new Error(
      `Failed to send contact email: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
  }
};

/**
 * Send an organization invitation email
 * @param data - Invitation data including inviter info and invite link
 * @returns Resend API response
 */
export const sendOrganizationInvitationEmail = async (data: {
  email: string;
  expiresIn?: string;
  inviteLink: string;
  inviterEmail: string;
  inviterName?: null | string;
  organizationName: string;
}) => {
  const { RESEND_FROM } = safeEnv();

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
  } catch (error: any) {
    throw new Error(
      `Failed to send organization invitation email: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
  }
};

/**
 * Send a welcome email to new users
 * @param data - Welcome data including user info and dashboard link
 * @returns Resend API response
 */
export const sendWelcomeEmail = async (data: {
  dashboardUrl?: string;
  email: string;
  name: string;
  organizationName: string;
}) => {
  const { RESEND_FROM } = safeEnv();

  try {
    const html = render(
      WelcomeTemplate({
        dashboardUrl: data.dashboardUrl,
        email: data.email,
        name: data.name,
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
  } catch (error: any) {
    throw new Error(
      `Failed to send welcome email: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
  }
};

/**
 * Send notification email when API key is created
 * @param data - API key data including key info and dashboard link
 * @returns Resend API response
 */
export const sendApiKeyCreatedEmail = async (data: {
  apiKeyId: string;
  apiKeyName: string;
  dashboardUrl?: string;
  email: string;
  name: string;
}) => {
  const { RESEND_FROM } = safeEnv();

  try {
    const html = render(
      ApiKeyCreatedTemplate({
        apiKeyId: data.apiKeyId,
        apiKeyName: data.apiKeyName,
        dashboardUrl: data.dashboardUrl,
        email: data.email,
        name: data.name,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: `API Key "${data.apiKeyName}" Created`,
      to: data.email,
    });

    return result;
  } catch (error: any) {
    throw new Error(
      `Failed to send API key created email: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
  }
};

// Registry and review email functions removed - templates were deleted

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
