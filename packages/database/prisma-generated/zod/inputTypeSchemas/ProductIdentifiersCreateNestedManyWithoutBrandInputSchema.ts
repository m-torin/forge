import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersCreateWithoutBrandInputSchema } from './ProductIdentifiersCreateWithoutBrandInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutBrandInputSchema } from './ProductIdentifiersUncheckedCreateWithoutBrandInputSchema';
import { ProductIdentifiersCreateOrConnectWithoutBrandInputSchema } from './ProductIdentifiersCreateOrConnectWithoutBrandInputSchema';
import { ProductIdentifiersCreateManyBrandInputEnvelopeSchema } from './ProductIdentifiersCreateManyBrandInputEnvelopeSchema';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';

export const ProductIdentifiersCreateNestedManyWithoutBrandInputSchema: z.ZodType<Prisma.ProductIdentifiersCreateNestedManyWithoutBrandInput> = z.object({
  create: z.union([ z.lazy(() => ProductIdentifiersCreateWithoutBrandInputSchema),z.lazy(() => ProductIdentifiersCreateWithoutBrandInputSchema).array(),z.lazy(() => ProductIdentifiersUncheckedCreateWithoutBrandInputSchema),z.lazy(() => ProductIdentifiersUncheckedCreateWithoutBrandInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductIdentifiersCreateOrConnectWithoutBrandInputSchema),z.lazy(() => ProductIdentifiersCreateOrConnectWithoutBrandInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductIdentifiersCreateManyBrandInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),z.lazy(() => ProductIdentifiersWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ProductIdentifiersCreateNestedManyWithoutBrandInputSchema;
