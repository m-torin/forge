import { z } from 'zod';
import type { Prisma } from '../../client';
import { SeriesUpdateManyMutationInputSchema } from '../inputTypeSchemas/SeriesUpdateManyMutationInputSchema';
import { SeriesUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/SeriesUncheckedUpdateManyInputSchema';
import { SeriesWhereInputSchema } from '../inputTypeSchemas/SeriesWhereInputSchema';

export const SeriesUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.SeriesUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([SeriesUpdateManyMutationInputSchema, SeriesUncheckedUpdateManyInputSchema]),
      where: SeriesWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default SeriesUpdateManyAndReturnArgsSchema;
