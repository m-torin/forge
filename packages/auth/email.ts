import 'server-only';

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

    // In a real application, you would send an email here
    // For now, we'll log the invitation details
    console.log('Sending organization invitation email:', {
      from: data.inviter.user.email,
      inviteLink: inviteLink,
      subject: `Invitation to join ${data.organization.name}`,
      to: data.email,
    });

    // Example email content structure
    const emailContent = `
      <h2>You've been invited to join ${data.organization.name}</h2>
      <p>${data.inviter.user.name || 'Someone'} (${data.inviter.user.email}) has invited you to join their organization.</p>
      <p>Click the link below to accept the invitation:</p>
      <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">
        Accept Invitation
      </a>
      <p>This invitation will expire in 48 hours.</p>
    `;

    // TODO: Integrate with actual email service
    // await resend.send({
    //   to: data.email,
    //   subject: `Invitation to join ${data.organization.name}`,
    //   html: emailContent,
    // });
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
    console.log('Sending welcome email:', {
      subject: `Welcome to ${data.organizationName}`,
      to: data.email,
    });

    // TODO: Implement actual email sending
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
    console.log('Sending API key created notification:', {
      subject: `API Key "${data.apiKeyName}" Created`,
      to: data.email,
    });

    // Example email content structure
    const emailContent = `
      <h2>API Key Created</h2>
      <p>Hi ${data.name},</p>
      <p>An API key "${data.apiKeyName}" has been created for your account.</p>
      <p>Key ID: ${data.apiKeyId}</p>
      <p>If you didn't create this API key, please contact support immediately.</p>
      <p>For security reasons, we don't send the actual API key via email.</p>
    `;

    // TODO: Integrate with actual email service
    // await resend.send({
    //   to: data.email,
    //   subject: `API Key "${data.apiKeyName}" Created`,
    //   html: emailContent,
    // });
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
    console.log('Sending verification email:', {
      subject: 'Verify your email address',
      to: data.user.email,
      verificationLink: data.url,
    });

    const emailContent = `
      <h2>Verify Your Email Address</h2>
      <p>Hi ${data.user.name || 'there'},</p>
      <p>Please click the link below to verify your email address:</p>
      <a href="${data.url}" style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <p>This link will expire in 24 hours.</p>
    `;

    // TODO: Integrate with actual email service
    // await resend.send({
    //   to: data.user.email,
    //   subject: 'Verify your email address',
    //   html: emailContent,
    // });
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
    console.log('Sending password reset email:', {
      resetLink: data.url,
      subject: 'Reset your password',
      to: data.user.email,
    });

    const emailContent = `
      <h2>Reset Your Password</h2>
      <p>Hi ${data.user.name || 'there'},</p>
      <p>You requested to reset your password. Click the link below to create a new password:</p>
      <a href="${data.url}" style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;

    // TODO: Integrate with actual email service
    // await resend.send({
    //   to: data.user.email,
    //   subject: 'Reset your password',
    //   html: emailContent,
    // });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};
