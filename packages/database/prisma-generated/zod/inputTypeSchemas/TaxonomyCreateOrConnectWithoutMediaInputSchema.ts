import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyCreateWithoutMediaInputSchema } from './TaxonomyCreateWithoutMediaInputSchema';
import { TaxonomyUncheckedCreateWithoutMediaInputSchema } from './TaxonomyUncheckedCreateWithoutMediaInputSchema';

export const TaxonomyCreateOrConnectWithoutMediaInputSchema: z.ZodType<Prisma.TaxonomyCreateOrConnectWithoutMediaInput> = z.object({
  where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutMediaInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutMediaInputSchema) ]),
}).strict();

export default TaxonomyCreateOrConnectWithoutMediaInputSchema;
