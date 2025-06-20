import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemCreateWithoutCartInputSchema } from './CartItemCreateWithoutCartInputSchema';
import { CartItemUncheckedCreateWithoutCartInputSchema } from './CartItemUncheckedCreateWithoutCartInputSchema';
import { CartItemCreateOrConnectWithoutCartInputSchema } from './CartItemCreateOrConnectWithoutCartInputSchema';
import { CartItemCreateManyCartInputEnvelopeSchema } from './CartItemCreateManyCartInputEnvelopeSchema';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';

export const CartItemUncheckedCreateNestedManyWithoutCartInputSchema: z.ZodType<Prisma.CartItemUncheckedCreateNestedManyWithoutCartInput> = z.object({
  create: z.union([ z.lazy(() => CartItemCreateWithoutCartInputSchema),z.lazy(() => CartItemCreateWithoutCartInputSchema).array(),z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema),z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CartItemCreateOrConnectWithoutCartInputSchema),z.lazy(() => CartItemCreateOrConnectWithoutCartInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CartItemCreateManyCartInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema),z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CartItemUncheckedCreateNestedManyWithoutCartInputSchema;
