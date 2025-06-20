import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';
import { TaxonomyCreateWithoutCollectionsInputSchema } from './TaxonomyCreateWithoutCollectionsInputSchema';
import { TaxonomyUncheckedCreateWithoutCollectionsInputSchema } from './TaxonomyUncheckedCreateWithoutCollectionsInputSchema';

export const TaxonomyCreateOrConnectWithoutCollectionsInputSchema: z.ZodType<Prisma.TaxonomyCreateOrConnectWithoutCollectionsInput> = z.object({
  where: z.lazy(() => TaxonomyWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutCollectionsInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutCollectionsInputSchema) ]),
}).strict();

export default TaxonomyCreateOrConnectWithoutCollectionsInputSchema;
