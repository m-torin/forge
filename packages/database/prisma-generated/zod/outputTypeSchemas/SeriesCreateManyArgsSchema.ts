import { z } from 'zod';
import type { Prisma } from '../../client';
import { SeriesCreateManyInputSchema } from '../inputTypeSchemas/SeriesCreateManyInputSchema'

export const SeriesCreateManyArgsSchema: z.ZodType<Prisma.SeriesCreateManyArgs> = z.object({
  data: z.union([ SeriesCreateManyInputSchema,SeriesCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default SeriesCreateManyArgsSchema;
