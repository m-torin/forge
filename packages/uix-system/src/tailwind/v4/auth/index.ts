/**
 * @repo/uix-system/tailwind/v4/auth
 *
 * Complete Tailwind CSS v4 RSC components for Better Auth
 * 100% React Server Component support with server actions
 */

// Core Authentication Forms
export { ForgotPasswordForm } from './forms/ForgotPasswordForm';
export { ResetPasswordForm } from './forms/ResetPasswordForm';
export { SignInForm } from './forms/SignInForm';
export { SignUpForm } from './forms/SignUpForm';

// Advanced Authentication
export { PasskeySetup } from './advanced/PasskeySetup';
export { TwoFactorSetup } from './advanced/TwoFactorSetup';
export { TwoFactorVerify } from './advanced/TwoFactorVerify';

// Enhanced Authentication
export { AnonymousSessionCreator } from './enhanced/AnonymousSessionCreator';
export { AnonymousToAccountConverter } from './enhanced/AnonymousToAccountConverter';
export { BearerTokenGenerator } from './enhanced/BearerTokenGenerator';
export { EmailOTPSignIn } from './enhanced/EmailOTPSignIn';
export { EmailOTPVerification } from './enhanced/EmailOTPVerification';
export { MultiSessionDashboard } from './enhanced/MultiSessionDashboard';
export { OrganizationAuditLog } from './enhanced/OrganizationAuditLog';
export { PhoneSignInForm } from './enhanced/PhoneSignInForm';
export { PhoneVerificationForm } from './enhanced/PhoneVerificationForm';
export { SecurityEventLog } from './enhanced/SecurityEventLog';
export { TeamCreationWizard } from './enhanced/TeamCreationWizard';

// New Enhanced Components - PHASE 5.1: Core Authentication Methods
export { ChangePasswordForm } from './enhanced/ChangePasswordForm';
export { EmailVerificationRequest } from './enhanced/EmailVerificationRequest';
export { EmailVerificationStatus } from './enhanced/EmailVerificationStatus';
export { MagicLinkRequestForm } from './enhanced/MagicLinkRequestForm';
export { MagicLinkStatusIndicator } from './enhanced/MagicLinkStatusIndicator';
export { ResendVerificationEmail } from './enhanced/ResendVerificationEmail';

// New Enhanced Components - PHASE 5.2: Phone & SMS Authentication
export { PhoneNumberManagement } from './enhanced/PhoneNumberManagement';
export { PhoneNumberSetupForm } from './enhanced/PhoneNumberSetupForm';
export { PhoneSignInWithSMS } from './enhanced/PhoneSignInWithSMS';
export { SMSVerificationForm } from './enhanced/SMSVerificationForm';

// New Enhanced Components - PHASE 5.3: Passkey Management
export { PasskeyManagement } from './enhanced/PasskeyManagement';
export { PasskeyRegistrationWizard } from './enhanced/PasskeyRegistrationWizard';
export { PasskeySignInInterface } from './enhanced/PasskeySignInInterface';

// New Enhanced Components - PHASE 3
export { AccountDeletionFlow } from './enhanced/AccountDeletionFlow';
export { BackupCodesManager } from './enhanced/BackupCodesManager';
export { DataExportRequest } from './enhanced/DataExportRequest';
export { DeviceManagement } from './enhanced/DeviceManagement';
export { EmailChangeVerification } from './enhanced/EmailChangeVerification';
export { PasswordStrengthIndicator } from './enhanced/PasswordStrengthIndicator';

// Social Authentication
export { SocialLoginButtons } from './social/SocialLoginButtons';

// Organization Management
export { InviteMembers } from './organization/InviteMembers';
export { MembersList } from './organization/MembersList';
export { OrganizationCreation } from './organization/OrganizationCreation';
export { OrganizationSettings } from './organization/OrganizationSettings';
export { OrganizationSwitcher } from './organization/OrganizationSwitcher';
export { RoleManagement } from './organization/RoleManagement';

// API Key Management
export { APIKeysList } from './api-keys/APIKeysList';
export { CreateAPIKeyForm } from './api-keys/CreateAPIKeyForm';
// Note: Additional API key components would be exported here

// Session Management
export { SessionsList } from './session/SessionsList';
// Note: Additional session components would be exported here

// Account Management
export { ProfileForm } from './account/ProfileForm';
// Note: Additional account components would be exported here

// Admin Components
export { AdminBulkUserActions } from './admin/AdminBulkUserActions';
export { AdminDashboard } from './admin/AdminDashboard';
export { AdminImpersonation } from './admin/AdminImpersonation';
export { AdminUserCreation } from './admin/AdminUserCreation';
export { AdminUserDetail } from './admin/AdminUserDetail';
export { AdminUsersList } from './admin/AdminUsersList';

// UI Primitives
export { Alert } from './ui/Alert';
export { Button } from './ui/Button';
export { Card, CardContent, CardFooter, CardHeader } from './ui/Card';
export { Input } from './ui/Input';

// Server Actions
export * from './actions';
export * from './enhanced/actions';

// Theme Provider & Dark Mode
export { AuthThemeProvider, ThemeProvider, ThemeToggle, useTheme } from './providers/ThemeProvider';
export * from './utils/dark-mode';

// Types
export * from './types';
