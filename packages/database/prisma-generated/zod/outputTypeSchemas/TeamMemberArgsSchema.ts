import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamMemberSelectSchema } from '../inputTypeSchemas/TeamMemberSelectSchema';
import { TeamMemberIncludeSchema } from '../inputTypeSchemas/TeamMemberIncludeSchema';

export const TeamMemberArgsSchema: z.ZodType<Prisma.TeamMemberDefaultArgs> = z
  .object({
    select: z.lazy(() => TeamMemberSelectSchema).optional(),
    include: z.lazy(() => TeamMemberIncludeSchema).optional(),
  })
  .strict();

export default TeamMemberArgsSchema;
