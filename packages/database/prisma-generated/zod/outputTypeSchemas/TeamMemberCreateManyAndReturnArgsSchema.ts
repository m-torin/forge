import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamMemberCreateManyInputSchema } from '../inputTypeSchemas/TeamMemberCreateManyInputSchema'

export const TeamMemberCreateManyAndReturnArgsSchema: z.ZodType<Prisma.TeamMemberCreateManyAndReturnArgs> = z.object({
  data: z.union([ TeamMemberCreateManyInputSchema,TeamMemberCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default TeamMemberCreateManyAndReturnArgsSchema;
