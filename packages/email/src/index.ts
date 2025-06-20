import { render } from '@react-email/render';
import { Resend } from 'resend';

import { keys } from '../keys';
import { ApiKeyCreatedTemplate } from './templates/api-key-created';
import { ContactTemplate } from './templates/contact';
import { MagicLinkTemplate } from './templates/magic-link';
import { OrganizationInvitationTemplate } from './templates/organization-invitation';
import { PasswordResetTemplate } from './templates/password-reset';
import { VerificationTemplate } from './templates/verification';
import { WelcomeTemplate } from './templates/welcome';
import { RegistryCreatedTemplate } from './templates/registry-created';
import { RegistryInvitationTemplate } from './templates/registry-invitation';
import { RegistryPurchaseTemplate } from './templates/registry-purchase';
import { RegistryThankYouTemplate } from './templates/registry-thank-you';
import { RegistryPurchaseConfirmationTemplate } from './templates/registry-purchase-confirmation';
import { RegistryItemAddedTemplate } from './templates/registry-item-added';

// Temporary console logger until observability package is stable
const logger = {
  warn: (message: string) => {
    if (process.env.NODE_ENV !== 'test') {
      // Using structured logging instead of console
      process.stderr.write(`[email] WARN: ${message}\n`);
    }
  },
  error: (message: string) => {
    if (process.env.NODE_ENV !== 'test') {
      // Using structured logging instead of console
      process.stderr.write(`[email] ERROR: ${message}\n`);
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
    const { RESEND_TOKEN } = keys();

    // Return no-op functions if token is missing
    if (!RESEND_TOKEN) {
      if (!hasLoggedWarning) {
        logger.warn('Resend email service is disabled: Missing RESEND_TOKEN');
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

// Email sending functions
export const sendMagicLinkEmail = async (data: {
  email: string;
  expiresIn?: string;
  magicLink: string;
  name?: null | string;
}) => {
  const { RESEND_FROM } = keys();

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

export const sendVerificationEmail = async (data: {
  email: string;
  name?: null | string;
  verificationLink: string;
}) => {
  const { RESEND_FROM } = keys();

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

export const sendPasswordResetEmail = async (data: {
  email: string;
  name?: null | string;
  resetLink: string;
}) => {
  const { RESEND_FROM } = keys();

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

export const sendContactEmail = async (data: {
  email: string;
  message: string;
  name: string;
  to?: string;
}) => {
  const { RESEND_FROM } = keys();

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

export const sendOrganizationInvitationEmail = async (data: {
  email: string;
  expiresIn?: string;
  inviteLink: string;
  inviterEmail: string;
  inviterName?: null | string;
  organizationName: string;
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
  } catch (error: any) {
    throw new Error(
      `Failed to send organization invitation email: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
  }
};

export const sendWelcomeEmail = async (data: {
  dashboardUrl?: string;
  email: string;
  name: string;
  organizationName: string;
}) => {
  const { RESEND_FROM } = keys();

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

export const sendApiKeyCreatedEmail = async (data: {
  apiKeyId: string;
  apiKeyName: string;
  dashboardUrl?: string;
  email: string;
  name: string;
}) => {
  const { RESEND_FROM } = keys();

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

// Registry email sending functions
export const sendRegistryCreatedEmail = async (data: {
  email: string;
  name: string;
  registryTitle: string;
  registryType: string;
  registryUrl: string;
  eventDate?: string;
}) => {
  const { RESEND_FROM } = keys();

  try {
    const html = render(
      RegistryCreatedTemplate({
        email: data.email,
        name: data.name,
        registryTitle: data.registryTitle,
        registryType: data.registryType,
        registryUrl: data.registryUrl,
        eventDate: data.eventDate,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: `Your ${data.registryType} registry has been created!`,
      to: data.email,
    });

    return result;
  } catch (error: any) {
    throw new Error(
      `Failed to send registry created email: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
  }
};

export const sendRegistryInvitationEmail = async (data: {
  email: string;
  inviterName: string;
  inviterEmail: string;
  registryTitle: string;
  registryType: string;
  registryUrl: string;
  role: 'VIEWER' | 'EDITOR';
  message?: string;
  eventDate?: string;
}) => {
  const { RESEND_FROM } = keys();

  try {
    const html = render(
      RegistryInvitationTemplate({
        email: data.email,
        inviterName: data.inviterName,
        inviterEmail: data.inviterEmail,
        registryTitle: data.registryTitle,
        registryType: data.registryType,
        registryUrl: data.registryUrl,
        role: data.role,
        message: data.message,
        eventDate: data.eventDate,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: `${data.inviterName} invited you to view their registry`,
      to: data.email,
    });

    return result;
  } catch (error: any) {
    throw new Error(
      `Failed to send registry invitation email: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
  }
};

export const sendRegistryPurchaseEmail = async (data: {
  email: string;
  ownerName: string;
  purchaserName: string;
  purchaserEmail: string;
  registryTitle: string;
  itemName: string;
  quantity: number;
  giftMessage?: string;
  registryUrl: string;
}) => {
  const { RESEND_FROM } = keys();

  try {
    const html = render(
      RegistryPurchaseTemplate({
        email: data.email,
        ownerName: data.ownerName,
        purchaserName: data.purchaserName,
        purchaserEmail: data.purchaserEmail,
        registryTitle: data.registryTitle,
        itemName: data.itemName,
        quantity: data.quantity,
        giftMessage: data.giftMessage,
        registryUrl: data.registryUrl,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: `${data.purchaserName} purchased from your registry!`,
      to: data.email,
    });

    return result;
  } catch (error: any) {
    throw new Error(
      `Failed to send registry purchase email: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
  }
};

export const sendRegistryThankYouEmail = async (data: {
  email: string;
  recipientName: string;
  senderName: string;
  registryTitle: string;
  itemName: string;
  message: string;
}) => {
  const { RESEND_FROM } = keys();

  try {
    const html = render(
      RegistryThankYouTemplate({
        email: data.email,
        recipientName: data.recipientName,
        senderName: data.senderName,
        registryTitle: data.registryTitle,
        itemName: data.itemName,
        message: data.message,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: `Thank you from ${data.senderName}`,
      to: data.email,
    });

    return result;
  } catch (error: any) {
    throw new Error(
      `Failed to send registry thank you email: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
  }
};

export const sendRegistryPurchaseConfirmationEmail = async (data: {
  email: string;
  purchaserName: string;
  registryOwnerName: string;
  registryTitle: string;
  itemName: string;
  quantity: number;
  orderNumber?: string;
  registryUrl: string;
  isGift: boolean;
  giftWrapped?: boolean;
}) => {
  const { RESEND_FROM } = keys();

  try {
    const html = render(
      RegistryPurchaseConfirmationTemplate({
        email: data.email,
        purchaserName: data.purchaserName,
        registryOwnerName: data.registryOwnerName,
        registryTitle: data.registryTitle,
        itemName: data.itemName,
        quantity: data.quantity,
        orderNumber: data.orderNumber,
        registryUrl: data.registryUrl,
        isGift: data.isGift,
        giftWrapped: data.giftWrapped,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: 'Your registry purchase has been recorded',
      to: data.email,
    });

    return result;
  } catch (error: any) {
    throw new Error(
      `Failed to send registry purchase confirmation email: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
  }
};

export const sendRegistryItemAddedEmail = async (data: {
  email: string;
  recipientName: string;
  adderName: string;
  registryTitle: string;
  itemName: string;
  itemQuantity: number;
  itemPriority: number;
  itemNotes?: string;
  registryUrl: string;
}) => {
  const { RESEND_FROM } = keys();

  try {
    const html = render(
      RegistryItemAddedTemplate({
        email: data.email,
        recipientName: data.recipientName,
        adderName: data.adderName,
        registryTitle: data.registryTitle,
        itemName: data.itemName,
        itemQuantity: data.itemQuantity,
        itemPriority: data.itemPriority,
        itemNotes: data.itemNotes,
        registryUrl: data.registryUrl,
      }),
    );

    const result = await resend.emails.send({
      from: RESEND_FROM || 'noreply@example.com',
      html: await html,
      subject: `New item added to ${data.registryTitle}`,
      to: data.email,
    });

    return result;
  } catch (error: any) {
    throw new Error(
      `Failed to send registry item added email: ${error instanceof Error ? (error as Error)?.message || 'Unknown error' : 'Unknown error'}`,
    );
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
  RegistryCreatedTemplate,
  RegistryInvitationTemplate,
  RegistryPurchaseTemplate,
  RegistryThankYouTemplate,
  RegistryPurchaseConfirmationTemplate,
  RegistryItemAddedTemplate,
};
