// Import Prisma namespace for optimized tree-shaking
import type { Prisma } from '@repo/db-prisma/client';

// User types - using Prisma namespace to avoid loading massive User.ts file (15,087 lines)
export type { User } from '@repo/db-prisma/client';
export type UserCreateInput = Prisma.UserCreateInput;
export type UserInclude = Prisma.UserInclude;
export type UserOrderByWithRelationInput = Prisma.UserOrderByWithRelationInput;
export type UserSelect = Prisma.UserSelect;
export type UserUpdateInput = Prisma.UserUpdateInput;
export type UserWhereInput = Prisma.UserWhereInput;
export type UserWhereUniqueInput = Prisma.UserWhereUniqueInput;

// Session types - using Prisma namespace
export type { Session } from '@repo/db-prisma/client';
export type SessionCreateInput = Prisma.SessionCreateInput;
export type SessionInclude = Prisma.SessionInclude;
export type SessionOrderByWithRelationInput = Prisma.SessionOrderByWithRelationInput;
export type SessionSelect = Prisma.SessionSelect;
export type SessionUpdateInput = Prisma.SessionUpdateInput;
export type SessionWhereInput = Prisma.SessionWhereInput;
export type SessionWhereUniqueInput = Prisma.SessionWhereUniqueInput;

// Account types - using Prisma namespace
export type { Account } from '@repo/db-prisma/client';
export type AccountCreateInput = Prisma.AccountCreateInput;
export type AccountInclude = Prisma.AccountInclude;
export type AccountOrderByWithRelationInput = Prisma.AccountOrderByWithRelationInput;
export type AccountSelect = Prisma.AccountSelect;
export type AccountUpdateInput = Prisma.AccountUpdateInput;
export type AccountWhereInput = Prisma.AccountWhereInput;
export type AccountWhereUniqueInput = Prisma.AccountWhereUniqueInput;

// Organization types - using Prisma namespace
export type { Organization } from '@repo/db-prisma/client';
export type OrganizationCreateInput = Prisma.OrganizationCreateInput;
export type OrganizationInclude = Prisma.OrganizationInclude;
export type OrganizationOrderByWithRelationInput = Prisma.OrganizationOrderByWithRelationInput;
export type OrganizationSelect = Prisma.OrganizationSelect;
export type OrganizationUpdateInput = Prisma.OrganizationUpdateInput;
export type OrganizationWhereInput = Prisma.OrganizationWhereInput;
export type OrganizationWhereUniqueInput = Prisma.OrganizationWhereUniqueInput;

// Member types - using Prisma namespace
export type { Member } from '@repo/db-prisma/client';
export type MemberCreateInput = Prisma.MemberCreateInput;
export type MemberInclude = Prisma.MemberInclude;
export type MemberOrderByWithRelationInput = Prisma.MemberOrderByWithRelationInput;
export type MemberSelect = Prisma.MemberSelect;
export type MemberUpdateInput = Prisma.MemberUpdateInput;
export type MemberWhereInput = Prisma.MemberWhereInput;
export type MemberWhereUniqueInput = Prisma.MemberWhereUniqueInput;

// Team and TeamMember models do not exist in current schema - removed exports

// Invitation types - using Prisma namespace
export type { Invitation } from '@repo/db-prisma/client';
export type InvitationCreateInput = Prisma.InvitationCreateInput;
export type InvitationInclude = Prisma.InvitationInclude;
export type InvitationOrderByWithRelationInput = Prisma.InvitationOrderByWithRelationInput;
export type InvitationSelect = Prisma.InvitationSelect;
export type InvitationUpdateInput = Prisma.InvitationUpdateInput;
export type InvitationWhereInput = Prisma.InvitationWhereInput;
export type InvitationWhereUniqueInput = Prisma.InvitationWhereUniqueInput;

// ApiKey model does not exist in current schema - removed exports

// TwoFactor types - using Prisma namespace
export type { TwoFactor } from '@repo/db-prisma/client';
export type TwoFactorCreateInput = Prisma.TwoFactorCreateInput;
export type TwoFactorInclude = Prisma.TwoFactorInclude;
export type TwoFactorOrderByWithRelationInput = Prisma.TwoFactorOrderByWithRelationInput;
export type TwoFactorSelect = Prisma.TwoFactorSelect;
export type TwoFactorUpdateInput = Prisma.TwoFactorUpdateInput;
export type TwoFactorWhereInput = Prisma.TwoFactorWhereInput;
export type TwoFactorWhereUniqueInput = Prisma.TwoFactorWhereUniqueInput;

// BackupCode model does not exist in current schema - removed exports

// Passkey types - using Prisma namespace
export type { Passkey } from '@repo/db-prisma/client';
export type PasskeyCreateInput = Prisma.PasskeyCreateInput;
export type PasskeyInclude = Prisma.PasskeyInclude;
export type PasskeyOrderByWithRelationInput = Prisma.PasskeyOrderByWithRelationInput;
export type PasskeySelect = Prisma.PasskeySelect;
export type PasskeyUpdateInput = Prisma.PasskeyUpdateInput;
export type PasskeyWhereInput = Prisma.PasskeyWhereInput;
export type PasskeyWhereUniqueInput = Prisma.PasskeyWhereUniqueInput;

// Verification types - using Prisma namespace
export type { Verification } from '@repo/db-prisma/client';
export type VerificationCreateInput = Prisma.VerificationCreateInput;
// Note: VerificationInclude doesn't exist - Verification has no relations
// export type VerificationInclude = Prisma.VerificationInclude;
export type VerificationOrderByWithRelationInput = Prisma.VerificationOrderByWithRelationInput;
export type VerificationSelect = Prisma.VerificationSelect;
export type VerificationUpdateInput = Prisma.VerificationUpdateInput;
export type VerificationWhereInput = Prisma.VerificationWhereInput;
export type VerificationWhereUniqueInput = Prisma.VerificationWhereUniqueInput;

// AuditLog model does not exist in current schema - removed exports
