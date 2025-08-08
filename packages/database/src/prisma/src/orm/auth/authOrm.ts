'use server';

import type { Prisma } from '../../../../../prisma-generated/client';
import { prisma as defaultPrisma } from '../../../clients/standard';

// Use any for flexibility with extended and transaction clients
type PrismaTransaction = any;

//==============================================================================
// USER CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createUserOrm(
  args: Prisma.UserCreateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.user.create(args);
}

export async function createManyUsersOrm(
  args: Prisma.UserCreateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.user.createMany(args);
}

// READ
export async function findFirstUserOrm(
  args?: Prisma.UserFindFirstArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.user.findFirst(args);
}

export async function findUniqueUserOrm(
  args: Prisma.UserFindUniqueArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.user.findUnique(args);
}

export async function findUniqueUserOrmOrThrow(
  args: Prisma.UserFindUniqueOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.user.findUniqueOrThrow(args);
}

export async function findFirstUserOrmOrThrow(
  args: Prisma.UserFindFirstOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.user.findFirstOrThrow(args);
}

export async function findManyUsersOrm(
  args?: Prisma.UserFindManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.user.findMany(args);
}

// UPDATE
export async function updateUserOrm(
  args: Prisma.UserUpdateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.user.update(args);
}

export async function updateManyUsersOrm(
  args: Prisma.UserUpdateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.user.updateMany(args);
}

// UPSERT
export async function upsertUserOrm(
  args: Prisma.UserUpsertArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.user.upsert(args);
}

// DELETE
export async function deleteUserOrm(
  args: Prisma.UserDeleteArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.user.delete(args);
}

export async function deleteManyUsersOrm(
  args?: Prisma.UserDeleteManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.user.deleteMany(args);
}

// AGGREGATE
export async function aggregateUsersOrm(
  args?: Prisma.UserAggregateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.user.aggregate(args ?? {});
}

export async function countUsersOrm(
  args?: Prisma.UserCountArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.user.count(args);
}

export async function groupByUsersOrm(
  args: Prisma.UserGroupByArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.user.groupBy(args);
}

//==============================================================================
// SESSION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createSessionOrm(
  args: Prisma.SessionCreateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.session.create(args);
}

export async function createManySessionsOrm(
  args: Prisma.SessionCreateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.session.createMany(args);
}

// READ
export async function findFirstSessionOrm(
  args?: Prisma.SessionFindFirstArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.session.findFirst(args);
}

export async function findUniqueSessionOrm(
  args: Prisma.SessionFindUniqueArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.session.findUnique(args);
}

export async function findUniqueSessionOrmOrThrow(
  args: Prisma.SessionFindUniqueOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.session.findUniqueOrThrow(args);
}

export async function findFirstSessionOrmOrThrow(
  args: Prisma.SessionFindFirstOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.session.findFirstOrThrow(args);
}

export async function findManySessionsOrm(
  args?: Prisma.SessionFindManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.session.findMany(args);
}

// UPDATE
export async function updateSessionOrm(
  args: Prisma.SessionUpdateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.session.update(args);
}

export async function updateManySessionsOrm(
  args: Prisma.SessionUpdateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.session.updateMany(args);
}

// UPSERT
export async function upsertSessionOrm(
  args: Prisma.SessionUpsertArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.session.upsert(args);
}

// DELETE
export async function deleteSessionOrm(
  args: Prisma.SessionDeleteArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.session.delete(args);
}

export async function deleteManySessionsOrm(
  args?: Prisma.SessionDeleteManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.session.deleteMany(args);
}

// AGGREGATE
export async function aggregateSessionsOrm(
  args?: Prisma.SessionAggregateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.session.aggregate(args ?? {});
}

export async function countSessionsOrm(
  args?: Prisma.SessionCountArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.session.count(args);
}

export async function groupBySessionsOrm(
  args: Prisma.SessionGroupByArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.session.groupBy(args);
}

//==============================================================================
// ACCOUNT CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createAccountOrm(
  args: Prisma.AccountCreateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.account.create(args);
}

export async function createManyAccountsOrm(
  args: Prisma.AccountCreateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.account.createMany(args);
}

// READ
export async function findFirstAccountOrm(
  args?: Prisma.AccountFindFirstArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.account.findFirst(args);
}

export async function findUniqueAccountOrm(
  args: Prisma.AccountFindUniqueArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.account.findUnique(args);
}

export async function findUniqueAccountOrmOrThrow(
  args: Prisma.AccountFindUniqueOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.account.findUniqueOrThrow(args);
}

export async function findFirstAccountOrmOrThrow(
  args: Prisma.AccountFindFirstOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.account.findFirstOrThrow(args);
}

export async function findManyAccountsOrm(
  args?: Prisma.AccountFindManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.account.findMany(args);
}

// UPDATE
export async function updateAccountOrm(
  args: Prisma.AccountUpdateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.account.update(args);
}

export async function updateManyAccountsOrm(
  args: Prisma.AccountUpdateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.account.updateMany(args);
}

// UPSERT
export async function upsertAccountOrm(
  args: Prisma.AccountUpsertArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.account.upsert(args);
}

// DELETE
export async function deleteAccountOrm(
  args: Prisma.AccountDeleteArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.account.delete(args);
}

export async function deleteManyAccountsOrm(
  args?: Prisma.AccountDeleteManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.account.deleteMany(args);
}

// AGGREGATE
export async function aggregateAccountsOrm(
  args?: Prisma.AccountAggregateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.account.aggregate(args ?? {});
}

export async function countAccountsOrm(
  args?: Prisma.AccountCountArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.account.count(args);
}

export async function groupByAccountsOrm(
  args: Prisma.AccountGroupByArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.account.groupBy(args);
}

//==============================================================================
// VERIFICATION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createVerificationOrm(
  args: Prisma.VerificationCreateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.verification.create(args);
}

export async function createManyVerificationsOrm(
  args: Prisma.VerificationCreateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.verification.createMany(args);
}

// READ
export async function findFirstVerificationOrm(
  args?: Prisma.VerificationFindFirstArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.verification.findFirst(args);
}

export async function findUniqueVerificationOrm(
  args: Prisma.VerificationFindUniqueArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.verification.findUnique(args);
}

export async function findUniqueVerificationOrmOrThrow(
  args: Prisma.VerificationFindUniqueOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.verification.findUniqueOrThrow(args);
}

export async function findFirstVerificationOrmOrThrow(
  args: Prisma.VerificationFindFirstOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.verification.findFirstOrThrow(args);
}

export async function findManyVerificationsOrm(
  args?: Prisma.VerificationFindManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.verification.findMany(args);
}

// UPDATE
export async function updateVerificationOrm(
  args: Prisma.VerificationUpdateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.verification.update(args);
}

export async function updateManyVerificationsOrm(
  args: Prisma.VerificationUpdateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.verification.updateMany(args);
}

// UPSERT
export async function upsertVerificationOrm(
  args: Prisma.VerificationUpsertArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.verification.upsert(args);
}

// DELETE
export async function deleteVerificationOrm(
  args: Prisma.VerificationDeleteArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.verification.delete(args);
}

export async function deleteManyVerificationsOrm(
  args?: Prisma.VerificationDeleteManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.verification.deleteMany(args);
}

// AGGREGATE
export async function aggregateVerificationsOrm(
  args?: Prisma.VerificationAggregateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.verification.aggregate(args ?? {});
}

export async function countVerificationsOrm(
  args?: Prisma.VerificationCountArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.verification.count(args);
}

export async function groupByVerificationsOrm(
  args: Prisma.VerificationGroupByArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.verification.groupBy(args);
}

//==============================================================================
// ORGANIZATION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createOrganizationOrm(
  args: Prisma.OrganizationCreateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.organization.create(args);
}

export async function createManyOrganizationsOrm(
  args: Prisma.OrganizationCreateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.organization.createMany(args);
}

// READ
export async function findFirstOrganizationOrm(
  args?: Prisma.OrganizationFindFirstArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.organization.findFirst(args);
}

export async function findUniqueOrganizationOrm(
  args: Prisma.OrganizationFindUniqueArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.organization.findUnique(args);
}

export async function findUniqueOrganizationOrmOrThrow(
  args: Prisma.OrganizationFindUniqueOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.organization.findUniqueOrThrow(args);
}

export async function findFirstOrganizationOrmOrThrow(
  args: Prisma.OrganizationFindFirstOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.organization.findFirstOrThrow(args);
}

export async function findManyOrganizationsOrm(
  args?: Prisma.OrganizationFindManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.organization.findMany(args);
}

// UPDATE
export async function updateOrganizationOrm(
  args: Prisma.OrganizationUpdateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.organization.update(args);
}

export async function updateManyOrganizationsOrm(
  args: Prisma.OrganizationUpdateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.organization.updateMany(args);
}

// UPSERT
export async function upsertOrganizationOrm(
  args: Prisma.OrganizationUpsertArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.organization.upsert(args);
}

// DELETE
export async function deleteOrganizationOrm(
  args: Prisma.OrganizationDeleteArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.organization.delete(args);
}

export async function deleteManyOrganizationsOrm(
  args?: Prisma.OrganizationDeleteManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.organization.deleteMany(args);
}

// AGGREGATE
export async function aggregateOrganizationsOrm(
  args?: Prisma.OrganizationAggregateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.organization.aggregate(args ?? {});
}

export async function countOrganizationsOrm(
  args?: Prisma.OrganizationCountArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.organization.count(args);
}

export async function groupByOrganizationsOrm(
  args: Prisma.OrganizationGroupByArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.organization.groupBy(args);
}

//==============================================================================
// MEMBER CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createMemberOrm(
  args: Prisma.MemberCreateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.member.create(args);
}

export async function createManyMembersOrm(
  args: Prisma.MemberCreateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.member.createMany(args);
}

// READ
export async function findFirstMemberOrm(
  args?: Prisma.MemberFindFirstArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.member.findFirst(args);
}

export async function findUniqueMemberOrm(
  args: Prisma.MemberFindUniqueArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.member.findUnique(args);
}

export async function findUniqueMemberOrmOrThrow(
  args: Prisma.MemberFindUniqueOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.member.findUniqueOrThrow(args);
}

export async function findFirstMemberOrmOrThrow(
  args: Prisma.MemberFindFirstOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.member.findFirstOrThrow(args);
}

export async function findManyMembersOrm(
  args?: Prisma.MemberFindManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.member.findMany(args);
}

// UPDATE
export async function updateMemberOrm(
  args: Prisma.MemberUpdateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.member.update(args);
}

export async function updateManyMembersOrm(
  args: Prisma.MemberUpdateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.member.updateMany(args);
}

// UPSERT
export async function upsertMemberOrm(
  args: Prisma.MemberUpsertArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.member.upsert(args);
}

// DELETE
export async function deleteMemberOrm(
  args: Prisma.MemberDeleteArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.member.delete(args);
}

export async function deleteManyMembersOrm(
  args?: Prisma.MemberDeleteManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.member.deleteMany(args);
}

// AGGREGATE
export async function aggregateMembersOrm(
  args?: Prisma.MemberAggregateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.member.aggregate(args ?? {});
}

export async function countMembersOrm(
  args?: Prisma.MemberCountArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.member.count(args);
}

export async function groupByMembersOrm(
  args: Prisma.MemberGroupByArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.member.groupBy(args);
}

//==============================================================================
// TEAM CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createTeamOrm(
  args: Prisma.TeamCreateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.team.create(args);
}

export async function createManyTeamsOrm(
  args: Prisma.TeamCreateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.team.createMany(args);
}

// READ
export async function findFirstTeamOrm(
  args?: Prisma.TeamFindFirstArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.team.findFirst(args);
}

export async function findUniqueTeamOrm(
  args: Prisma.TeamFindUniqueArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.team.findUnique(args);
}

export async function findUniqueTeamOrmOrThrow(
  args: Prisma.TeamFindUniqueOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.team.findUniqueOrThrow(args);
}

export async function findFirstTeamOrmOrThrow(
  args: Prisma.TeamFindFirstOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.team.findFirstOrThrow(args);
}

export async function findManyTeamsOrm(
  args?: Prisma.TeamFindManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.team.findMany(args);
}

// UPDATE
export async function updateTeamOrm(
  args: Prisma.TeamUpdateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.team.update(args);
}

export async function updateManyTeamsOrm(
  args: Prisma.TeamUpdateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.team.updateMany(args);
}

// UPSERT
export async function upsertTeamOrm(
  args: Prisma.TeamUpsertArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.team.upsert(args);
}

// DELETE
export async function deleteTeamOrm(
  args: Prisma.TeamDeleteArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.team.delete(args);
}

export async function deleteManyTeamsOrm(
  args?: Prisma.TeamDeleteManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.team.deleteMany(args);
}

// AGGREGATE
export async function aggregateTeamsOrm(
  args?: Prisma.TeamAggregateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.team.aggregate(args ?? {});
}

export async function countTeamsOrm(
  args?: Prisma.TeamCountArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.team.count(args);
}

export async function groupByTeamsOrm(
  args: Prisma.TeamGroupByArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.team.groupBy(args);
}

//==============================================================================
// TEAMMEMBER CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createTeamMemberOrm(
  args: Prisma.TeamMemberCreateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.teamMember.create(args);
}

export async function createManyTeamMembersOrm(
  args: Prisma.TeamMemberCreateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.teamMember.createMany(args);
}

// READ
export async function findFirstTeamMemberOrm(
  args?: Prisma.TeamMemberFindFirstArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.teamMember.findFirst(args);
}

export async function findUniqueTeamMemberOrm(
  args: Prisma.TeamMemberFindUniqueArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.teamMember.findUnique(args);
}

export async function findUniqueTeamMemberOrmOrThrow(
  args: Prisma.TeamMemberFindUniqueOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.teamMember.findUniqueOrThrow(args);
}

export async function findFirstTeamMemberOrmOrThrow(
  args: Prisma.TeamMemberFindFirstOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.teamMember.findFirstOrThrow(args);
}

export async function findManyTeamMembersOrm(
  args?: Prisma.TeamMemberFindManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.teamMember.findMany(args);
}

// UPDATE
export async function updateTeamMemberOrm(
  args: Prisma.TeamMemberUpdateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.teamMember.update(args);
}

export async function updateManyTeamMembersOrm(
  args: Prisma.TeamMemberUpdateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.teamMember.updateMany(args);
}

// UPSERT
export async function upsertTeamMemberOrm(
  args: Prisma.TeamMemberUpsertArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.teamMember.upsert(args);
}

// DELETE
export async function deleteTeamMemberOrm(
  args: Prisma.TeamMemberDeleteArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.teamMember.delete(args);
}

export async function deleteManyTeamMembersOrm(
  args?: Prisma.TeamMemberDeleteManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.teamMember.deleteMany(args);
}

// AGGREGATE
export async function aggregateTeamMembersOrm(
  args?: Prisma.TeamMemberAggregateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.teamMember.aggregate(args ?? {});
}

export async function countTeamMembersOrm(
  args?: Prisma.TeamMemberCountArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.teamMember.count(args);
}

export async function groupByTeamMembersOrm(
  args: Prisma.TeamMemberGroupByArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.teamMember.groupBy(args);
}

//==============================================================================
// INVITATION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createInvitationOrm(
  args: Prisma.InvitationCreateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.invitation.create(args);
}

export async function createManyInvitationsOrm(
  args: Prisma.InvitationCreateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.invitation.createMany(args);
}

// READ
export async function findFirstInvitationOrm(
  args?: Prisma.InvitationFindFirstArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.invitation.findFirst(args);
}

export async function findUniqueInvitationOrm(
  args: Prisma.InvitationFindUniqueArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.invitation.findUnique(args);
}

export async function findUniqueInvitationOrmOrThrow(
  args: Prisma.InvitationFindUniqueOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.invitation.findUniqueOrThrow(args);
}

export async function findFirstInvitationOrmOrThrow(
  args: Prisma.InvitationFindFirstOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.invitation.findFirstOrThrow(args);
}

export async function findManyInvitationsOrm(
  args?: Prisma.InvitationFindManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.invitation.findMany(args);
}

// UPDATE
export async function updateInvitationOrm(
  args: Prisma.InvitationUpdateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.invitation.update(args);
}

export async function updateManyInvitationsOrm(
  args: Prisma.InvitationUpdateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.invitation.updateMany(args);
}

// UPSERT
export async function upsertInvitationOrm(
  args: Prisma.InvitationUpsertArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.invitation.upsert(args);
}

// DELETE
export async function deleteInvitationOrm(
  args: Prisma.InvitationDeleteArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.invitation.delete(args);
}

export async function deleteManyInvitationsOrm(
  args?: Prisma.InvitationDeleteManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.invitation.deleteMany(args);
}

// AGGREGATE
export async function aggregateInvitationsOrm(
  args?: Prisma.InvitationAggregateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.invitation.aggregate(args ?? {});
}

export async function countInvitationsOrm(
  args?: Prisma.InvitationCountArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.invitation.count(args);
}

export async function groupByInvitationsOrm(
  args: Prisma.InvitationGroupByArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.invitation.groupBy(args);
}

//==============================================================================
// APIKEY CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createApiKeyOrm(
  args: Prisma.ApiKeyCreateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.apiKey.create(args);
}

export async function createManyApiKeysOrm(
  args: Prisma.ApiKeyCreateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.apiKey.createMany(args);
}

// READ
export async function findFirstApiKeyOrm(
  args?: Prisma.ApiKeyFindFirstArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.apiKey.findFirst(args);
}

export async function findUniqueApiKeyOrm(
  args: Prisma.ApiKeyFindUniqueArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.apiKey.findUnique(args);
}

export async function findUniqueApiKeyOrmOrThrow(
  args: Prisma.ApiKeyFindUniqueOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.apiKey.findUniqueOrThrow(args);
}

export async function findFirstApiKeyOrmOrThrow(
  args: Prisma.ApiKeyFindFirstOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.apiKey.findFirstOrThrow(args);
}

export async function findManyApiKeysOrm(
  args?: Prisma.ApiKeyFindManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.apiKey.findMany(args);
}

// UPDATE
export async function updateApiKeyOrm(
  args: Prisma.ApiKeyUpdateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.apiKey.update(args);
}

export async function updateManyApiKeysOrm(
  args: Prisma.ApiKeyUpdateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.apiKey.updateMany(args);
}

// UPSERT
export async function upsertApiKeyOrm(
  args: Prisma.ApiKeyUpsertArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.apiKey.upsert(args);
}

// DELETE
export async function deleteApiKeyOrm(
  args: Prisma.ApiKeyDeleteArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.apiKey.delete(args);
}

export async function deleteManyApiKeysOrm(
  args?: Prisma.ApiKeyDeleteManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.apiKey.deleteMany(args);
}

// AGGREGATE
export async function aggregateApiKeysOrm(
  args?: Prisma.ApiKeyAggregateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.apiKey.aggregate(args ?? {});
}

export async function countApiKeysOrm(
  args?: Prisma.ApiKeyCountArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.apiKey.count(args);
}

export async function groupByApiKeysOrm(
  args: Prisma.ApiKeyGroupByArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.apiKey.groupBy(args);
}

//==============================================================================
// TWOFACTOR CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createTwoFactorOrm(
  args: Prisma.TwoFactorCreateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.twoFactor.create(args);
}

export async function createManyTwoFactorsOrm(
  args: Prisma.TwoFactorCreateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.twoFactor.createMany(args);
}

// READ
export async function findFirstTwoFactorOrm(
  args?: Prisma.TwoFactorFindFirstArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.twoFactor.findFirst(args);
}

export async function findUniqueTwoFactorOrm(
  args: Prisma.TwoFactorFindUniqueArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.twoFactor.findUnique(args);
}

export async function findUniqueTwoFactorOrmOrThrow(
  args: Prisma.TwoFactorFindUniqueOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.twoFactor.findUniqueOrThrow(args);
}

export async function findFirstTwoFactorOrmOrThrow(
  args: Prisma.TwoFactorFindFirstOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.twoFactor.findFirstOrThrow(args);
}

export async function findManyTwoFactorsOrm(
  args?: Prisma.TwoFactorFindManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.twoFactor.findMany(args);
}

// UPDATE
export async function updateTwoFactorOrm(
  args: Prisma.TwoFactorUpdateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.twoFactor.update(args);
}

export async function updateManyTwoFactorsOrm(
  args: Prisma.TwoFactorUpdateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.twoFactor.updateMany(args);
}

// UPSERT
export async function upsertTwoFactorOrm(
  args: Prisma.TwoFactorUpsertArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.twoFactor.upsert(args);
}

// DELETE
export async function deleteTwoFactorOrm(
  args: Prisma.TwoFactorDeleteArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.twoFactor.delete(args);
}

export async function deleteManyTwoFactorsOrm(
  args?: Prisma.TwoFactorDeleteManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.twoFactor.deleteMany(args);
}

// AGGREGATE
export async function aggregateTwoFactorsOrm(
  args?: Prisma.TwoFactorAggregateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.twoFactor.aggregate(args ?? {});
}

export async function countTwoFactorsOrm(
  args?: Prisma.TwoFactorCountArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.twoFactor.count(args);
}

export async function groupByTwoFactorsOrm(
  args: Prisma.TwoFactorGroupByArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.twoFactor.groupBy(args);
}

//==============================================================================
// BACKUPCODE CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createBackupCodeOrm(
  args: Prisma.BackupCodeCreateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.backupCode.create(args);
}

export async function createManyBackupCodesOrm(
  args: Prisma.BackupCodeCreateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.backupCode.createMany(args);
}

// READ
export async function findFirstBackupCodeOrm(
  args?: Prisma.BackupCodeFindFirstArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.backupCode.findFirst(args);
}

export async function findUniqueBackupCodeOrm(
  args: Prisma.BackupCodeFindUniqueArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.backupCode.findUnique(args);
}

export async function findUniqueBackupCodeOrmOrThrow(
  args: Prisma.BackupCodeFindUniqueOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.backupCode.findUniqueOrThrow(args);
}

export async function findFirstBackupCodeOrmOrThrow(
  args: Prisma.BackupCodeFindFirstOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.backupCode.findFirstOrThrow(args);
}

export async function findManyBackupCodesOrm(
  args?: Prisma.BackupCodeFindManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.backupCode.findMany(args);
}

// UPDATE
export async function updateBackupCodeOrm(
  args: Prisma.BackupCodeUpdateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.backupCode.update(args);
}

export async function updateManyBackupCodesOrm(
  args: Prisma.BackupCodeUpdateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.backupCode.updateMany(args);
}

// UPSERT
export async function upsertBackupCodeOrm(
  args: Prisma.BackupCodeUpsertArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.backupCode.upsert(args);
}

// DELETE
export async function deleteBackupCodeOrm(
  args: Prisma.BackupCodeDeleteArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.backupCode.delete(args);
}

export async function deleteManyBackupCodesOrm(
  args?: Prisma.BackupCodeDeleteManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.backupCode.deleteMany(args);
}

// AGGREGATE
export async function aggregateBackupCodesOrm(
  args?: Prisma.BackupCodeAggregateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.backupCode.aggregate(args ?? {});
}

export async function countBackupCodesOrm(
  args?: Prisma.BackupCodeCountArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.backupCode.count(args);
}

export async function groupByBackupCodesOrm(
  args: Prisma.BackupCodeGroupByArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.backupCode.groupBy(args);
}

//==============================================================================
// PASSKEY CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createPasskeyOrm(
  args: Prisma.PasskeyCreateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.passkey.create(args);
}

export async function createManyPasskeysOrm(
  args: Prisma.PasskeyCreateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.passkey.createMany(args);
}

// READ
export async function findFirstPasskeyOrm(
  args?: Prisma.PasskeyFindFirstArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.passkey.findFirst(args);
}

export async function findUniquePasskeyOrm(
  args: Prisma.PasskeyFindUniqueArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.passkey.findUnique(args);
}

export async function findUniquePasskeyOrmOrThrow(
  args: Prisma.PasskeyFindUniqueOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.passkey.findUniqueOrThrow(args);
}

export async function findFirstPasskeyOrmOrThrow(
  args: Prisma.PasskeyFindFirstOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.passkey.findFirstOrThrow(args);
}

export async function findManyPasskeysOrm(
  args?: Prisma.PasskeyFindManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.passkey.findMany(args);
}

// UPDATE
export async function updatePasskeyOrm(
  args: Prisma.PasskeyUpdateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.passkey.update(args);
}

export async function updateManyPasskeysOrm(
  args: Prisma.PasskeyUpdateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.passkey.updateMany(args);
}

// UPSERT
export async function upsertPasskeyOrm(
  args: Prisma.PasskeyUpsertArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.passkey.upsert(args);
}

// DELETE
export async function deletePasskeyOrm(
  args: Prisma.PasskeyDeleteArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.passkey.delete(args);
}

export async function deleteManyPasskeysOrm(
  args?: Prisma.PasskeyDeleteManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.passkey.deleteMany(args);
}

// AGGREGATE
export async function aggregatePasskeysOrm(
  args?: Prisma.PasskeyAggregateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.passkey.aggregate(args ?? {});
}

export async function countPasskeysOrm(
  args?: Prisma.PasskeyCountArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.passkey.count(args);
}

export async function groupByPasskeysOrm(
  args: Prisma.PasskeyGroupByArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.passkey.groupBy(args);
}

//==============================================================================
// AUDITLOG CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createAuditLogOrm(
  args: Prisma.AuditLogCreateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.auditLog.create(args);
}

export async function createManyAuditLogsOrm(
  args: Prisma.AuditLogCreateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.auditLog.createMany(args);
}

// READ
export async function findFirstAuditLogOrm(
  args?: Prisma.AuditLogFindFirstArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.auditLog.findFirst(args);
}

export async function findUniqueAuditLogOrm(
  args: Prisma.AuditLogFindUniqueArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.auditLog.findUnique(args);
}

export async function findUniqueAuditLogOrmOrThrow(
  args: Prisma.AuditLogFindUniqueOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.auditLog.findUniqueOrThrow(args);
}

export async function findFirstAuditLogOrmOrThrow(
  args: Prisma.AuditLogFindFirstOrThrowArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.auditLog.findFirstOrThrow(args);
}

export async function findManyAuditLogsOrm(
  args?: Prisma.AuditLogFindManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.auditLog.findMany(args);
}

// UPDATE
export async function updateAuditLogOrm(
  args: Prisma.AuditLogUpdateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.auditLog.update(args);
}

export async function updateManyAuditLogsOrm(
  args: Prisma.AuditLogUpdateManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.auditLog.updateMany(args);
}

// UPSERT
export async function upsertAuditLogOrm(
  args: Prisma.AuditLogUpsertArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.auditLog.upsert(args);
}

// DELETE
export async function deleteAuditLogOrm(
  args: Prisma.AuditLogDeleteArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.auditLog.delete(args);
}

export async function deleteManyAuditLogsOrm(
  args?: Prisma.AuditLogDeleteManyArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.auditLog.deleteMany(args);
}

// AGGREGATE
export async function aggregateAuditLogsOrm(
  args?: Prisma.AuditLogAggregateArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.auditLog.aggregate(args ?? {});
}

export async function countAuditLogsOrm(
  args?: Prisma.AuditLogCountArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return prisma.auditLog.count(args);
}

export async function groupByAuditLogsOrm(
  args: Prisma.AuditLogGroupByArgs,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return await prisma.auditLog.groupBy(args);
}

//==============================================================================
// ENHANCED MULTI-MODEL AUTH OPERATIONS
//==============================================================================

/**
 * Find user with complete authentication context
 */
export async function findUserWithAuthContextOrm(
  where: Prisma.UserWhereUniqueInput,
  prisma: PrismaTransaction = defaultPrisma,
): Promise<Prisma.UserGetPayload<{
  include: {
    accounts: true;
    sessions: true;
    apiKeys: true;
    twoFactor: {
      include: {
        backupCodes: true;
      };
    };
    passkeys: true;
  };
}> | null> {
  return await prisma.user.findUnique({
    where,
    include: {
      accounts: true,
      sessions: true,
      apiKeys: true,
      twoFactor: {
        include: {
          backupCodes: true,
        },
      },
      passkeys: true,
    },
  });
}

/**
 * Find organization with all members and teams
 */
export async function findOrganizationWithMembersOrm(
  where: Prisma.OrganizationWhereUniqueInput,
  prisma: PrismaTransaction = defaultPrisma,
) {
  return await prisma.organization.findUnique({
    where,
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      },
      teams: {
        include: {
          teamMembers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      },
      invitations: true,
    },
  });
}

/**
 * Create user with organization membership in a transaction
 */
export async function createUserWithOrganizationOrm(
  userData: Prisma.UserCreateInput,
  organizationId: string,
  role: 'OWNER' | 'ADMIN' | 'MEMBER' = 'MEMBER',
  prismaClient: PrismaTransaction = defaultPrisma,
): Promise<
  Prisma.UserGetPayload<{
    include: {
      members: {
        include: {
          organization: true;
        };
      };
    };
  }>
> {
  return await prismaClient.$transaction(async (tx: PrismaTransaction) => {
    // Create the user
    const user = await tx.user.create({
      data: userData,
    });

    // Create organization membership
    await tx.member.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        organizationId,
        role,
        createdAt: new Date(),
      },
    });

    // Return user with members
    return await tx.user.findUniqueOrThrow({
      where: { id: user.id },
      include: {
        members: {
          include: {
            organization: true,
          },
        },
      },
    });
  });
}

//==============================================================================
// TYPE DEFINITIONS FOR AUTH PAYLOADS
//==============================================================================

/**
 * User with complete authentication context
 */
export type UserWithAuthContext = Prisma.UserGetPayload<{
  include: {
    accounts: true;
    sessions: true;
    apiKeys: true;
    twoFactor: {
      include: {
        backupCodes: true;
      };
    };
    passkeys: true;
  };
}>;

/**
 * Organization with members and teams
 */
export type OrganizationWithMembers = Prisma.OrganizationGetPayload<{
  include: {
    members: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
            image: true;
          };
        };
      };
    };
    teams: {
      include: {
        teamMembers: {
          include: {
            user: {
              select: {
                id: true;
                name: true;
                email: true;
                image: true;
              };
            };
          };
        };
      };
    };
    invitations: true;
  };
}>;
