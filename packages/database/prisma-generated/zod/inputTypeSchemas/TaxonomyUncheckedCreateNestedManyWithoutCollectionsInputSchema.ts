import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyCreateWithoutCollectionsInputSchema } from './TaxonomyCreateWithoutCollectionsInputSchema';
import { TaxonomyUncheckedCreateWithoutCollectionsInputSchema } from './TaxonomyUncheckedCreateWithoutCollectionsInputSchema';
import { TaxonomyCreateOrConnectWithoutCollectionsInputSchema } from './TaxonomyCreateOrConnectWithoutCollectionsInputSchema';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';

export const TaxonomyUncheckedCreateNestedManyWithoutCollectionsInputSchema: z.ZodType<Prisma.TaxonomyUncheckedCreateNestedManyWithoutCollectionsInput> = z.object({
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutCollectionsInputSchema),z.lazy(() => TaxonomyCreateWithoutCollectionsInputSchema).array(),z.lazy(() => TaxonomyUncheckedCreateWithoutCollectionsInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutCollectionsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaxonomyCreateOrConnectWithoutCollectionsInputSchema),z.lazy(() => TaxonomyCreateOrConnectWithoutCollectionsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default TaxonomyUncheckedCreateNestedManyWithoutCollectionsInputSchema;
