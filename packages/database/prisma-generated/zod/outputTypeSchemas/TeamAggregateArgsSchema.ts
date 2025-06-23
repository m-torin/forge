import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamWhereInputSchema } from '../inputTypeSchemas/TeamWhereInputSchema';
import { TeamOrderByWithRelationInputSchema } from '../inputTypeSchemas/TeamOrderByWithRelationInputSchema';
import { TeamWhereUniqueInputSchema } from '../inputTypeSchemas/TeamWhereUniqueInputSchema';

export const TeamAggregateArgsSchema: z.ZodType<Prisma.TeamAggregateArgs> = z
  .object({
    where: TeamWhereInputSchema.optional(),
    orderBy: z
      .union([TeamOrderByWithRelationInputSchema.array(), TeamOrderByWithRelationInputSchema])
      .optional(),
    cursor: TeamWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default TeamAggregateArgsSchema;
