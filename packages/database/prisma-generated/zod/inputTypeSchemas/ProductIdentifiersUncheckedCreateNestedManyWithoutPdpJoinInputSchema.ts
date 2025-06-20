import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersCreateWithoutPdpJoinInputSchema } from './ProductIdentifiersCreateWithoutPdpJoinInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutPdpJoinInputSchema } from './ProductIdentifiersUncheckedCreateWithoutPdpJoinInputSchema';
import { ProductIdentifiersCreateOrConnectWithoutPdpJoinInputSchema } from './ProductIdentifiersCreateOrConnectWithoutPdpJoinInputSchema';
import { ProductIdentifiersCreateManyPdpJoinInputEnvelopeSchema } from './ProductIdentifiersCreateManyPdpJoinInputEnvelopeSchema';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';

export const ProductIdentifiersUncheckedCreateNestedManyWithoutPdpJoinInputSchema: z.ZodType<Prisma.ProductIdentifiersUncheckedCreateNestedManyWithoutPdpJoinInput> = z.object({
  create: z.union([ z.lazy(() => ProductIdentifiersCreateWithoutPdpJoinInputSchema),z.lazy(() => ProductIdentifiersCreateWithoutPdpJoinInputSchema).array(),z.lazy(() => ProductIdentifiersUncheckedCreateWithoutPdpJoinInputSchema),z.lazy(() => ProductIdentifiersUncheckedCreateWithoutPdpJoinInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => ProductIdentifiersCreateOrConnectWithoutPdpJoinInputSchema),z.lazy(() => ProductIdentifiersCreateOrConnectWithoutPdpJoinInputSchema).array() ]).optional(),
  createMany: z.lazy(() => ProductIdentifiersCreateManyPdpJoinInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),z.lazy(() => ProductIdentifiersWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default ProductIdentifiersUncheckedCreateNestedManyWithoutPdpJoinInputSchema;
