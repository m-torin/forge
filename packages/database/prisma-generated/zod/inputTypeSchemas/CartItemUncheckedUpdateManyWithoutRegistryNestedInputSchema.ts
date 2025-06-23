import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemCreateWithoutRegistryInputSchema } from './CartItemCreateWithoutRegistryInputSchema';
import { CartItemUncheckedCreateWithoutRegistryInputSchema } from './CartItemUncheckedCreateWithoutRegistryInputSchema';
import { CartItemCreateOrConnectWithoutRegistryInputSchema } from './CartItemCreateOrConnectWithoutRegistryInputSchema';
import { CartItemUpsertWithWhereUniqueWithoutRegistryInputSchema } from './CartItemUpsertWithWhereUniqueWithoutRegistryInputSchema';
import { CartItemCreateManyRegistryInputEnvelopeSchema } from './CartItemCreateManyRegistryInputEnvelopeSchema';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemUpdateWithWhereUniqueWithoutRegistryInputSchema } from './CartItemUpdateWithWhereUniqueWithoutRegistryInputSchema';
import { CartItemUpdateManyWithWhereWithoutRegistryInputSchema } from './CartItemUpdateManyWithWhereWithoutRegistryInputSchema';
import { CartItemScalarWhereInputSchema } from './CartItemScalarWhereInputSchema';

export const CartItemUncheckedUpdateManyWithoutRegistryNestedInputSchema: z.ZodType<Prisma.CartItemUncheckedUpdateManyWithoutRegistryNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CartItemCreateWithoutRegistryInputSchema),
          z.lazy(() => CartItemCreateWithoutRegistryInputSchema).array(),
          z.lazy(() => CartItemUncheckedCreateWithoutRegistryInputSchema),
          z.lazy(() => CartItemUncheckedCreateWithoutRegistryInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => CartItemCreateOrConnectWithoutRegistryInputSchema),
          z.lazy(() => CartItemCreateOrConnectWithoutRegistryInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => CartItemUpsertWithWhereUniqueWithoutRegistryInputSchema),
          z.lazy(() => CartItemUpsertWithWhereUniqueWithoutRegistryInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => CartItemCreateManyRegistryInputEnvelopeSchema).optional(),
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
          z.lazy(() => CartItemUpdateWithWhereUniqueWithoutRegistryInputSchema),
          z.lazy(() => CartItemUpdateWithWhereUniqueWithoutRegistryInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => CartItemUpdateManyWithWhereWithoutRegistryInputSchema),
          z.lazy(() => CartItemUpdateManyWithWhereWithoutRegistryInputSchema).array(),
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

export default CartItemUncheckedUpdateManyWithoutRegistryNestedInputSchema;
