import type { Prisma } from '../../client';

import { z } from 'zod';

export const MemberUserIdOrganizationIdCompoundUniqueInputSchema: z.ZodType<Prisma.MemberUserIdOrganizationIdCompoundUniqueInput> = z.object({
  userId: z.string(),
  organizationId: z.string()
}).strict();

export default MemberUserIdOrganizationIdCompoundUniqueInputSchema;
