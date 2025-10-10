/**
 * SMS Service for Phone Number Authentication
 * Supports multiple SMS providers (Twilio, AWS SNS, etc.)
 */

import { logError, logInfo } from '@repo/observability';
import 'server-only';

import { safeEnv } from '../../env';

const env = safeEnv();

export interface SMSOptions {
  phoneNumber: string;
  message: string;
}

/**
 * Sends an SMS using the configured provider
 */
export async function sendSMS({ phoneNumber, message }: SMSOptions): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Development mode - just log the message
    if (process.env.NODE_ENV === 'development') {
      logInfo(`📱 SMS to ${phoneNumber}: ${message} (development mode)`);
      return { success: true };
    }

    // Try Twilio first if configured
    if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER) {
      return await sendWithTwilio({ phoneNumber, message });
    }

    // Try AWS SNS if configured
    if (env.AWS_SNS_ACCESS_KEY_ID && env.AWS_SNS_SECRET_ACCESS_KEY && env.AWS_SNS_REGION) {
      return await sendWithAWSSNS({ phoneNumber, message });
    }

    // No SMS provider configured
    logError('No SMS provider configured', new Error('SMS_PROVIDER_NOT_CONFIGURED'));
    return {
      success: false,
      error: 'SMS provider not configured. Please set up Twilio or AWS SNS credentials.',
    };
  } catch (error) {
    logError('SMS sending failed', error instanceof Error ? error : new Error(String(error)));
    return {
      success: false,
      error: 'Failed to send SMS',
    };
  }
}

/**
 * Sends SMS using Twilio
 */
async function sendWithTwilio({ phoneNumber, message: _message }: SMSOptions): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Note: You'll need to install the Twilio SDK
    // npm install twilio
    //
    // For now, this is a placeholder implementation
    // Uncomment and configure when Twilio SDK is installed:
    //
    // const twilio = require('twilio');
    // const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    //
    // await client.messages.create({
    //   body: message,
    //   from: env.TWILIO_PHONE_NUMBER,
    //   to: phoneNumber,
    // });

    logInfo(`SMS would be sent via Twilio to ${phoneNumber}`);

    // TODO: Replace with actual Twilio implementation
    return {
      success: true,
    };
  } catch (error) {
    logError('Twilio SMS failed', error instanceof Error ? error : new Error(String(error)));
    return {
      success: false,
      error: 'Twilio SMS sending failed',
    };
  }
}

/**
 * Sends SMS using AWS SNS
 */
async function sendWithAWSSNS({ phoneNumber, message: _message }: SMSOptions): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Note: You'll need to install the AWS SDK
    // npm install @aws-sdk/client-sns
    //
    // For now, this is a placeholder implementation
    // Uncomment and configure when AWS SDK is installed:
    //
    // import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
    //
    // const snsClient = new SNSClient({
    //   region: env.AWS_SNS_REGION,
    //   credentials: {
    //     accessKeyId: env.AWS_SNS_ACCESS_KEY_ID!,
    //     secretAccessKey: env.AWS_SNS_SECRET_ACCESS_KEY!,
    //   },
    // });
    //
    // const command = new PublishCommand({
    //   PhoneNumber: phoneNumber,
    //   Message: message,
    // });
    //
    // await snsClient.send(command);

    logInfo(`SMS would be sent via AWS SNS to ${phoneNumber}`);

    // TODO: Replace with actual AWS SNS implementation
    return {
      success: true,
    };
  } catch (error) {
    logError('AWS SNS SMS failed', error instanceof Error ? error : new Error(String(error)));
    return {
      success: false,
      error: 'AWS SNS SMS sending failed',
    };
  }
}

/**
 * Validates a phone number format
 */
export function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic E.164 format validation (international format)
  const phoneRegex = /^\+[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
}

/**
 * Formats a phone number to E.164 format
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');

  // If it starts with 1 and has 11 digits, it's likely a US number
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  // If it has 10 digits, assume it's a US number without country code
  if (digits.length === 10) {
    return `+1${digits}`;
  }

  // If it doesn't start with +, add it
  if (!phoneNumber.startsWith('+')) {
    return `+${digits}`;
  }

  return phoneNumber;
}
