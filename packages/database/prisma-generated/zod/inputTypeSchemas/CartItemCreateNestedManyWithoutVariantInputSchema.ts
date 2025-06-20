import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemCreateWithoutVariantInputSchema } from './CartItemCreateWithoutVariantInputSchema';
import { CartItemUncheckedCreateWithoutVariantInputSchema } from './CartItemUncheckedCreateWithoutVariantInputSchema';
import { CartItemCreateOrConnectWithoutVariantInputSchema } from './CartItemCreateOrConnectWithoutVariantInputSchema';
import { CartItemCreateManyVariantInputEnvelopeSchema } from './CartItemCreateManyVariantInputEnvelopeSchema';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';

export const CartItemCreateNestedManyWithoutVariantInputSchema: z.ZodType<Prisma.CartItemCreateNestedManyWithoutVariantInput> = z.object({
  create: z.union([ z.lazy(() => CartItemCreateWithoutVariantInputSchema),z.lazy(() => CartItemCreateWithoutVariantInputSchema).array(),z.lazy(() => CartItemUncheckedCreateWithoutVariantInputSchema),z.lazy(() => CartItemUncheckedCreateWithoutVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CartItemCreateOrConnectWithoutVariantInputSchema),z.lazy(() => CartItemCreateOrConnectWithoutVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CartItemCreateManyVariantInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema),z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CartItemCreateNestedManyWithoutVariantInputSchema;
