import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemCreateWithoutProductInputSchema } from './CartItemCreateWithoutProductInputSchema';
import { CartItemUncheckedCreateWithoutProductInputSchema } from './CartItemUncheckedCreateWithoutProductInputSchema';
import { CartItemCreateOrConnectWithoutProductInputSchema } from './CartItemCreateOrConnectWithoutProductInputSchema';
import { CartItemUpsertWithWhereUniqueWithoutProductInputSchema } from './CartItemUpsertWithWhereUniqueWithoutProductInputSchema';
import { CartItemCreateManyProductInputEnvelopeSchema } from './CartItemCreateManyProductInputEnvelopeSchema';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemUpdateWithWhereUniqueWithoutProductInputSchema } from './CartItemUpdateWithWhereUniqueWithoutProductInputSchema';
import { CartItemUpdateManyWithWhereWithoutProductInputSchema } from './CartItemUpdateManyWithWhereWithoutProductInputSchema';
import { CartItemScalarWhereInputSchema } from './CartItemScalarWhereInputSchema';

export const CartItemUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.CartItemUpdateManyWithoutProductNestedInput> =
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
      upsert: z
        .union([
          z.lazy(() => CartItemUpsertWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => CartItemUpsertWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => CartItemCreateManyProductInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => CartItemWhereUniqueInputSchema),
          z.lazy(() => CartItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => CartItemWhereUniqueInputSchema),
          z.lazy(() => CartItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => CartItemWhereUniqueInputSchema),
          z.lazy(() => CartItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => CartItemWhereUniqueInputSchema),
          z.lazy(() => CartItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => CartItemUpdateWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => CartItemUpdateWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => CartItemUpdateManyWithWhereWithoutProductInputSchema),
          z.lazy(() => CartItemUpdateManyWithWhereWithoutProductInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => CartItemScalarWhereInputSchema),
          z.lazy(() => CartItemScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default CartItemUpdateManyWithoutProductNestedInputSchema;
