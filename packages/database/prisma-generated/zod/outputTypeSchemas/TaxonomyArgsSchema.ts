import { z } from 'zod';
import type { Prisma } from '../../client';
import { TaxonomySelectSchema } from '../inputTypeSchemas/TaxonomySelectSchema';
import { TaxonomyIncludeSchema } from '../inputTypeSchemas/TaxonomyIncludeSchema';

export const TaxonomyArgsSchema: z.ZodType<Prisma.TaxonomyDefaultArgs> = z.object({
  select: z.lazy(() => TaxonomySelectSchema).optional(),
  include: z.lazy(() => TaxonomyIncludeSchema).optional(),
}).strict();

export default TaxonomyArgsSchema;
