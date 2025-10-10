import { getDefaultClientSync } from '../../node';
import type { Prisma } from '../../types';
import type { PrismaTransactionClient } from '../types';
import { handlePrismaError } from '../utils';

//==============================================================================
// USER CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createUserOrm(args: Prisma.UserCreateArgs, client?: PrismaTransactionClient) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.user.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstUserOrm(
  args?: Prisma.UserFindFirstArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.user.findFirst(args);
}

export async function findUniqueUserOrm(
  args: Prisma.UserFindUniqueArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.user.findUnique(args);
}

export async function findManyUsersOrm(
  args?: Prisma.UserFindManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.user.findMany(args);
}

// UPDATE
export async function updateUserOrm(args: Prisma.UserUpdateArgs, client?: PrismaTransactionClient) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.user.update(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function updateManyUsersOrm(
  args: Prisma.UserUpdateManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.user.updateMany(args);
}

// UPSERT
export async function upsertUserOrm(args: Prisma.UserUpsertArgs, client?: PrismaTransactionClient) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.user.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteUserOrm(args: Prisma.UserDeleteArgs, client?: PrismaTransactionClient) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.user.delete(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function deleteManyUsersOrm(
  args?: Prisma.UserDeleteManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.user.deleteMany(args);
}

// AGGREGATE
export async function aggregateUsersOrm(
  args?: Prisma.UserAggregateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.user.aggregate(args ?? {});
}

export async function countUsersOrm(args?: Prisma.UserCountArgs, client?: PrismaTransactionClient) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.user.count(args);
}

export async function groupByUsersOrm(
  args: Prisma.UserGroupByArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.user.groupBy(args);
}

//==============================================================================
// SESSION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createSessionOrm(
  args: Prisma.SessionCreateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.session.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstSessionOrm(
  args?: Prisma.SessionFindFirstArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.session.findFirst(args);
}

export async function findUniqueSessionOrm(
  args: Prisma.SessionFindUniqueArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.session.findUnique(args);
}

export async function findManySessionsOrm(
  args?: Prisma.SessionFindManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.session.findMany(args);
}

// UPDATE
export async function updateSessionOrm(
  args: Prisma.SessionUpdateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.session.update(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function updateManySessionsOrm(
  args: Prisma.SessionUpdateManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.session.updateMany(args);
}

// UPSERT
export async function upsertSessionOrm(
  args: Prisma.SessionUpsertArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.session.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteSessionOrm(
  args: Prisma.SessionDeleteArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.session.delete(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function deleteManySessionsOrm(
  args?: Prisma.SessionDeleteManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.session.deleteMany(args);
}

// AGGREGATE
export async function aggregateSessionsOrm(
  args?: Prisma.SessionAggregateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.session.aggregate(args ?? {});
}

export async function countSessionsOrm(
  args?: Prisma.SessionCountArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.session.count(args);
}

export async function groupBySessionsOrm(
  args: Prisma.SessionGroupByArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.session.groupBy(args);
}

//==============================================================================
// ACCOUNT CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createAccountOrm(
  args: Prisma.AccountCreateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.account.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstAccountOrm(
  args?: Prisma.AccountFindFirstArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.account.findFirst(args);
}

export async function findUniqueAccountOrm(
  args: Prisma.AccountFindUniqueArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.account.findUnique(args);
}

export async function findManyAccountsOrm(
  args?: Prisma.AccountFindManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.account.findMany(args);
}

// UPDATE
export async function updateAccountOrm(
  args: Prisma.AccountUpdateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.account.update(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function updateManyAccountsOrm(
  args: Prisma.AccountUpdateManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.account.updateMany(args);
}

// UPSERT
export async function upsertAccountOrm(
  args: Prisma.AccountUpsertArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.account.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteAccountOrm(
  args: Prisma.AccountDeleteArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.account.delete(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function deleteManyAccountsOrm(
  args?: Prisma.AccountDeleteManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.account.deleteMany(args);
}

// AGGREGATE
export async function aggregateAccountsOrm(
  args?: Prisma.AccountAggregateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.account.aggregate(args ?? {});
}

export async function countAccountsOrm(
  args?: Prisma.AccountCountArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.account.count(args);
}

export async function groupByAccountsOrm(
  args: Prisma.AccountGroupByArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.account.groupBy(args);
}

//==============================================================================
// VERIFICATION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createVerificationOrm(
  args: Prisma.VerificationCreateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.verification.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstVerificationOrm(
  args?: Prisma.VerificationFindFirstArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.verification.findFirst(args);
}

export async function findUniqueVerificationOrm(
  args: Prisma.VerificationFindUniqueArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.verification.findUnique(args);
}

export async function findManyVerificationsOrm(
  args?: Prisma.VerificationFindManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.verification.findMany(args);
}

// UPDATE
export async function updateVerificationOrm(
  args: Prisma.VerificationUpdateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.verification.update(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function updateManyVerificationsOrm(
  args: Prisma.VerificationUpdateManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.verification.updateMany(args);
}

// UPSERT
export async function upsertVerificationOrm(
  args: Prisma.VerificationUpsertArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.verification.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteVerificationOrm(
  args: Prisma.VerificationDeleteArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.verification.delete(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function deleteManyVerificationsOrm(
  args?: Prisma.VerificationDeleteManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.verification.deleteMany(args);
}

// AGGREGATE
export async function aggregateVerificationsOrm(
  args?: Prisma.VerificationAggregateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.verification.aggregate(args ?? {});
}

export async function countVerificationsOrm(
  args?: Prisma.VerificationCountArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.verification.count(args);
}

export async function groupByVerificationsOrm(
  args: Prisma.VerificationGroupByArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.verification.groupBy(args);
}

//==============================================================================
// ORGANIZATION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createOrganizationOrm(
  args: Prisma.OrganizationCreateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.organization.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstOrganizationOrm(
  args?: Prisma.OrganizationFindFirstArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.organization.findFirst(args);
}

export async function findUniqueOrganizationOrm(
  args: Prisma.OrganizationFindUniqueArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.organization.findUnique(args);
}

export async function findManyOrganizationsOrm(
  args?: Prisma.OrganizationFindManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.organization.findMany(args);
}

// UPDATE
export async function updateOrganizationOrm(
  args: Prisma.OrganizationUpdateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.organization.update(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function updateManyOrganizationsOrm(
  args: Prisma.OrganizationUpdateManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.organization.updateMany(args);
}

// UPSERT
export async function upsertOrganizationOrm(
  args: Prisma.OrganizationUpsertArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.organization.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteOrganizationOrm(
  args: Prisma.OrganizationDeleteArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.organization.delete(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function deleteManyOrganizationsOrm(
  args?: Prisma.OrganizationDeleteManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.organization.deleteMany(args);
}

// AGGREGATE
export async function aggregateOrganizationsOrm(
  args?: Prisma.OrganizationAggregateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.organization.aggregate(args ?? {});
}

export async function countOrganizationsOrm(
  args?: Prisma.OrganizationCountArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.organization.count(args);
}

export async function groupByOrganizationsOrm(
  args: Prisma.OrganizationGroupByArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.organization.groupBy(args);
}

//==============================================================================
// MEMBER CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createMemberOrm(
  args: Prisma.MemberCreateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.member.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstMemberOrm(
  args?: Prisma.MemberFindFirstArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.member.findFirst(args);
}

export async function findUniqueMemberOrm(
  args: Prisma.MemberFindUniqueArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.member.findUnique(args);
}

export async function findManyMembersOrm(
  args?: Prisma.MemberFindManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.member.findMany(args);
}

// UPDATE
export async function updateMemberOrm(
  args: Prisma.MemberUpdateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.member.update(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function updateManyMembersOrm(
  args: Prisma.MemberUpdateManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.member.updateMany(args);
}

// UPSERT
export async function upsertMemberOrm(
  args: Prisma.MemberUpsertArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.member.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteMemberOrm(
  args: Prisma.MemberDeleteArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.member.delete(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function deleteManyMembersOrm(
  args?: Prisma.MemberDeleteManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.member.deleteMany(args);
}

// AGGREGATE
export async function aggregateMembersOrm(
  args?: Prisma.MemberAggregateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.member.aggregate(args ?? {});
}

export async function countMembersOrm(
  args?: Prisma.MemberCountArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.member.count(args);
}

export async function groupByMembersOrm(
  args: Prisma.MemberGroupByArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.member.groupBy(args);
}

//==============================================================================
// TEAM CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createTeamOrm(
  args: Prisma.OrganizationCreateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.team.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstTeamOrm(
  args?: Prisma.OrganizationFindFirstArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.team.findFirst(args);
}

export async function findUniqueTeamOrm(
  args: Prisma.OrganizationFindUniqueArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.team.findUnique(args);
}

export async function findManyTeamsOrm(
  args?: Prisma.OrganizationFindManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.team.findMany(args);
}

// UPDATE
export async function updateTeamOrm(
  args: Prisma.OrganizationUpdateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.team.update(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function updateManyTeamsOrm(
  args: Prisma.OrganizationUpdateManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.team.updateMany(args);
}

// UPSERT
export async function upsertTeamOrm(
  args: Prisma.OrganizationUpsertArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.team.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteTeamOrm(
  args: Prisma.OrganizationDeleteArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.team.delete(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function deleteManyTeamsOrm(
  args?: Prisma.OrganizationDeleteManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.team.deleteMany(args);
}

// AGGREGATE
export async function aggregateTeamsOrm(
  args?: Prisma.OrganizationAggregateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.team.aggregate(args ?? {});
}

export async function countTeamsOrm(
  args?: Prisma.OrganizationCountArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.team.count(args);
}

export async function groupByTeamsOrm(
  args: Prisma.OrganizationGroupByArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.team.groupBy(args);
}

//==============================================================================
// TEAMMEMBER CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createTeamMemberOrm(
  args: Prisma.MemberCreateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.teamMember.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstTeamMemberOrm(
  args?: Prisma.MemberFindFirstArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.teamMember.findFirst(args);
}

export async function findUniqueTeamMemberOrm(
  args: Prisma.MemberFindUniqueArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.teamMember.findUnique(args);
}

export async function findManyTeamMembersOrm(
  args?: Prisma.MemberFindManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.teamMember.findMany(args);
}

// UPDATE
export async function updateTeamMemberOrm(
  args: Prisma.MemberUpdateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.teamMember.update(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function updateManyTeamMembersOrm(
  args: Prisma.MemberUpdateManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.teamMember.updateMany(args);
}

// UPSERT
export async function upsertTeamMemberOrm(
  args: Prisma.MemberUpsertArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.teamMember.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteTeamMemberOrm(
  args: Prisma.MemberDeleteArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.teamMember.delete(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function deleteManyTeamMembersOrm(
  args?: Prisma.MemberDeleteManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.teamMember.deleteMany(args);
}

// AGGREGATE
export async function aggregateTeamMembersOrm(
  args?: Prisma.MemberAggregateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.teamMember.aggregate(args ?? {});
}

export async function countTeamMembersOrm(
  args?: Prisma.MemberCountArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.teamMember.count(args);
}

export async function groupByTeamMembersOrm(
  args: Prisma.MemberGroupByArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.teamMember.groupBy(args);
}

//==============================================================================
// INVITATION CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createInvitationOrm(
  args: Prisma.InvitationCreateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.invitation.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstInvitationOrm(
  args?: Prisma.InvitationFindFirstArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.invitation.findFirst(args);
}

export async function findUniqueInvitationOrm(
  args: Prisma.InvitationFindUniqueArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.invitation.findUnique(args);
}

export async function findManyInvitationsOrm(
  args?: Prisma.InvitationFindManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.invitation.findMany(args);
}

// UPDATE
export async function updateInvitationOrm(
  args: Prisma.InvitationUpdateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.invitation.update(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function updateManyInvitationsOrm(
  args: Prisma.InvitationUpdateManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.invitation.updateMany(args);
}

// UPSERT
export async function upsertInvitationOrm(
  args: Prisma.InvitationUpsertArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.invitation.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteInvitationOrm(
  args: Prisma.InvitationDeleteArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.invitation.delete(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function deleteManyInvitationsOrm(
  args?: Prisma.InvitationDeleteManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.invitation.deleteMany(args);
}

// AGGREGATE
export async function aggregateInvitationsOrm(
  args?: Prisma.InvitationAggregateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.invitation.aggregate(args ?? {});
}

export async function countInvitationsOrm(
  args?: Prisma.InvitationCountArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.invitation.count(args);
}

export async function groupByInvitationsOrm(
  args: Prisma.InvitationGroupByArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.invitation.groupBy(args);
}

//==============================================================================
// TWOFACTOR CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createTwoFactorOrm(
  args: Prisma.TwoFactorCreateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.twoFactor.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstTwoFactorOrm(
  args?: Prisma.TwoFactorFindFirstArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.twoFactor.findFirst(args);
}

export async function findUniqueTwoFactorOrm(
  args: Prisma.TwoFactorFindUniqueArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.twoFactor.findUnique(args);
}

export async function findManyTwoFactorsOrm(
  args?: Prisma.TwoFactorFindManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.twoFactor.findMany(args);
}

// UPDATE
export async function updateTwoFactorOrm(
  args: Prisma.TwoFactorUpdateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.twoFactor.update(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function updateManyTwoFactorsOrm(
  args: Prisma.TwoFactorUpdateManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.twoFactor.updateMany(args);
}

// UPSERT
export async function upsertTwoFactorOrm(
  args: Prisma.TwoFactorUpsertArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.twoFactor.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deleteTwoFactorOrm(
  args: Prisma.TwoFactorDeleteArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.twoFactor.delete(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function deleteManyTwoFactorsOrm(
  args?: Prisma.TwoFactorDeleteManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.twoFactor.deleteMany(args);
}

// AGGREGATE
export async function aggregateTwoFactorsOrm(
  args?: Prisma.TwoFactorAggregateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.twoFactor.aggregate(args ?? {});
}

export async function countTwoFactorsOrm(
  args?: Prisma.TwoFactorCountArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.twoFactor.count(args);
}

export async function groupByTwoFactorsOrm(
  args: Prisma.TwoFactorGroupByArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.twoFactor.groupBy(args);
}

//==============================================================================
// PASSKEY CRUD OPERATIONS
//==============================================================================

// CREATE
export async function createPasskeyOrm(
  args: Prisma.PasskeyCreateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.passkey.create(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// READ
export async function findFirstPasskeyOrm(
  args?: Prisma.PasskeyFindFirstArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.passkey.findFirst(args);
}

export async function findUniquePasskeyOrm(
  args: Prisma.PasskeyFindUniqueArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.passkey.findUnique(args);
}

export async function findManyPasskeysOrm(
  args?: Prisma.PasskeyFindManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.passkey.findMany(args);
}

// UPDATE
export async function updatePasskeyOrm(
  args: Prisma.PasskeyUpdateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.passkey.update(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function updateManyPasskeysOrm(
  args: Prisma.PasskeyUpdateManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.passkey.updateMany(args);
}

// UPSERT
export async function upsertPasskeyOrm(
  args: Prisma.PasskeyUpsertArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.passkey.upsert(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

// DELETE
export async function deletePasskeyOrm(
  args: Prisma.PasskeyDeleteArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.passkey.delete(args);
  } catch (error) {
    handlePrismaError(error);
  }
}

export async function deleteManyPasskeysOrm(
  args?: Prisma.PasskeyDeleteManyArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.passkey.deleteMany(args);
}

// AGGREGATE
export async function aggregatePasskeysOrm(
  args?: Prisma.PasskeyAggregateArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.passkey.aggregate(args ?? {});
}

export async function countPasskeysOrm(
  args?: Prisma.PasskeyCountArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.passkey.count(args);
}

export async function groupByPasskeysOrm(
  args: Prisma.PasskeyGroupByArgs,
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
  return await prisma.passkey.groupBy(args);
}

//==============================================================================
// ENHANCED MULTI-MODEL AUTH OPERATIONS
//==============================================================================

/**
 * Find user with complete authentication context
 */
export async function findUserWithAuthContextOrm(
  where: Prisma.UserWhereUniqueInput,
  client?: PrismaTransactionClient,
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
  const prisma = (client || getDefaultClientSync()) as any;
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
  client?: PrismaTransactionClient,
) {
  const prisma = (client || getDefaultClientSync()) as any;
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
  client?: PrismaTransactionClient,
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
  const prisma = (client || getDefaultClientSync()) as any;
  try {
    return await prisma.$transaction(async (tx: any) => {
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
  } catch (error) {
    throw handlePrismaError(error);
  }
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
