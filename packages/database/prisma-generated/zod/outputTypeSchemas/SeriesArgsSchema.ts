import { z } from 'zod';
import type { Prisma } from '../../client';
import { SeriesSelectSchema } from '../inputTypeSchemas/SeriesSelectSchema';
import { SeriesIncludeSchema } from '../inputTypeSchemas/SeriesIncludeSchema';

export const SeriesArgsSchema: z.ZodType<Prisma.SeriesDefaultArgs> = z
  .object({
    select: z.lazy(() => SeriesSelectSchema).optional(),
    include: z.lazy(() => SeriesIncludeSchema).optional(),
  })
  .strict();

export default SeriesArgsSchema;
