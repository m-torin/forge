import { z } from 'zod';
import type { Prisma } from '../../client';
import { SeriesCountOutputTypeSelectSchema } from './SeriesCountOutputTypeSelectSchema';

export const SeriesCountOutputTypeArgsSchema: z.ZodType<Prisma.SeriesCountOutputTypeDefaultArgs> = z
  .object({
    select: z.lazy(() => SeriesCountOutputTypeSelectSchema).nullish(),
  })
  .strict();

export default SeriesCountOutputTypeSelectSchema;
