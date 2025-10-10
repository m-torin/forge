// Import from the Prisma namespace through the main client
import type { Prisma } from '@repo/db-prisma/client';

// CompanyContent types
export type CompanyContent = Prisma.CompanyContentModel;
export type CompanyContentCreateInput = Prisma.CompanyContentCreateInput;
export type CompanyContentInclude = Prisma.CompanyContentInclude;
export type CompanyContentOrderByWithRelationInput = Prisma.CompanyContentOrderByWithRelationInput;
export type CompanyContentSelect = Prisma.CompanyContentSelect;
export type CompanyContentUpdateInput = Prisma.CompanyContentUpdateInput;
export type CompanyContentWhereInput = Prisma.CompanyContentWhereInput;
export type CompanyContentWhereUniqueInput = Prisma.CompanyContentWhereUniqueInput;

// CompanyMember types
export type CompanyMember = Prisma.CompanyMemberModel;
export type CompanyMemberCreateInput = Prisma.CompanyMemberCreateInput;
export type CompanyMemberInclude = Prisma.CompanyMemberInclude;
export type CompanyMemberOrderByWithRelationInput = Prisma.CompanyMemberOrderByWithRelationInput;
export type CompanyMemberSelect = Prisma.CompanyMemberSelect;
export type CompanyMemberUpdateInput = Prisma.CompanyMemberUpdateInput;
export type CompanyMemberWhereInput = Prisma.CompanyMemberWhereInput;
export type CompanyMemberWhereUniqueInput = Prisma.CompanyMemberWhereUniqueInput;

// CompanyStatistic types
export type CompanyStatistic = Prisma.CompanyStatisticModel;
export type CompanyStatisticCreateInput = Prisma.CompanyStatisticCreateInput;
export type CompanyStatisticInclude = Prisma.CompanyStatisticInclude;
export type CompanyStatisticOrderByWithRelationInput =
  Prisma.CompanyStatisticOrderByWithRelationInput;
export type CompanyStatisticSelect = Prisma.CompanyStatisticSelect;
export type CompanyStatisticUpdateInput = Prisma.CompanyStatisticUpdateInput;
export type CompanyStatisticWhereInput = Prisma.CompanyStatisticWhereInput;
export type CompanyStatisticWhereUniqueInput = Prisma.CompanyStatisticWhereUniqueInput;

// SystemSetting types
export type SystemSetting = Prisma.SystemSettingModel;
export type SystemSettingCreateInput = Prisma.SystemSettingCreateInput;
export type SystemSettingInclude = Prisma.SystemSettingInclude;
export type SystemSettingOrderByWithRelationInput = Prisma.SystemSettingOrderByWithRelationInput;
export type SystemSettingSelect = Prisma.SystemSettingSelect;
export type SystemSettingUpdateInput = Prisma.SystemSettingUpdateInput;
export type SystemSettingWhereInput = Prisma.SystemSettingWhereInput;
export type SystemSettingWhereUniqueInput = Prisma.SystemSettingWhereUniqueInput;

// CMS enums (single import provides both type and runtime value)
export { ContentStatus, SettingDataType } from '@repo/db-prisma/enums';
