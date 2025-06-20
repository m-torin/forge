import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersCreateWithoutProductInputSchema } from './ProductIdentifiersCreateWithoutProductInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutProductInputSchema } from './ProductIdentifiersUncheckedCreateWithoutProductInputSchema';
import { ProductIdentifiersCreateOrConnectWithoutProductInputSchema } from './ProductIdentifiersCreateOrConnectWithoutProductInputSchema';
import { ProductIdentifiersCreateManyProductInputEnvelopeSchema } from './ProductIdentifiersCreateManyProductInputEnvelopeSchema';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';

export const ProductIdentifiersCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.ProductIdentifiersCreateNestedManyWithoutProductInput> = z.object({
  create: z.union([ z.lazy(() => ProductIdentifiersCreateWithoutProductInputSchema),z.lazy(() => ProductIdentifiersCreateWithoutProductInputSchema).array(),z.lazy(() => ProductIdentifiersUncheckedCreateWithoutProductInputSchema),z.lazy(() => ProductIdentifiersUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductIdentifiersCreateOrConnectWithoutProductInputSchema),z.lazy(() => ProductIdentifiersCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductIdentifiersCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),z.lazy(() => ProductIdentifiersWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ProductIdentifiersCreateNestedManyWithoutProductInputSchema;
