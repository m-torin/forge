import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamCreateManyInputSchema } from '../inputTypeSchemas/TeamCreateManyInputSchema';

export const TeamCreateManyArgsSchema: z.ZodType<Prisma.TeamCreateManyArgs> = z
  .object({
    data: z.union([TeamCreateManyInputSchema, TeamCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export default TeamCreateManyArgsSchema;
