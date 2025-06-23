import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamWhereInputSchema } from '../inputTypeSchemas/TeamWhereInputSchema';

export const TeamDeleteManyArgsSchema: z.ZodType<Prisma.TeamDeleteManyArgs> = z
  .object({
    where: TeamWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default TeamDeleteManyArgsSchema;
