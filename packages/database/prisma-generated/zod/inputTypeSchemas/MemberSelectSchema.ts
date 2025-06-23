import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { OrganizationArgsSchema } from '../outputTypeSchemas/OrganizationArgsSchema';

export const MemberSelectSchema: z.ZodType<Prisma.MemberSelect> = z
  .object({
    id: z.boolean().optional(),
    userId: z.boolean().optional(),
    organizationId: z.boolean().optional(),
    role: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    organization: z.union([z.boolean(), z.lazy(() => OrganizationArgsSchema)]).optional(),
  })
  .strict();

export default MemberSelectSchema;
