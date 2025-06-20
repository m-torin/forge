import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryTransactionCreateWithoutInventoryInputSchema } from './InventoryTransactionCreateWithoutInventoryInputSchema';
import { InventoryTransactionUncheckedCreateWithoutInventoryInputSchema } from './InventoryTransactionUncheckedCreateWithoutInventoryInputSchema';
import { InventoryTransactionCreateOrConnectWithoutInventoryInputSchema } from './InventoryTransactionCreateOrConnectWithoutInventoryInputSchema';
import { InventoryTransactionUpsertWithWhereUniqueWithoutInventoryInputSchema } from './InventoryTransactionUpsertWithWhereUniqueWithoutInventoryInputSchema';
import { InventoryTransactionCreateManyInventoryInputEnvelopeSchema } from './InventoryTransactionCreateManyInventoryInputEnvelopeSchema';
import { InventoryTransactionWhereUniqueInputSchema } from './InventoryTransactionWhereUniqueInputSchema';
import { InventoryTransactionUpdateWithWhereUniqueWithoutInventoryInputSchema } from './InventoryTransactionUpdateWithWhereUniqueWithoutInventoryInputSchema';
import { InventoryTransactionUpdateManyWithWhereWithoutInventoryInputSchema } from './InventoryTransactionUpdateManyWithWhereWithoutInventoryInputSchema';
import { InventoryTransactionScalarWhereInputSchema } from './InventoryTransactionScalarWhereInputSchema';

export const InventoryTransactionUpdateManyWithoutInventoryNestedInputSchema: z.ZodType<Prisma.InventoryTransactionUpdateManyWithoutInventoryNestedInput> = z.object({
  create: z.union([ z.lazy(() => InventoryTransactionCreateWithoutInventoryInputSchema),z.lazy(() => InventoryTransactionCreateWithoutInventoryInputSchema).array(),z.lazy(() => InventoryTransactionUncheckedCreateWithoutInventoryInputSchema),z.lazy(() => InventoryTransactionUncheckedCreateWithoutInventoryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InventoryTransactionCreateOrConnectWithoutInventoryInputSchema),z.lazy(() => InventoryTransactionCreateOrConnectWithoutInventoryInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => InventoryTransactionUpsertWithWhereUniqueWithoutInventoryInputSchema),z.lazy(() => InventoryTransactionUpsertWithWhereUniqueWithoutInventoryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InventoryTransactionCreateManyInventoryInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => InventoryTransactionWhereUniqueInputSchema),z.lazy(() => InventoryTransactionWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => InventoryTransactionWhereUniqueInputSchema),z.lazy(() => InventoryTransactionWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => InventoryTransactionWhereUniqueInputSchema),z.lazy(() => InventoryTransactionWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => InventoryTransactionWhereUniqueInputSchema),z.lazy(() => InventoryTransactionWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => InventoryTransactionUpdateWithWhereUniqueWithoutInventoryInputSchema),z.lazy(() => InventoryTransactionUpdateWithWhereUniqueWithoutInventoryInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => InventoryTransactionUpdateManyWithWhereWithoutInventoryInputSchema),z.lazy(() => InventoryTransactionUpdateManyWithWhereWithoutInventoryInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => InventoryTransactionScalarWhereInputSchema),z.lazy(() => InventoryTransactionScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default InventoryTransactionUpdateManyWithoutInventoryNestedInputSchema;
