import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema';
import { RegistryPurchaseJoinUncheckedCreateWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinUncheckedCreateWithoutRegistryItemInputSchema';
import { RegistryPurchaseJoinCreateOrConnectWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinCreateOrConnectWithoutRegistryItemInputSchema';
import { RegistryPurchaseJoinUpsertWithWhereUniqueWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinUpsertWithWhereUniqueWithoutRegistryItemInputSchema';
import { RegistryPurchaseJoinCreateManyRegistryItemInputEnvelopeSchema } from './RegistryPurchaseJoinCreateManyRegistryItemInputEnvelopeSchema';
import { RegistryPurchaseJoinWhereUniqueInputSchema } from './RegistryPurchaseJoinWhereUniqueInputSchema';
import { RegistryPurchaseJoinUpdateWithWhereUniqueWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinUpdateWithWhereUniqueWithoutRegistryItemInputSchema';
import { RegistryPurchaseJoinUpdateManyWithWhereWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinUpdateManyWithWhereWithoutRegistryItemInputSchema';
import { RegistryPurchaseJoinScalarWhereInputSchema } from './RegistryPurchaseJoinScalarWhereInputSchema';

export const RegistryPurchaseJoinUncheckedUpdateManyWithoutRegistryItemNestedInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinUncheckedUpdateManyWithoutRegistryItemNestedInput> = z.object({
  create: z.union([ z.lazy(() => RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema),z.lazy(() => RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema).array(),z.lazy(() => RegistryPurchaseJoinUncheckedCreateWithoutRegistryItemInputSchema),z.lazy(() => RegistryPurchaseJoinUncheckedCreateWithoutRegistryItemInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RegistryPurchaseJoinCreateOrConnectWithoutRegistryItemInputSchema),z.lazy(() => RegistryPurchaseJoinCreateOrConnectWithoutRegistryItemInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RegistryPurchaseJoinUpsertWithWhereUniqueWithoutRegistryItemInputSchema),z.lazy(() => RegistryPurchaseJoinUpsertWithWhereUniqueWithoutRegistryItemInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RegistryPurchaseJoinCreateManyRegistryItemInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RegistryPurchaseJoinUpdateWithWhereUniqueWithoutRegistryItemInputSchema),z.lazy(() => RegistryPurchaseJoinUpdateWithWhereUniqueWithoutRegistryItemInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RegistryPurchaseJoinUpdateManyWithWhereWithoutRegistryItemInputSchema),z.lazy(() => RegistryPurchaseJoinUpdateManyWithWhereWithoutRegistryItemInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RegistryPurchaseJoinScalarWhereInputSchema),z.lazy(() => RegistryPurchaseJoinScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default RegistryPurchaseJoinUncheckedUpdateManyWithoutRegistryItemNestedInputSchema;
