import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemCreateWithoutVariantInputSchema } from './CartItemCreateWithoutVariantInputSchema';
import { CartItemUncheckedCreateWithoutVariantInputSchema } from './CartItemUncheckedCreateWithoutVariantInputSchema';
import { CartItemCreateOrConnectWithoutVariantInputSchema } from './CartItemCreateOrConnectWithoutVariantInputSchema';
import { CartItemUpsertWithWhereUniqueWithoutVariantInputSchema } from './CartItemUpsertWithWhereUniqueWithoutVariantInputSchema';
import { CartItemCreateManyVariantInputEnvelopeSchema } from './CartItemCreateManyVariantInputEnvelopeSchema';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemUpdateWithWhereUniqueWithoutVariantInputSchema } from './CartItemUpdateWithWhereUniqueWithoutVariantInputSchema';
import { CartItemUpdateManyWithWhereWithoutVariantInputSchema } from './CartItemUpdateManyWithWhereWithoutVariantInputSchema';
import { CartItemScalarWhereInputSchema } from './CartItemScalarWhereInputSchema';

export const CartItemUpdateManyWithoutVariantNestedInputSchema: z.ZodType<Prisma.CartItemUpdateManyWithoutVariantNestedInput> = z.object({
  create: z.union([ z.lazy(() => CartItemCreateWithoutVariantInputSchema),z.lazy(() => CartItemCreateWithoutVariantInputSchema).array(),z.lazy(() => CartItemUncheckedCreateWithoutVariantInputSchema),z.lazy(() => CartItemUncheckedCreateWithoutVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CartItemCreateOrConnectWithoutVariantInputSchema),z.lazy(() => CartItemCreateOrConnectWithoutVariantInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CartItemUpsertWithWhereUniqueWithoutVariantInputSchema),z.lazy(() => CartItemUpsertWithWhereUniqueWithoutVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CartItemCreateManyVariantInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema),z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema),z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema),z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema),z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CartItemUpdateWithWhereUniqueWithoutVariantInputSchema),z.lazy(() => CartItemUpdateWithWhereUniqueWithoutVariantInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CartItemUpdateManyWithWhereWithoutVariantInputSchema),z.lazy(() => CartItemUpdateManyWithWhereWithoutVariantInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CartItemScalarWhereInputSchema),z.lazy(() => CartItemScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CartItemUpdateManyWithoutVariantNestedInputSchema;
