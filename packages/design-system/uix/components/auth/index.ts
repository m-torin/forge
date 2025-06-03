// Legacy components
export { OrganizationDetail } from './organization-detail';
export { OrganizationSwitcher } from './organization-switcher';
export { SignIn } from './sign-in';
export { SignUp } from './sign-up';
export { UserButton } from './user-button';
export { ApiKeyList } from './api-key-list';
export { CreateApiKeyDialog } from './create-api-key-dialog';
export { UpdateApiKeyDialog } from './update-api-key-dialog';
export { ApiKeyManager } from './api-key-manager';

// New unified auth components
export { AuthLayout } from './auth-layout';
export { AuthForm } from './auth-form';
export { UnifiedSignIn } from './unified-sign-in';
export { UnifiedSignUp } from './unified-sign-up';
export { ForgotPasswordForm } from './forgot-password-form';
export { ResetPasswordForm } from './reset-password-form';

// Advanced auth components
export { TwoFactorManage, TwoFactorSetup, TwoFactorStatus } from './two-factor-setup';
export { PasskeyList, PasskeyManager, PasskeySetup, PasskeySignInButton } from './passkey-setup';
export {
  EmailVerificationBanner,
  EmailVerificationPage,
  EmailVerificationPrompt,
} from './email-verification';
export { SessionManagement, UserProfile } from './user-profile';

// Export types for the updated components
export type { UnifiedSignInProps } from './unified-sign-in';
export type { ForgotPasswordFormProps } from './forgot-password-form';
export type { ResetPasswordFormProps } from './reset-password-form';
