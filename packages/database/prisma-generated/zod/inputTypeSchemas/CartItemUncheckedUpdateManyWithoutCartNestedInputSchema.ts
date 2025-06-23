import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemCreateWithoutCartInputSchema } from './CartItemCreateWithoutCartInputSchema';
import { CartItemUncheckedCreateWithoutCartInputSchema } from './CartItemUncheckedCreateWithoutCartInputSchema';
import { CartItemCreateOrConnectWithoutCartInputSchema } from './CartItemCreateOrConnectWithoutCartInputSchema';
import { CartItemUpsertWithWhereUniqueWithoutCartInputSchema } from './CartItemUpsertWithWhereUniqueWithoutCartInputSchema';
import { CartItemCreateManyCartInputEnvelopeSchema } from './CartItemCreateManyCartInputEnvelopeSchema';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemUpdateWithWhereUniqueWithoutCartInputSchema } from './CartItemUpdateWithWhereUniqueWithoutCartInputSchema';
import { CartItemUpdateManyWithWhereWithoutCartInputSchema } from './CartItemUpdateManyWithWhereWithoutCartInputSchema';
import { CartItemScalarWhereInputSchema } from './CartItemScalarWhereInputSchema';

export const CartItemUncheckedUpdateManyWithoutCartNestedInputSchema: z.ZodType<Prisma.CartItemUncheckedUpdateManyWithoutCartNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CartItemCreateWithoutCartInputSchema),
          z.lazy(() => CartItemCreateWithoutCartInputSchema).array(),
          z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema),
          z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => CartItemCreateOrConnectWithoutCartInputSchema),
          z.lazy(() => CartItemCreateOrConnectWithoutCartInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => CartItemUpsertWithWhereUniqueWithoutCartInputSchema),
          z.lazy(() => CartItemUpsertWithWhereUniqueWithoutCartInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => CartItemCreateManyCartInputEnvelopeSchema).optional(),
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
          z.lazy(() => CartItemUpdateWithWhereUniqueWithoutCartInputSchema),
          z.lazy(() => CartItemUpdateWithWhereUniqueWithoutCartInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => CartItemUpdateManyWithWhereWithoutCartInputSchema),
          z.lazy(() => CartItemUpdateManyWithWhereWithoutCartInputSchema).array(),
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

export default CartItemUncheckedUpdateManyWithoutCartNestedInputSchema;
