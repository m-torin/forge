/**
 * @repo/uix-system/mantine/components/auth
 *
 * Authentication UI components for Mantine v8
 */

// Layout & Structure
export { AuthGuard } from './AuthGuard';
export { AuthLayout } from './AuthLayout';
export { AuthLoading } from './AuthLoading';

// Form Components
export { ForgotPasswordForm } from './ForgotPasswordForm';
export { SignInForm } from './SignInForm';
export { SignUpForm } from './SignUpForm';

// Social & Interactive
export { PasskeyList } from './PasskeyList';
export { SocialLoginButtons } from './SocialLoginButtons';
export { TwoFactorSetup } from './TwoFactorSetup';

// Modals & Advanced Forms
export { AddPasskeyModal } from './AddPasskeyModal';
export { ChangePasswordModal } from './ChangePasswordModal';
export { ResetPasswordForm } from './ResetPasswordForm';

// Session Management
export { AccountSwitcher } from './AccountSwitcher';
export { EnhancedSessionsList } from './EnhancedSessionsList';
export { SessionsList } from './SessionsList';

// Organization Management
export { InvitationsDashboard } from './InvitationsDashboard';
export { OrganizationInvitation, OrganizationInvitationAlert } from './OrganizationInvitation';

// Type exports
export type { AddPasskeyFormValues, AddPasskeyModalProps } from './AddPasskeyModal';
export type { AuthGuardProps, AuthSession, AuthUser } from './AuthGuard';
export type { AuthLayoutProps } from './AuthLayout';
export type { AuthLoadingProps } from './AuthLoading';
export type { ChangePasswordFormValues, ChangePasswordModalProps } from './ChangePasswordModal';
export type { ForgotPasswordFormProps, ForgotPasswordFormValues } from './ForgotPasswordForm';
export type { Passkey, PasskeyListProps } from './PasskeyList';
export type { ResetPasswordFormProps, ResetPasswordFormValues } from './ResetPasswordForm';
export type { SignInFormProps, SignInFormValues } from './SignInForm';
export type { SignUpFormProps, SignUpFormValues } from './SignUpForm';
export type { SocialLoginButtonsProps } from './SocialLoginButtons';
export type { TwoFactorSetupProps, TwoFactorStep } from './TwoFactorSetup';

// Session Management Types
export type { AccountSwitcherProps, User, UserSession } from './AccountSwitcher';
export type { EnhancedSessionsListProps } from './EnhancedSessionsList';
export type { Session, SessionsListProps } from './SessionsList';

// Organization Management Types
export type { InvitationsDashboardProps } from './InvitationsDashboard';
export type {
  Invitation,
  InvitationAlert,
  InvitationInviter,
  InvitationOrganization,
  OrganizationInvitationAlertProps,
  OrganizationInvitationProps,
} from './OrganizationInvitation';

// Session Types
export type {
  BulkActionResult,
  EnhancedSession,
  SecurityAlert,
  SessionActivity,
  SessionBulkAction,
  SessionDevice,
  SessionFilters,
  SessionLocation,
  SessionManagementConfig,
  SessionMetrics,
  SessionSecurity,
  SessionStats,
} from './types/session';
