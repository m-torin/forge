import type { Prisma } from '../../client';

import { z } from 'zod';

export const MemberCreateManyUserInputSchema: z.ZodType<Prisma.MemberCreateManyUserInput> = z
  .object({
    id: z.string(),
    organizationId: z.string(),
    role: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional().nullable(),
  })
  .strict();

export default MemberCreateManyUserInputSchema;
