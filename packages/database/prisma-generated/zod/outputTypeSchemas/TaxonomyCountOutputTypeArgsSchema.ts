import { z } from 'zod';
import type { Prisma } from '../../client';
import { TaxonomyCountOutputTypeSelectSchema } from './TaxonomyCountOutputTypeSelectSchema';

export const TaxonomyCountOutputTypeArgsSchema: z.ZodType<Prisma.TaxonomyCountOutputTypeDefaultArgs> =
  z
    .object({
      select: z.lazy(() => TaxonomyCountOutputTypeSelectSchema).nullish(),
    })
    .strict();

export default TaxonomyCountOutputTypeSelectSchema;
