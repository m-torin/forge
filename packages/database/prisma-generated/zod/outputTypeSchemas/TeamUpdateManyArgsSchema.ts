import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamUpdateManyMutationInputSchema } from '../inputTypeSchemas/TeamUpdateManyMutationInputSchema';
import { TeamUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/TeamUncheckedUpdateManyInputSchema';
import { TeamWhereInputSchema } from '../inputTypeSchemas/TeamWhereInputSchema';

export const TeamUpdateManyArgsSchema: z.ZodType<Prisma.TeamUpdateManyArgs> = z
  .object({
    data: z.union([TeamUpdateManyMutationInputSchema, TeamUncheckedUpdateManyInputSchema]),
    where: TeamWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default TeamUpdateManyArgsSchema;
