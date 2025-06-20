import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamMemberWhereInputSchema } from '../inputTypeSchemas/TeamMemberWhereInputSchema'

export const TeamMemberDeleteManyArgsSchema: z.ZodType<Prisma.TeamMemberDeleteManyArgs> = z.object({
  where: TeamMemberWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default TeamMemberDeleteManyArgsSchema;
