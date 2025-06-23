import { z } from 'zod';
import type { Prisma } from '../../client';
import { TaxonomyWhereInputSchema } from '../inputTypeSchemas/TaxonomyWhereInputSchema';

export const TaxonomyDeleteManyArgsSchema: z.ZodType<Prisma.TaxonomyDeleteManyArgs> = z
  .object({
    where: TaxonomyWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default TaxonomyDeleteManyArgsSchema;
