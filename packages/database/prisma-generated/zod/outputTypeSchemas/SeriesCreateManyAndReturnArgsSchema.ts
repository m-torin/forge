import { z } from 'zod';
import type { Prisma } from '../../client';
import { SeriesCreateManyInputSchema } from '../inputTypeSchemas/SeriesCreateManyInputSchema'

export const SeriesCreateManyAndReturnArgsSchema: z.ZodType<Prisma.SeriesCreateManyAndReturnArgs> = z.object({
  data: z.union([ SeriesCreateManyInputSchema,SeriesCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default SeriesCreateManyAndReturnArgsSchema;
