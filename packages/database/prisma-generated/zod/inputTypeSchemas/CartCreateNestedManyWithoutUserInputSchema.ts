import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartCreateWithoutUserInputSchema } from './CartCreateWithoutUserInputSchema';
import { CartUncheckedCreateWithoutUserInputSchema } from './CartUncheckedCreateWithoutUserInputSchema';
import { CartCreateOrConnectWithoutUserInputSchema } from './CartCreateOrConnectWithoutUserInputSchema';
import { CartCreateManyUserInputEnvelopeSchema } from './CartCreateManyUserInputEnvelopeSchema';
import { CartWhereUniqueInputSchema } from './CartWhereUniqueInputSchema';

export const CartCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.CartCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => CartCreateWithoutUserInputSchema),z.lazy(() => CartCreateWithoutUserInputSchema).array(),z.lazy(() => CartUncheckedCreateWithoutUserInputSchema),z.lazy(() => CartUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CartCreateOrConnectWithoutUserInputSchema),z.lazy(() => CartCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CartCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CartWhereUniqueInputSchema),z.lazy(() => CartWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CartCreateNestedManyWithoutUserInputSchema;
