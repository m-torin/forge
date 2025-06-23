import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemCreateWithoutProductInputSchema } from './CartItemCreateWithoutProductInputSchema';
import { CartItemUncheckedCreateWithoutProductInputSchema } from './CartItemUncheckedCreateWithoutProductInputSchema';
import { CartItemCreateOrConnectWithoutProductInputSchema } from './CartItemCreateOrConnectWithoutProductInputSchema';
import { CartItemCreateManyProductInputEnvelopeSchema } from './CartItemCreateManyProductInputEnvelopeSchema';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';

export const CartItemUncheckedCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.CartItemUncheckedCreateNestedManyWithoutProductInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CartItemCreateWithoutProductInputSchema),
          z.lazy(() => CartItemCreateWithoutProductInputSchema).array(),
          z.lazy(() => CartItemUncheckedCreateWithoutProductInputSchema),
          z.lazy(() => CartItemUncheckedCreateWithoutProductInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => CartItemCreateOrConnectWithoutProductInputSchema),
          z.lazy(() => CartItemCreateOrConnectWithoutProductInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => CartItemCreateManyProductInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => CartItemWhereUniqueInputSchema),
          z.lazy(() => CartItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default CartItemUncheckedCreateNestedManyWithoutProductInputSchema;
