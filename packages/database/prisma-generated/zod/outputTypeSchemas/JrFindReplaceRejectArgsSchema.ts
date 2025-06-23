import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrFindReplaceRejectSelectSchema } from '../inputTypeSchemas/JrFindReplaceRejectSelectSchema';
import { JrFindReplaceRejectIncludeSchema } from '../inputTypeSchemas/JrFindReplaceRejectIncludeSchema';

export const JrFindReplaceRejectArgsSchema: z.ZodType<Prisma.JrFindReplaceRejectDefaultArgs> = z
  .object({
    select: z.lazy(() => JrFindReplaceRejectSelectSchema).optional(),
    include: z.lazy(() => JrFindReplaceRejectIncludeSchema).optional(),
  })
  .strict();

export default JrFindReplaceRejectArgsSchema;
