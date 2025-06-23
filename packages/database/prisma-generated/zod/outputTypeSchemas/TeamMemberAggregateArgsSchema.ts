import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamMemberWhereInputSchema } from '../inputTypeSchemas/TeamMemberWhereInputSchema';
import { TeamMemberOrderByWithRelationInputSchema } from '../inputTypeSchemas/TeamMemberOrderByWithRelationInputSchema';
import { TeamMemberWhereUniqueInputSchema } from '../inputTypeSchemas/TeamMemberWhereUniqueInputSchema';

export const TeamMemberAggregateArgsSchema: z.ZodType<Prisma.TeamMemberAggregateArgs> = z
  .object({
    where: TeamMemberWhereInputSchema.optional(),
    orderBy: z
      .union([
        TeamMemberOrderByWithRelationInputSchema.array(),
        TeamMemberOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: TeamMemberWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default TeamMemberAggregateArgsSchema;
