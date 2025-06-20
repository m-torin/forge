import type { Prisma } from '../../client';

import { z } from 'zod';

export const TeamCreateManyOrganizationInputSchema: z.ZodType<Prisma.TeamCreateManyOrganizationInput> = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional().nullable()
}).strict();

export default TeamCreateManyOrganizationInputSchema;
