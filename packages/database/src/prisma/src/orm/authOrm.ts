'use server';

import type { Prisma } from '../../../../prisma-generated/client';
import { prisma } from '../../clients/standard';

//==============================================================================
// USER CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createUserOrm(args: Prisma.UserCreateArgs) {
  return prisma.user.create(args);
}

// READ
export async function findFirstUserOrm(args?: Prisma.UserFindFirstArgs) {
  return prisma.user.findFirst(args);
}

export async function findUniqueUserOrm(args: Prisma.UserFindUniqueArgs) {
  return prisma.user.findUnique(args);
}

export async function findManyUsersOrm(args?: Prisma.UserFindManyArgs) {
  return prisma.user.findMany(args);
}

// UPDATE
export async function updateUserOrm(args: Prisma.UserUpdateArgs) {
  return prisma.user.update(args);
}

export async function updateManyUsersOrm(args: Prisma.UserUpdateManyArgs) {
  return prisma.user.updateMany(args);
}

// UPSERT
export async function upsertUserOrm(args: Prisma.UserUpsertArgs) {
  return prisma.user.upsert(args);
}

// DELETE
export async function deleteUserOrm(args: Prisma.UserDeleteArgs) {
  return prisma.user.delete(args);
}

export async function deleteManyUsersOrm(args?: Prisma.UserDeleteManyArgs) {
  return prisma.user.deleteMany(args);
}

// AGGREGATE
export async function aggregateUsersOrm(args?: Prisma.UserAggregateArgs) {
  return prisma.user.aggregate(args ?? {});
}

export async function countUsersOrm(args?: Prisma.UserCountArgs) {
  return prisma.user.count(args);
}

export async function groupByUsersOrm(args: Prisma.UserGroupByArgs) {
  return prisma.user.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// SESSION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createSessionOrm(args: Prisma.SessionCreateArgs) {
  return prisma.session.create(args);
}

// READ
export async function findFirstSessionOrm(args?: Prisma.SessionFindFirstArgs) {
  return prisma.session.findFirst(args);
}

export async function findUniqueSessionOrm(args: Prisma.SessionFindUniqueArgs) {
  return prisma.session.findUnique(args);
}

export async function findManySessionsOrm(args?: Prisma.SessionFindManyArgs) {
  return prisma.session.findMany(args);
}

// UPDATE
export async function updateSessionOrm(args: Prisma.SessionUpdateArgs) {
  return prisma.session.update(args);
}

export async function updateManySessionsOrm(args: Prisma.SessionUpdateManyArgs) {
  return prisma.session.updateMany(args);
}

// UPSERT
export async function upsertSessionOrm(args: Prisma.SessionUpsertArgs) {
  return prisma.session.upsert(args);
}

// DELETE
export async function deleteSessionOrm(args: Prisma.SessionDeleteArgs) {
  return prisma.session.delete(args);
}

export async function deleteManySessionsOrm(args?: Prisma.SessionDeleteManyArgs) {
  return prisma.session.deleteMany(args);
}

// AGGREGATE
export async function aggregateSessionsOrm(args?: Prisma.SessionAggregateArgs) {
  return prisma.session.aggregate(args ?? {});
}

export async function countSessionsOrm(args?: Prisma.SessionCountArgs) {
  return prisma.session.count(args);
}

export async function groupBySessionsOrm(args: Prisma.SessionGroupByArgs) {
  return prisma.session.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// ACCOUNT CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createAccountOrm(args: Prisma.AccountCreateArgs) {
  return prisma.account.create(args);
}

// READ
export async function findFirstAccountOrm(args?: Prisma.AccountFindFirstArgs) {
  return prisma.account.findFirst(args);
}

export async function findUniqueAccountOrm(args: Prisma.AccountFindUniqueArgs) {
  return prisma.account.findUnique(args);
}

export async function findManyAccountsOrm(args?: Prisma.AccountFindManyArgs) {
  return prisma.account.findMany(args);
}

// UPDATE
export async function updateAccountOrm(args: Prisma.AccountUpdateArgs) {
  return prisma.account.update(args);
}

export async function updateManyAccountsOrm(args: Prisma.AccountUpdateManyArgs) {
  return prisma.account.updateMany(args);
}

// UPSERT
export async function upsertAccountOrm(args: Prisma.AccountUpsertArgs) {
  return prisma.account.upsert(args);
}

// DELETE
export async function deleteAccountOrm(args: Prisma.AccountDeleteArgs) {
  return prisma.account.delete(args);
}

export async function deleteManyAccountsOrm(args?: Prisma.AccountDeleteManyArgs) {
  return prisma.account.deleteMany(args);
}

// AGGREGATE
export async function aggregateAccountsOrm(args?: Prisma.AccountAggregateArgs) {
  return prisma.account.aggregate(args ?? {});
}

export async function countAccountsOrm(args?: Prisma.AccountCountArgs) {
  return prisma.account.count(args);
}

export async function groupByAccountsOrm(args: Prisma.AccountGroupByArgs) {
  return prisma.account.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// VERIFICATION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createVerificationOrm(args: Prisma.VerificationCreateArgs) {
  return prisma.verification.create(args);
}

// READ
export async function findFirstVerificationOrm(args?: Prisma.VerificationFindFirstArgs) {
  return prisma.verification.findFirst(args);
}

export async function findUniqueVerificationOrm(args: Prisma.VerificationFindUniqueArgs) {
  return prisma.verification.findUnique(args);
}

export async function findManyVerificationsOrm(args?: Prisma.VerificationFindManyArgs) {
  return prisma.verification.findMany(args);
}

// UPDATE
export async function updateVerificationOrm(args: Prisma.VerificationUpdateArgs) {
  return prisma.verification.update(args);
}

export async function updateManyVerificationsOrm(args: Prisma.VerificationUpdateManyArgs) {
  return prisma.verification.updateMany(args);
}

// UPSERT
export async function upsertVerificationOrm(args: Prisma.VerificationUpsertArgs) {
  return prisma.verification.upsert(args);
}

// DELETE
export async function deleteVerificationOrm(args: Prisma.VerificationDeleteArgs) {
  return prisma.verification.delete(args);
}

export async function deleteManyVerificationsOrm(args?: Prisma.VerificationDeleteManyArgs) {
  return prisma.verification.deleteMany(args);
}

// AGGREGATE
export async function aggregateVerificationsOrm(args?: Prisma.VerificationAggregateArgs) {
  return prisma.verification.aggregate(args ?? {});
}

export async function countVerificationsOrm(args?: Prisma.VerificationCountArgs) {
  return prisma.verification.count(args);
}

export async function groupByVerificationsOrm(args: Prisma.VerificationGroupByArgs) {
  return prisma.verification.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// ORGANIZATION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createOrganizationOrm(args: Prisma.OrganizationCreateArgs) {
  return prisma.organization.create(args);
}

// READ
export async function findFirstOrganizationOrm(args?: Prisma.OrganizationFindFirstArgs) {
  return prisma.organization.findFirst(args);
}

export async function findUniqueOrganizationOrm(args: Prisma.OrganizationFindUniqueArgs) {
  return prisma.organization.findUnique(args);
}

export async function findManyOrganizationsOrm(args?: Prisma.OrganizationFindManyArgs) {
  return prisma.organization.findMany(args);
}

// UPDATE
export async function updateOrganizationOrm(args: Prisma.OrganizationUpdateArgs) {
  return prisma.organization.update(args);
}

export async function updateManyOrganizationsOrm(args: Prisma.OrganizationUpdateManyArgs) {
  return prisma.organization.updateMany(args);
}

// UPSERT
export async function upsertOrganizationOrm(args: Prisma.OrganizationUpsertArgs) {
  return prisma.organization.upsert(args);
}

// DELETE
export async function deleteOrganizationOrm(args: Prisma.OrganizationDeleteArgs) {
  return prisma.organization.delete(args);
}

export async function deleteManyOrganizationsOrm(args?: Prisma.OrganizationDeleteManyArgs) {
  return prisma.organization.deleteMany(args);
}

// AGGREGATE
export async function aggregateOrganizationsOrm(args?: Prisma.OrganizationAggregateArgs) {
  return prisma.organization.aggregate(args ?? {});
}

export async function countOrganizationsOrm(args?: Prisma.OrganizationCountArgs) {
  return prisma.organization.count(args);
}

export async function groupByOrganizationsOrm(args: Prisma.OrganizationGroupByArgs) {
  return prisma.organization.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// MEMBER CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createMemberOrm(args: Prisma.MemberCreateArgs) {
  return prisma.member.create(args);
}

// READ
export async function findFirstMemberOrm(args?: Prisma.MemberFindFirstArgs) {
  return prisma.member.findFirst(args);
}

export async function findUniqueMemberOrm(args: Prisma.MemberFindUniqueArgs) {
  return prisma.member.findUnique(args);
}

export async function findManyMembersOrm(args?: Prisma.MemberFindManyArgs) {
  return prisma.member.findMany(args);
}

// UPDATE
export async function updateMemberOrm(args: Prisma.MemberUpdateArgs) {
  return prisma.member.update(args);
}

export async function updateManyMembersOrm(args: Prisma.MemberUpdateManyArgs) {
  return prisma.member.updateMany(args);
}

// UPSERT
export async function upsertMemberOrm(args: Prisma.MemberUpsertArgs) {
  return prisma.member.upsert(args);
}

// DELETE
export async function deleteMemberOrm(args: Prisma.MemberDeleteArgs) {
  return prisma.member.delete(args);
}

export async function deleteManyMembersOrm(args?: Prisma.MemberDeleteManyArgs) {
  return prisma.member.deleteMany(args);
}

// AGGREGATE
export async function aggregateMembersOrm(args?: Prisma.MemberAggregateArgs) {
  return prisma.member.aggregate(args ?? {});
}

export async function countMembersOrm(args?: Prisma.MemberCountArgs) {
  return prisma.member.count(args);
}

export async function groupByMembersOrm(args: Prisma.MemberGroupByArgs) {
  return prisma.member.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// TEAM CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createTeamOrm(args: Prisma.TeamCreateArgs) {
  return prisma.team.create(args);
}

// READ
export async function findFirstTeamOrm(args?: Prisma.TeamFindFirstArgs) {
  return prisma.team.findFirst(args);
}

export async function findUniqueTeamOrm(args: Prisma.TeamFindUniqueArgs) {
  return prisma.team.findUnique(args);
}

export async function findManyTeamsOrm(args?: Prisma.TeamFindManyArgs) {
  return prisma.team.findMany(args);
}

// UPDATE
export async function updateTeamOrm(args: Prisma.TeamUpdateArgs) {
  return prisma.team.update(args);
}

export async function updateManyTeamsOrm(args: Prisma.TeamUpdateManyArgs) {
  return prisma.team.updateMany(args);
}

// UPSERT
export async function upsertTeamOrm(args: Prisma.TeamUpsertArgs) {
  return prisma.team.upsert(args);
}

// DELETE
export async function deleteTeamOrm(args: Prisma.TeamDeleteArgs) {
  return prisma.team.delete(args);
}

export async function deleteManyTeamsOrm(args?: Prisma.TeamDeleteManyArgs) {
  return prisma.team.deleteMany(args);
}

// AGGREGATE
export async function aggregateTeamsOrm(args?: Prisma.TeamAggregateArgs) {
  return prisma.team.aggregate(args ?? {});
}

export async function countTeamsOrm(args?: Prisma.TeamCountArgs) {
  return prisma.team.count(args);
}

export async function groupByTeamsOrm(args: Prisma.TeamGroupByArgs) {
  return prisma.team.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// TEAMMEMBER CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createTeamMemberOrm(args: Prisma.TeamMemberCreateArgs) {
  return prisma.teamMember.create(args);
}

// READ
export async function findFirstTeamMemberOrm(args?: Prisma.TeamMemberFindFirstArgs) {
  return prisma.teamMember.findFirst(args);
}

export async function findUniqueTeamMemberOrm(args: Prisma.TeamMemberFindUniqueArgs) {
  return prisma.teamMember.findUnique(args);
}

export async function findManyTeamMembersOrm(args?: Prisma.TeamMemberFindManyArgs) {
  return prisma.teamMember.findMany(args);
}

// UPDATE
export async function updateTeamMemberOrm(args: Prisma.TeamMemberUpdateArgs) {
  return prisma.teamMember.update(args);
}

export async function updateManyTeamMembersOrm(args: Prisma.TeamMemberUpdateManyArgs) {
  return prisma.teamMember.updateMany(args);
}

// UPSERT
export async function upsertTeamMemberOrm(args: Prisma.TeamMemberUpsertArgs) {
  return prisma.teamMember.upsert(args);
}

// DELETE
export async function deleteTeamMemberOrm(args: Prisma.TeamMemberDeleteArgs) {
  return prisma.teamMember.delete(args);
}

export async function deleteManyTeamMembersOrm(args?: Prisma.TeamMemberDeleteManyArgs) {
  return prisma.teamMember.deleteMany(args);
}

// AGGREGATE
export async function aggregateTeamMembersOrm(args?: Prisma.TeamMemberAggregateArgs) {
  return prisma.teamMember.aggregate(args ?? {});
}

export async function countTeamMembersOrm(args?: Prisma.TeamMemberCountArgs) {
  return prisma.teamMember.count(args);
}

export async function groupByTeamMembersOrm(args: Prisma.TeamMemberGroupByArgs) {
  return prisma.teamMember.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// INVITATION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createInvitationOrm(args: Prisma.InvitationCreateArgs) {
  return prisma.invitation.create(args);
}

// READ
export async function findFirstInvitationOrm(args?: Prisma.InvitationFindFirstArgs) {
  return prisma.invitation.findFirst(args);
}

export async function findUniqueInvitationOrm(args: Prisma.InvitationFindUniqueArgs) {
  return prisma.invitation.findUnique(args);
}

export async function findManyInvitationsOrm(args?: Prisma.InvitationFindManyArgs) {
  return prisma.invitation.findMany(args);
}

// UPDATE
export async function updateInvitationOrm(args: Prisma.InvitationUpdateArgs) {
  return prisma.invitation.update(args);
}

export async function updateManyInvitationsOrm(args: Prisma.InvitationUpdateManyArgs) {
  return prisma.invitation.updateMany(args);
}

// UPSERT
export async function upsertInvitationOrm(args: Prisma.InvitationUpsertArgs) {
  return prisma.invitation.upsert(args);
}

// DELETE
export async function deleteInvitationOrm(args: Prisma.InvitationDeleteArgs) {
  return prisma.invitation.delete(args);
}

export async function deleteManyInvitationsOrm(args?: Prisma.InvitationDeleteManyArgs) {
  return prisma.invitation.deleteMany(args);
}

// AGGREGATE
export async function aggregateInvitationsOrm(args?: Prisma.InvitationAggregateArgs) {
  return prisma.invitation.aggregate(args ?? {});
}

export async function countInvitationsOrm(args?: Prisma.InvitationCountArgs) {
  return prisma.invitation.count(args);
}

export async function groupByInvitationsOrm(args: Prisma.InvitationGroupByArgs) {
  return prisma.invitation.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// APIKEY CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createApiKeyOrm(args: Prisma.ApiKeyCreateArgs) {
  return prisma.apiKey.create(args);
}

// READ
export async function findFirstApiKeyOrm(args?: Prisma.ApiKeyFindFirstArgs) {
  return prisma.apiKey.findFirst(args);
}

export async function findUniqueApiKeyOrm(args: Prisma.ApiKeyFindUniqueArgs) {
  return prisma.apiKey.findUnique(args);
}

export async function findManyApiKeysOrm(args?: Prisma.ApiKeyFindManyArgs) {
  return prisma.apiKey.findMany(args);
}

// UPDATE
export async function updateApiKeyOrm(args: Prisma.ApiKeyUpdateArgs) {
  return prisma.apiKey.update(args);
}

export async function updateManyApiKeysOrm(args: Prisma.ApiKeyUpdateManyArgs) {
  return prisma.apiKey.updateMany(args);
}

// UPSERT
export async function upsertApiKeyOrm(args: Prisma.ApiKeyUpsertArgs) {
  return prisma.apiKey.upsert(args);
}

// DELETE
export async function deleteApiKeyOrm(args: Prisma.ApiKeyDeleteArgs) {
  return prisma.apiKey.delete(args);
}

export async function deleteManyApiKeysOrm(args?: Prisma.ApiKeyDeleteManyArgs) {
  return prisma.apiKey.deleteMany(args);
}

// AGGREGATE
export async function aggregateApiKeysOrm(args?: Prisma.ApiKeyAggregateArgs) {
  return prisma.apiKey.aggregate(args ?? {});
}

export async function countApiKeysOrm(args?: Prisma.ApiKeyCountArgs) {
  return prisma.apiKey.count(args);
}

export async function groupByApiKeysOrm(args: Prisma.ApiKeyGroupByArgs) {
  return prisma.apiKey.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// TWOFACTOR CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createTwoFactorOrm(args: Prisma.TwoFactorCreateArgs) {
  return prisma.twoFactor.create(args);
}

// READ
export async function findFirstTwoFactorOrm(args?: Prisma.TwoFactorFindFirstArgs) {
  return prisma.twoFactor.findFirst(args);
}

export async function findUniqueTwoFactorOrm(args: Prisma.TwoFactorFindUniqueArgs) {
  return prisma.twoFactor.findUnique(args);
}

export async function findManyTwoFactorsOrm(args?: Prisma.TwoFactorFindManyArgs) {
  return prisma.twoFactor.findMany(args);
}

// UPDATE
export async function updateTwoFactorOrm(args: Prisma.TwoFactorUpdateArgs) {
  return prisma.twoFactor.update(args);
}

export async function updateManyTwoFactorsOrm(args: Prisma.TwoFactorUpdateManyArgs) {
  return prisma.twoFactor.updateMany(args);
}

// UPSERT
export async function upsertTwoFactorOrm(args: Prisma.TwoFactorUpsertArgs) {
  return prisma.twoFactor.upsert(args);
}

// DELETE
export async function deleteTwoFactorOrm(args: Prisma.TwoFactorDeleteArgs) {
  return prisma.twoFactor.delete(args);
}

export async function deleteManyTwoFactorsOrm(args?: Prisma.TwoFactorDeleteManyArgs) {
  return prisma.twoFactor.deleteMany(args);
}

// AGGREGATE
export async function aggregateTwoFactorsOrm(args?: Prisma.TwoFactorAggregateArgs) {
  return prisma.twoFactor.aggregate(args ?? {});
}

export async function countTwoFactorsOrm(args?: Prisma.TwoFactorCountArgs) {
  return prisma.twoFactor.count(args);
}

export async function groupByTwoFactorsOrm(args: Prisma.TwoFactorGroupByArgs) {
  return prisma.twoFactor.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// BACKUPCODE CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createBackupCodeOrm(args: Prisma.BackupCodeCreateArgs) {
  return prisma.backupCode.create(args);
}

// READ
export async function findFirstBackupCodeOrm(args?: Prisma.BackupCodeFindFirstArgs) {
  return prisma.backupCode.findFirst(args);
}

export async function findUniqueBackupCodeOrm(args: Prisma.BackupCodeFindUniqueArgs) {
  return prisma.backupCode.findUnique(args);
}

export async function findManyBackupCodesOrm(args?: Prisma.BackupCodeFindManyArgs) {
  return prisma.backupCode.findMany(args);
}

// UPDATE
export async function updateBackupCodeOrm(args: Prisma.BackupCodeUpdateArgs) {
  return prisma.backupCode.update(args);
}

export async function updateManyBackupCodesOrm(args: Prisma.BackupCodeUpdateManyArgs) {
  return prisma.backupCode.updateMany(args);
}

// UPSERT
export async function upsertBackupCodeOrm(args: Prisma.BackupCodeUpsertArgs) {
  return prisma.backupCode.upsert(args);
}

// DELETE
export async function deleteBackupCodeOrm(args: Prisma.BackupCodeDeleteArgs) {
  return prisma.backupCode.delete(args);
}

export async function deleteManyBackupCodesOrm(args?: Prisma.BackupCodeDeleteManyArgs) {
  return prisma.backupCode.deleteMany(args);
}

// AGGREGATE
export async function aggregateBackupCodesOrm(args?: Prisma.BackupCodeAggregateArgs) {
  return prisma.backupCode.aggregate(args ?? {});
}

export async function countBackupCodesOrm(args?: Prisma.BackupCodeCountArgs) {
  return prisma.backupCode.count(args);
}

export async function groupByBackupCodesOrm(args: Prisma.BackupCodeGroupByArgs) {
  return prisma.backupCode.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// PASSKEY CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createPasskeyOrm(args: Prisma.PasskeyCreateArgs) {
  return prisma.passkey.create(args);
}

// READ
export async function findFirstPasskeyOrm(args?: Prisma.PasskeyFindFirstArgs) {
  return prisma.passkey.findFirst(args);
}

export async function findUniquePasskeyOrm(args: Prisma.PasskeyFindUniqueArgs) {
  return prisma.passkey.findUnique(args);
}

export async function findManyPasskeysOrm(args?: Prisma.PasskeyFindManyArgs) {
  return prisma.passkey.findMany(args);
}

// UPDATE
export async function updatePasskeyOrm(args: Prisma.PasskeyUpdateArgs) {
  return prisma.passkey.update(args);
}

export async function updateManyPasskeysOrm(args: Prisma.PasskeyUpdateManyArgs) {
  return prisma.passkey.updateMany(args);
}

// UPSERT
export async function upsertPasskeyOrm(args: Prisma.PasskeyUpsertArgs) {
  return prisma.passkey.upsert(args);
}

// DELETE
export async function deletePasskeyOrm(args: Prisma.PasskeyDeleteArgs) {
  return prisma.passkey.delete(args);
}

export async function deleteManyPasskeysOrm(args?: Prisma.PasskeyDeleteManyArgs) {
  return prisma.passkey.deleteMany(args);
}

// AGGREGATE
export async function aggregatePasskeysOrm(args?: Prisma.PasskeyAggregateArgs) {
  return prisma.passkey.aggregate(args ?? {});
}

export async function countPasskeysOrm(args?: Prisma.PasskeyCountArgs) {
  return prisma.passkey.count(args);
}

export async function groupByPasskeysOrm(args: Prisma.PasskeyGroupByArgs) {
  return prisma.passkey.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}

//==============================================================================
// AUDITLOG CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createAuditLogOrm(args: Prisma.AuditLogCreateArgs) {
  return prisma.auditLog.create(args);
}

// READ
export async function findFirstAuditLogOrm(args?: Prisma.AuditLogFindFirstArgs) {
  return prisma.auditLog.findFirst(args);
}

export async function findUniqueAuditLogOrm(args: Prisma.AuditLogFindUniqueArgs) {
  return prisma.auditLog.findUnique(args);
}

export async function findManyAuditLogsOrm(args?: Prisma.AuditLogFindManyArgs) {
  return prisma.auditLog.findMany(args);
}

// UPDATE
export async function updateAuditLogOrm(args: Prisma.AuditLogUpdateArgs) {
  return prisma.auditLog.update(args);
}

export async function updateManyAuditLogsOrm(args: Prisma.AuditLogUpdateManyArgs) {
  return prisma.auditLog.updateMany(args);
}

// UPSERT
export async function upsertAuditLogOrm(args: Prisma.AuditLogUpsertArgs) {
  return prisma.auditLog.upsert(args);
}

// DELETE
export async function deleteAuditLogOrm(args: Prisma.AuditLogDeleteArgs) {
  return prisma.auditLog.delete(args);
}

export async function deleteManyAuditLogsOrm(args?: Prisma.AuditLogDeleteManyArgs) {
  return prisma.auditLog.deleteMany(args);
}

// AGGREGATE
export async function aggregateAuditLogsOrm(args?: Prisma.AuditLogAggregateArgs) {
  return prisma.auditLog.aggregate(args ?? {});
}

export async function countAuditLogsOrm(args?: Prisma.AuditLogCountArgs) {
  return prisma.auditLog.count(args);
}

export async function groupByAuditLogsOrm(args: Prisma.AuditLogGroupByArgs) {
  return prisma.auditLog.groupBy({
    ...args,
    orderBy: args.orderBy ?? undefined,
  } as any);
}
