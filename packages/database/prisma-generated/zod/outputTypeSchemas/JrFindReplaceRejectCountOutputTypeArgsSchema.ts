import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrFindReplaceRejectCountOutputTypeSelectSchema } from './JrFindReplaceRejectCountOutputTypeSelectSchema';

export const JrFindReplaceRejectCountOutputTypeArgsSchema: z.ZodType<Prisma.JrFindReplaceRejectCountOutputTypeDefaultArgs> =
  z
    .object({
      select: z.lazy(() => JrFindReplaceRejectCountOutputTypeSelectSchema).nullish(),
    })
    .strict();

export default JrFindReplaceRejectCountOutputTypeSelectSchema;
