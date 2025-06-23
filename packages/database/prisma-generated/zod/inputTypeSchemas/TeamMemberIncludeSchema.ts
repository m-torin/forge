import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { TeamArgsSchema } from '../outputTypeSchemas/TeamArgsSchema';

export const TeamMemberIncludeSchema: z.ZodType<Prisma.TeamMemberInclude> = z
  .object({
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    team: z.union([z.boolean(), z.lazy(() => TeamArgsSchema)]).optional(),
  })
  .strict();

export default TeamMemberIncludeSchema;
