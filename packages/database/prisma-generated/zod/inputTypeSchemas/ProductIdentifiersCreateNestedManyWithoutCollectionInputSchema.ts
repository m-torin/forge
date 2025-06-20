import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersCreateWithoutCollectionInputSchema } from './ProductIdentifiersCreateWithoutCollectionInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutCollectionInputSchema } from './ProductIdentifiersUncheckedCreateWithoutCollectionInputSchema';
import { ProductIdentifiersCreateOrConnectWithoutCollectionInputSchema } from './ProductIdentifiersCreateOrConnectWithoutCollectionInputSchema';
import { ProductIdentifiersCreateManyCollectionInputEnvelopeSchema } from './ProductIdentifiersCreateManyCollectionInputEnvelopeSchema';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';

export const ProductIdentifiersCreateNestedManyWithoutCollectionInputSchema: z.ZodType<Prisma.ProductIdentifiersCreateNestedManyWithoutCollectionInput> = z.object({
  create: z.union([ z.lazy(() => ProductIdentifiersCreateWithoutCollectionInputSchema),z.lazy(() => ProductIdentifiersCreateWithoutCollectionInputSchema).array(),z.lazy(() => ProductIdentifiersUncheckedCreateWithoutCollectionInputSchema),z.lazy(() => ProductIdentifiersUncheckedCreateWithoutCollectionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductIdentifiersCreateOrConnectWithoutCollectionInputSchema),z.lazy(() => ProductIdentifiersCreateOrConnectWithoutCollectionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductIdentifiersCreateManyCollectionInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),z.lazy(() => ProductIdentifiersWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ProductIdentifiersCreateNestedManyWithoutCollectionInputSchema;
