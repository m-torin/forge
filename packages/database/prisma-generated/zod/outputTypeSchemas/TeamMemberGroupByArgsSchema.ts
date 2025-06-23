import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamMemberWhereInputSchema } from '../inputTypeSchemas/TeamMemberWhereInputSchema';
import { TeamMemberOrderByWithAggregationInputSchema } from '../inputTypeSchemas/TeamMemberOrderByWithAggregationInputSchema';
import { TeamMemberScalarFieldEnumSchema } from '../inputTypeSchemas/TeamMemberScalarFieldEnumSchema';
import { TeamMemberScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/TeamMemberScalarWhereWithAggregatesInputSchema';

export const TeamMemberGroupByArgsSchema: z.ZodType<Prisma.TeamMemberGroupByArgs> = z
  .object({
    where: TeamMemberWhereInputSchema.optional(),
    orderBy: z
      .union([
        TeamMemberOrderByWithAggregationInputSchema.array(),
        TeamMemberOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: TeamMemberScalarFieldEnumSchema.array(),
    having: TeamMemberScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default TeamMemberGroupByArgsSchema;
