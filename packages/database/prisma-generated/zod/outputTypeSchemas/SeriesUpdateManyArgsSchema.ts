import { z } from 'zod';
import type { Prisma } from '../../client';
import { SeriesUpdateManyMutationInputSchema } from '../inputTypeSchemas/SeriesUpdateManyMutationInputSchema';
import { SeriesUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/SeriesUncheckedUpdateManyInputSchema';
import { SeriesWhereInputSchema } from '../inputTypeSchemas/SeriesWhereInputSchema';

export const SeriesUpdateManyArgsSchema: z.ZodType<Prisma.SeriesUpdateManyArgs> = z
  .object({
    data: z.union([SeriesUpdateManyMutationInputSchema, SeriesUncheckedUpdateManyInputSchema]),
    where: SeriesWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default SeriesUpdateManyArgsSchema;
