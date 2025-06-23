import type { Prisma } from '../../client';

import { z } from 'zod';

export const MemberCreateManyInputSchema: z.ZodType<Prisma.MemberCreateManyInput> = z
  .object({
    id: z.string(),
    userId: z.string(),
    organizationId: z.string(),
    role: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional().nullable(),
  })
  .strict();

export default MemberCreateManyInputSchema;
