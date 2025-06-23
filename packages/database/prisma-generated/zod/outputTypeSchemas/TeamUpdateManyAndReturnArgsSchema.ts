import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamUpdateManyMutationInputSchema } from '../inputTypeSchemas/TeamUpdateManyMutationInputSchema';
import { TeamUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/TeamUncheckedUpdateManyInputSchema';
import { TeamWhereInputSchema } from '../inputTypeSchemas/TeamWhereInputSchema';

export const TeamUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.TeamUpdateManyAndReturnArgs> = z
  .object({
    data: z.union([TeamUpdateManyMutationInputSchema, TeamUncheckedUpdateManyInputSchema]),
    where: TeamWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default TeamUpdateManyAndReturnArgsSchema;
