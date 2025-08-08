/**
 * Tailwind v4 Enhanced Auth Components Server Actions
 * Comprehensive server actions for all enhanced RSC components
 */

'use server';

import { logError } from '@repo/observability';
import type { FormState } from '../types';

// =============================================================================
// EMAIL CHANGE VERIFICATION ACTIONS
// =============================================================================

export async function initiateEmailChangeAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  try {
    const newEmail = formData.get('newEmail') as string;
    const password = formData.get('password') as string;

    // Validation
    const errors: Record<string, string[]> = {};

    if (!newEmail) errors.newEmail = ['New email is required'];
    if (!password) errors.password = ['Current password is required'];

    if (!newEmail.includes('@')) {
      errors.newEmail = ['Please enter a valid email address'];
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    // Import Better Auth server action
    const { initiateEmailChangeAction: authInitiateEmailChange } = await import(
      '@repo/auth/server-actions'
    );

    // Create FormData for the auth action
    const authFormData = new FormData();
    authFormData.set('newEmail', newEmail);
    authFormData.set('currentPassword', password);

    const result = await authInitiateEmailChange({}, authFormData);

    if (result.success) {
      return {
        success: true,
        message: 'Verification email sent! Please check your new email address.',
      };
    } else {
      return {
        success: false,
        error:
          result.error ||
          'Failed to initiate email change. Please check your password and try again.',
      };
    }
  } catch (error: any) {
    logError('Email change initiation error:', { error });

    if (error?.message?.includes('already exists')) {
      return {
        success: false,
        error: 'This email address is already in use by another account.',
      };
    }

    if (error?.message?.includes('password')) {
      return {
        success: false,
        error: 'Current password is incorrect.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while initiating email change. Please try again.',
    };
  }
}

export async function confirmEmailChangeAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  try {
    const token = formData.get('token') as string;

    if (!token) {
      return {
        success: false,
        errors: { token: ['Verification token is required'] },
      };
    }

    // Import Better Auth server action
    const { confirmEmailChangeAction: authConfirmEmailChange } = await import(
      '@repo/auth/server-actions'
    );

    // Create FormData for the auth action
    const authFormData = new FormData();
    authFormData.set('token', token);

    const result = await authConfirmEmailChange({}, authFormData);

    if (result.success) {
      return {
        success: true,
        message: 'Email address changed successfully!',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Invalid or expired verification token.',
      };
    }
  } catch (error: any) {
    logError('Email change confirmation error:', { error });

    if (error?.message?.includes('expired')) {
      return {
        success: false,
        error: 'Verification token has expired. Please request a new email change.',
      };
    }

    return {
      success: false,
      error: 'An error occurred during verification. Please try again.',
    };
  }
}

export async function cancelEmailChangeAction(
  _prevState: any,
  _formData: FormData,
): Promise<FormState> {
  try {
    // Import Better Auth server action
    const { cancelEmailChangeAction: authCancelEmailChange } = await import(
      '@repo/auth/server-actions'
    );

    const result = await authCancelEmailChange({}, new FormData());

    if (result.success) {
      return {
        success: true,
        message: 'Email change request cancelled successfully.',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to cancel email change request.',
      };
    }
  } catch (error) {
    logError('Email change cancellation error:', { error });
    return {
      success: false,
      error: 'An error occurred while cancelling the email change request.',
    };
  }
}

// =============================================================================
// DEVICE MANAGEMENT ACTIONS
// =============================================================================

export async function revokeDeviceAction(prevState: any, formData: FormData): Promise<FormState> {
  try {
    const deviceId = formData.get('deviceId') as string;

    if (!deviceId) {
      return {
        success: false,
        errors: { deviceId: ['Device ID is required'] },
      };
    }

    // Import Better Auth server action
    const { revokeDeviceAction: authRevokeDevice } = await import('@repo/auth/server-actions');

    // Create FormData for the auth action
    const authFormData = new FormData();
    authFormData.set('deviceId', deviceId);

    const result = await authRevokeDevice({}, authFormData);

    if (result.success) {
      return {
        success: true,
        message:
          'Device access revoked successfully. All sessions on this device have been terminated.',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to revoke device access.',
      };
    }
  } catch (error) {
    logError('Device revocation error:', { error });
    return {
      success: false,
      error: 'An error occurred while revoking device access. Please try again.',
    };
  }
}

export async function updateDeviceTrustAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  try {
    const deviceId = formData.get('deviceId') as string;
    const trusted = formData.get('trusted') === 'true';

    if (!deviceId) {
      return {
        success: false,
        errors: { deviceId: ['Device ID is required'] },
      };
    }

    // Import Better Auth server action
    const { updateDeviceTrustAction: authUpdateDeviceTrust } = await import(
      '@repo/auth/server-actions'
    );

    // Create FormData for the auth action
    const authFormData = new FormData();
    authFormData.set('deviceId', deviceId);
    authFormData.set('trusted', trusted.toString());

    const result = await authUpdateDeviceTrust({}, authFormData);

    if (result.success) {
      return {
        success: true,
        message: `Device ${trusted ? 'marked as trusted' : 'removed from trusted devices'}.`,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to update device trust status.',
      };
    }
  } catch (error) {
    logError('Device trust update error:', { error });
    return {
      success: false,
      error: 'An error occurred while updating device trust. Please try again.',
    };
  }
}

export async function revokeAllDevicesAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  try {
    const currentDeviceId = formData.get('currentDeviceId') as string;

    if (!currentDeviceId) {
      return {
        success: false,
        error: 'Current device ID is required',
      };
    }

    // Import Better Auth server action
    const { revokeAllDevicesAction: authRevokeAllDevices } = await import(
      '@repo/auth/server-actions'
    );

    // Create FormData for the auth action
    const authFormData = new FormData();
    authFormData.set('exceptDeviceId', currentDeviceId);

    const result = await authRevokeAllDevices({}, authFormData);

    if (result.success) {
      return {
        success: true,
        message: 'All other devices have been signed out successfully.',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to revoke access from other devices.',
      };
    }
  } catch (error) {
    logError('Revoke all devices error:', { error });
    return {
      success: false,
      error: 'An error occurred while revoking device access. Please try again.',
    };
  }
}

// =============================================================================
// BACKUP CODES MANAGER ACTIONS
// =============================================================================

export async function generateBackupCodesAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  try {
    const confirmRegenerate = formData.get('confirmRegenerate') === 'on';

    if (!confirmRegenerate) {
      return {
        success: false,
        error:
          'Please confirm that you understand regenerating codes will invalidate existing ones.',
      };
    }

    // Import Better Auth server action
    const { generateBackupCodesAction: authGenerateBackupCodes } = await import(
      '@repo/auth/server-actions'
    );

    const result = await authGenerateBackupCodes({}, new FormData());

    if (result.success && result.data) {
      return {
        success: true,
        message: 'New backup codes generated successfully. Save them in a secure location!',
        data: result.data.backupCodes,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to generate backup codes.',
      };
    }
  } catch (error) {
    logError('Backup codes generation error:', { error });
    return {
      success: false,
      error: 'An error occurred while generating backup codes. Please try again.',
    };
  }
}

export async function downloadBackupCodesAction(
  _prevState: any,
  _formData: FormData,
): Promise<FormState> {
  try {
    // Import Better Auth server action
    const { getBackupCodesAction } = await import('@repo/auth/server-actions');

    const result = await getBackupCodesAction({}, new FormData());

    if (result.success && result.data) {
      // In a real implementation, this would trigger a file download
      // For now, we'll return success to indicate the action completed
      return {
        success: true,
        message: 'Backup codes downloaded successfully.',
        data: result.data.backupCodes,
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to download backup codes.',
      };
    }
  } catch (error) {
    logError('Backup codes download error:', { error });
    return {
      success: false,
      error: 'An error occurred while downloading backup codes. Please try again.',
    };
  }
}

export async function revokeBackupCodesAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  try {
    const confirmRevoke = formData.get('confirmRevoke') === 'on';

    if (!confirmRevoke) {
      return {
        success: false,
        error: 'Please confirm that you want to revoke all backup codes.',
      };
    }

    // Import Better Auth server action
    const { revokeBackupCodesAction: authRevokeBackupCodes } = await import(
      '@repo/auth/server-actions'
    );

    const result = await authRevokeBackupCodes({}, new FormData());

    if (result.success) {
      return {
        success: true,
        message: 'All backup codes have been revoked successfully.',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to revoke backup codes.',
      };
    }
  } catch (error) {
    logError('Backup codes revocation error:', { error });
    return {
      success: false,
      error: 'An error occurred while revoking backup codes. Please try again.',
    };
  }
}

// =============================================================================
// ACCOUNT DELETION FLOW ACTIONS
// =============================================================================

export async function initiateAccountDeletionAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  try {
    const password = formData.get('password') as string;
    const confirmEmail = formData.get('confirmEmail') as string;
    const confirmText = formData.get('confirmText') as string;
    const reason = formData.get('reason') as string;

    // Validation
    const errors: Record<string, string[]> = {};

    if (!password) errors.password = ['Current password is required'];
    if (!confirmEmail) errors.confirmEmail = ['Email confirmation is required'];
    if (!confirmText) errors.confirmText = ['Confirmation text is required'];
    if (confirmText !== 'DELETE MY ACCOUNT') {
      errors.confirmText = ['Please type "DELETE MY ACCOUNT" exactly'];
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    // Import Better Auth server action
    const { initiateAccountDeletionAction: authInitiateAccountDeletion } = await import(
      '@repo/auth/server-actions'
    );

    // Create FormData for the auth action
    const authFormData = new FormData();
    authFormData.set('password', password);
    authFormData.set('confirmEmail', confirmEmail);
    authFormData.set('reason', reason || 'No reason provided');

    const result = await authInitiateAccountDeletion({}, authFormData);

    if (result.success) {
      return {
        success: true,
        message: 'Account deletion initiated. You will receive a confirmation email shortly.',
      };
    } else {
      return {
        success: false,
        error:
          result.error ||
          'Failed to initiate account deletion. Please check your password and try again.',
      };
    }
  } catch (error: any) {
    logError('Account deletion initiation error:', { error });

    if (error?.message?.includes('password')) {
      return {
        success: false,
        error: 'Incorrect password. Please try again.',
      };
    }

    if (error?.message?.includes('active subscriptions')) {
      return {
        success: false,
        error: 'Please cancel all active subscriptions before deleting your account.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while initiating account deletion. Please try again.',
    };
  }
}

export async function confirmAccountDeletionAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  try {
    const token = formData.get('token') as string;
    const finalConfirmation = formData.get('finalConfirmation') === 'on';

    if (!token) {
      return {
        success: false,
        errors: { token: ['Deletion token is required'] },
      };
    }

    if (!finalConfirmation) {
      return {
        success: false,
        error: 'Please confirm that you understand this action is irreversible.',
      };
    }

    // Import Better Auth server action
    const { confirmAccountDeletionAction: authConfirmAccountDeletion } = await import(
      '@repo/auth/server-actions'
    );

    // Create FormData for the auth action
    const authFormData = new FormData();
    authFormData.set('token', token);

    const result = await authConfirmAccountDeletion({}, authFormData);

    if (result.success) {
      return {
        success: true,
        message: 'Your account has been permanently deleted.',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Invalid or expired deletion token.',
      };
    }
  } catch (error: any) {
    logError('Account deletion confirmation error:', { error });

    if (error?.message?.includes('expired')) {
      return {
        success: false,
        error: 'Deletion token has expired. Please restart the deletion process.',
      };
    }

    return {
      success: false,
      error: 'An error occurred during account deletion. Please try again.',
    };
  }
}

export async function cancelAccountDeletionAction(
  _prevState: any,
  _formData: FormData,
): Promise<FormState> {
  try {
    // Import Better Auth server action
    const { cancelAccountDeletionAction: authCancelAccountDeletion } = await import(
      '@repo/auth/server-actions'
    );

    const result = await authCancelAccountDeletion({}, new FormData());

    if (result.success) {
      return {
        success: true,
        message: 'Account deletion cancelled successfully.',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to cancel account deletion.',
      };
    }
  } catch (error) {
    logError('Account deletion cancellation error:', { error });
    return {
      success: false,
      error: 'An error occurred while cancelling account deletion.',
    };
  }
}

// =============================================================================
// DATA EXPORT REQUEST ACTIONS
// =============================================================================

export async function requestDataExportAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  try {
    const format = formData.get('format') as string;
    const categories = formData.getAll('categories') as string[];
    const includePersonalData = formData.get('includePersonalData') === 'on';
    const includeActivityData = formData.get('includeActivityData') === 'on';

    // Validation
    const errors: Record<string, string[]> = {};

    if (!format) errors.format = ['Export format is required'];
    if (categories.length === 0)
      errors.categories = ['At least one data category must be selected'];

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    // Import Better Auth server action
    const { requestDataExportAction: authRequestDataExport } = await import(
      '@repo/auth/server-actions'
    );

    // Create FormData for the auth action
    const authFormData = new FormData();
    authFormData.set('format', format);
    categories.forEach(category => authFormData.append('categories', category));
    authFormData.set('includePersonalData', includePersonalData.toString());
    authFormData.set('includeActivityData', includeActivityData.toString());

    const result = await authRequestDataExport({}, authFormData);

    if (result.success) {
      return {
        success: true,
        message:
          'Data export request submitted successfully. You will receive an email when your export is ready.',
        data: { exportId: 'pending-export-' + Date.now() }, // Mock export ID
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to submit data export request.',
      };
    }
  } catch (error: any) {
    logError('Data export request error:', { error });

    if (error?.message?.includes('limit')) {
      return {
        success: false,
        error:
          'You have reached the maximum number of concurrent export requests. Please wait for existing exports to complete.',
      };
    }

    if (error?.message?.includes('recent')) {
      return {
        success: false,
        error: 'You have recently requested an export. Please wait before requesting another.',
      };
    }

    return {
      success: false,
      error: 'An error occurred while requesting data export. Please try again.',
    };
  }
}

export async function cancelExportRequestAction(
  prevState: any,
  formData: FormData,
): Promise<FormState> {
  try {
    const exportId = formData.get('exportId') as string;

    if (!exportId) {
      return {
        success: false,
        errors: { exportId: ['Export ID is required'] },
      };
    }

    // Import Better Auth server action
    const { cancelExportRequestAction: authCancelExportRequest } = await import(
      '@repo/auth/server-actions'
    );

    // Create FormData for the auth action
    const authFormData = new FormData();
    authFormData.set('exportId', exportId);

    const result = await authCancelExportRequest({}, authFormData);

    if (result.success) {
      return {
        success: true,
        message: 'Export request cancelled successfully.',
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to cancel export request.',
      };
    }
  } catch (error) {
    logError('Export cancellation error:', { error });
    return {
      success: false,
      error: 'An error occurred while cancelling the export request.',
    };
  }
}

export async function downloadExportAction(prevState: any, formData: FormData): Promise<FormState> {
  try {
    const exportId = formData.get('exportId') as string;

    if (!exportId) {
      return {
        success: false,
        errors: { exportId: ['Export ID is required'] },
      };
    }

    // Import Better Auth server action
    const { getExportDownloadUrlAction } = await import('@repo/auth/server-actions');

    // Create FormData for the auth action
    const authFormData = new FormData();
    authFormData.set('exportId', exportId);

    const result = await getExportDownloadUrlAction({}, authFormData);

    if (result.success) {
      return {
        success: true,
        message: 'Download link generated successfully.',
        data: { downloadUrl: '/api/exports/download/' + exportId }, // Mock download URL
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to generate download link.',
      };
    }
  } catch (error) {
    logError('Export download error:', { error });
    return {
      success: false,
      error: 'An error occurred while generating download link.',
    };
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitizes user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Generates secure tokens
 */
export async function generateSecureToken(length: number = 32): Promise<string> {
  const crypto = await import('crypto');
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Rate limiting check
 */
export async function checkRateLimit(userId: string, action: string): Promise<boolean> {
  try {
    const { checkRateLimit: authCheckRateLimit } = await import('@repo/auth/server-actions');

    const result = await authCheckRateLimit(userId, action);
    return result.allowed;
  } catch (error) {
    logError('Rate limit check error:', { error });
    return false;
  }
}
