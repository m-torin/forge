import { z } from 'zod';
import type { Prisma } from '../../client';
import { TaxonomyCreateManyInputSchema } from '../inputTypeSchemas/TaxonomyCreateManyInputSchema';

export const TaxonomyCreateManyAndReturnArgsSchema: z.ZodType<Prisma.TaxonomyCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([TaxonomyCreateManyInputSchema, TaxonomyCreateManyInputSchema.array()]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default TaxonomyCreateManyAndReturnArgsSchema;
