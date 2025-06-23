import { z } from 'zod';
import type { Prisma } from '../../client';
import { TaxonomyCreateManyInputSchema } from '../inputTypeSchemas/TaxonomyCreateManyInputSchema';

export const TaxonomyCreateManyArgsSchema: z.ZodType<Prisma.TaxonomyCreateManyArgs> = z
  .object({
    data: z.union([TaxonomyCreateManyInputSchema, TaxonomyCreateManyInputSchema.array()]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export default TaxonomyCreateManyArgsSchema;
