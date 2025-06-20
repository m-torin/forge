import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutTaxonomiesInputSchema } from './CollectionCreateWithoutTaxonomiesInputSchema';
import { CollectionUncheckedCreateWithoutTaxonomiesInputSchema } from './CollectionUncheckedCreateWithoutTaxonomiesInputSchema';
import { CollectionCreateOrConnectWithoutTaxonomiesInputSchema } from './CollectionCreateOrConnectWithoutTaxonomiesInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';

export const CollectionCreateNestedManyWithoutTaxonomiesInputSchema: z.ZodType<Prisma.CollectionCreateNestedManyWithoutTaxonomiesInput> = z.object({
  create: z.union([ z.lazy(() => CollectionCreateWithoutTaxonomiesInputSchema),z.lazy(() => CollectionCreateWithoutTaxonomiesInputSchema).array(),z.lazy(() => CollectionUncheckedCreateWithoutTaxonomiesInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutTaxonomiesInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CollectionCreateOrConnectWithoutTaxonomiesInputSchema),z.lazy(() => CollectionCreateOrConnectWithoutTaxonomiesInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CollectionCreateNestedManyWithoutTaxonomiesInputSchema;
