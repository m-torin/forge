// Lightweight server-next entry shims for tests: export stubs to avoid heavy imports
import 'server-only';

export const auth = {} as any;
export const toNextJsHandler = (() => ({})) as any;

export const getCurrentUser = (async () => null) as any;
export const getSession = (async () => null) as any;
export const requireAuth = (async () => ({})) as any;

// Server actions (stubs)
export const createUserAction = (async () => ({})) as any;
export const updateUserAction = (async () => ({})) as any;
export const deleteUserAction = (async () => ({})) as any;
export const getCurrentUserAction = (async () => ({})) as any;
export const listUsersAction = (async () => []) as any;

export const adminDeleteUserAction = (async () => ({})) as any;
export const banUserAction = (async () => ({})) as any;
export const unbanUserAction = (async () => ({})) as any;
export const impersonateUserAction = (async () => ({})) as any;
export const stopImpersonatingAction = (async () => ({})) as any;

export const createOrganizationAction = (async () => ({})) as any;
export const updateOrganizationAction = (async () => ({})) as any;
export const deleteOrganizationAction = (async () => ({})) as any;
export const getOrganizationAction = (async () => ({})) as any;
export const getOrganizationByIdAction = (async () => ({})) as any;
export const listOrganizationsAction = (async () => []) as any;
export const getActiveOrganizationAction = (async () => ({})) as any;
export const setActiveOrganizationAction = (async () => ({})) as any;

export const createApiKeyAction = (async () => ({})) as any;
export const updateApiKeyAction = (async () => ({})) as any;
export const deleteApiKeyAction = (async () => ({})) as any;
export const getApiKeyAction = (async () => ({})) as any;
export const listApiKeysAction = (async () => []) as any;
export const getApiKeyStatisticsAction = (async () => ({})) as any;
export const bulkCreateApiKeysAction = (async () => []) as any;

export const getSessionAction = (async () => ({})) as any;
export const deleteSessionAction = (async () => ({})) as any;
export const listSessionsAction = (async () => []) as any;
export const revokeUserSessionsAction = (async () => ({})) as any;

export const enableTwoFactorAction = (async () => ({})) as any;
export const disableTwoFactorAction = (async () => ({})) as any;
export const getTwoFactorStatusAction = (async () => ({})) as any;
export const getTwoFactorBackupCodesAction = (async () => []) as any;

export const generatePasskeyRegistrationOptionsAction = (async () => ({})) as any;
export const deletePasskeyAction = (async () => ({})) as any;
export const listPasskeysAction = (async () => []) as any;

export const changePasswordAction = (async () => ({})) as any;
export const setPasswordAction = (async () => ({})) as any;

export const listAccountsAction = (async () => []) as any;
export const unlinkAccountAction = (async () => ({})) as any;
export const setUserRoleAction = (async () => ({})) as any;

export const listUserOrganizationsAction = (async () => []) as any;
export const listOrganizationInvitationsAction = (async () => []) as any;
export const bulkInviteUsersAction = (async () => []) as any;
