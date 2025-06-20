import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamMemberUpdateManyMutationInputSchema } from '../inputTypeSchemas/TeamMemberUpdateManyMutationInputSchema'
import { TeamMemberUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/TeamMemberUncheckedUpdateManyInputSchema'
import { TeamMemberWhereInputSchema } from '../inputTypeSchemas/TeamMemberWhereInputSchema'

export const TeamMemberUpdateManyArgsSchema: z.ZodType<Prisma.TeamMemberUpdateManyArgs> = z.object({
  data: z.union([ TeamMemberUpdateManyMutationInputSchema,TeamMemberUncheckedUpdateManyInputSchema ]),
  where: TeamMemberWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default TeamMemberUpdateManyArgsSchema;
