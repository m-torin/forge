import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamSelectSchema } from '../inputTypeSchemas/TeamSelectSchema';
import { TeamIncludeSchema } from '../inputTypeSchemas/TeamIncludeSchema';

export const TeamArgsSchema: z.ZodType<Prisma.TeamDefaultArgs> = z
  .object({
    select: z.lazy(() => TeamSelectSchema).optional(),
    include: z.lazy(() => TeamIncludeSchema).optional(),
  })
  .strict();

export default TeamArgsSchema;
