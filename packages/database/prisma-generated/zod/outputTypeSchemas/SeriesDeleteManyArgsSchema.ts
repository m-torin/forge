import { z } from 'zod';
import type { Prisma } from '../../client';
import { SeriesWhereInputSchema } from '../inputTypeSchemas/SeriesWhereInputSchema'

export const SeriesDeleteManyArgsSchema: z.ZodType<Prisma.SeriesDeleteManyArgs> = z.object({
  where: SeriesWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default SeriesDeleteManyArgsSchema;
