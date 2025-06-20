import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyCreateWithoutProductsInputSchema } from './TaxonomyCreateWithoutProductsInputSchema';
import { TaxonomyUncheckedCreateWithoutProductsInputSchema } from './TaxonomyUncheckedCreateWithoutProductsInputSchema';
import { TaxonomyCreateOrConnectWithoutProductsInputSchema } from './TaxonomyCreateOrConnectWithoutProductsInputSchema';
import { TaxonomyWhereUniqueInputSchema } from './TaxonomyWhereUniqueInputSchema';

export const TaxonomyCreateNestedManyWithoutProductsInputSchema: z.ZodType<Prisma.TaxonomyCreateNestedManyWithoutProductsInput> = z.object({
  create: z.union([ z.lazy(() => TaxonomyCreateWithoutProductsInputSchema),z.lazy(() => TaxonomyCreateWithoutProductsInputSchema).array(),z.lazy(() => TaxonomyUncheckedCreateWithoutProductsInputSchema),z.lazy(() => TaxonomyUncheckedCreateWithoutProductsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => TaxonomyCreateOrConnectWithoutProductsInputSchema),z.lazy(() => TaxonomyCreateOrConnectWithoutProductsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => TaxonomyWhereUniqueInputSchema),z.lazy(() => TaxonomyWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default TaxonomyCreateNestedManyWithoutProductsInputSchema;
