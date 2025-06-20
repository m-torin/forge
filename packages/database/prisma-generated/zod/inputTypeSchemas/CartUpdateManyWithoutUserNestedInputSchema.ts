import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartCreateWithoutUserInputSchema } from './CartCreateWithoutUserInputSchema';
import { CartUncheckedCreateWithoutUserInputSchema } from './CartUncheckedCreateWithoutUserInputSchema';
import { CartCreateOrConnectWithoutUserInputSchema } from './CartCreateOrConnectWithoutUserInputSchema';
import { CartUpsertWithWhereUniqueWithoutUserInputSchema } from './CartUpsertWithWhereUniqueWithoutUserInputSchema';
import { CartCreateManyUserInputEnvelopeSchema } from './CartCreateManyUserInputEnvelopeSchema';
import { CartWhereUniqueInputSchema } from './CartWhereUniqueInputSchema';
import { CartUpdateWithWhereUniqueWithoutUserInputSchema } from './CartUpdateWithWhereUniqueWithoutUserInputSchema';
import { CartUpdateManyWithWhereWithoutUserInputSchema } from './CartUpdateManyWithWhereWithoutUserInputSchema';
import { CartScalarWhereInputSchema } from './CartScalarWhereInputSchema';

export const CartUpdateManyWithoutUserNestedInputSchema: z.ZodType<Prisma.CartUpdateManyWithoutUserNestedInput> = z.object({
  create: z.union([ z.lazy(() => CartCreateWithoutUserInputSchema),z.lazy(() => CartCreateWithoutUserInputSchema).array(),z.lazy(() => CartUncheckedCreateWithoutUserInputSchema),z.lazy(() => CartUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CartCreateOrConnectWithoutUserInputSchema),z.lazy(() => CartCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CartUpsertWithWhereUniqueWithoutUserInputSchema),z.lazy(() => CartUpsertWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CartCreateManyUserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => CartWhereUniqueInputSchema),z.lazy(() => CartWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CartWhereUniqueInputSchema),z.lazy(() => CartWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CartWhereUniqueInputSchema),z.lazy(() => CartWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CartWhereUniqueInputSchema),z.lazy(() => CartWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CartUpdateWithWhereUniqueWithoutUserInputSchema),z.lazy(() => CartUpdateWithWhereUniqueWithoutUserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CartUpdateManyWithWhereWithoutUserInputSchema),z.lazy(() => CartUpdateManyWithWhereWithoutUserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CartScalarWhereInputSchema),z.lazy(() => CartScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CartUpdateManyWithoutUserNestedInputSchema;
