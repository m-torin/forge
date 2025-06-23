import type { Prisma } from '../../client';

import { z } from 'zod';

export const TeamCreateManyInputSchema: z.ZodType<Prisma.TeamCreateManyInput> = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    organizationId: z.string(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional().nullable(),
  })
  .strict();

export default TeamCreateManyInputSchema;
