import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrFindReplaceRejectCreateManyInputSchema } from '../inputTypeSchemas/JrFindReplaceRejectCreateManyInputSchema';

export const JrFindReplaceRejectCreateManyArgsSchema: z.ZodType<Prisma.JrFindReplaceRejectCreateManyArgs> =
  z
    .object({
      data: z.union([
        JrFindReplaceRejectCreateManyInputSchema,
        JrFindReplaceRejectCreateManyInputSchema.array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default JrFindReplaceRejectCreateManyArgsSchema;
