import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinCreateWithoutPurchaserInputSchema } from './RegistryPurchaseJoinCreateWithoutPurchaserInputSchema';
import { RegistryPurchaseJoinUncheckedCreateWithoutPurchaserInputSchema } from './RegistryPurchaseJoinUncheckedCreateWithoutPurchaserInputSchema';
import { RegistryPurchaseJoinCreateOrConnectWithoutPurchaserInputSchema } from './RegistryPurchaseJoinCreateOrConnectWithoutPurchaserInputSchema';
import { RegistryPurchaseJoinUpsertWithWhereUniqueWithoutPurchaserInputSchema } from './RegistryPurchaseJoinUpsertWithWhereUniqueWithoutPurchaserInputSchema';
import { RegistryPurchaseJoinCreateManyPurchaserInputEnvelopeSchema } from './RegistryPurchaseJoinCreateManyPurchaserInputEnvelopeSchema';
import { RegistryPurchaseJoinWhereUniqueInputSchema } from './RegistryPurchaseJoinWhereUniqueInputSchema';
import { RegistryPurchaseJoinUpdateWithWhereUniqueWithoutPurchaserInputSchema } from './RegistryPurchaseJoinUpdateWithWhereUniqueWithoutPurchaserInputSchema';
import { RegistryPurchaseJoinUpdateManyWithWhereWithoutPurchaserInputSchema } from './RegistryPurchaseJoinUpdateManyWithWhereWithoutPurchaserInputSchema';
import { RegistryPurchaseJoinScalarWhereInputSchema } from './RegistryPurchaseJoinScalarWhereInputSchema';

export const RegistryPurchaseJoinUpdateManyWithoutPurchaserNestedInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinUpdateManyWithoutPurchaserNestedInput> = z.object({
  create: z.union([ z.lazy(() => RegistryPurchaseJoinCreateWithoutPurchaserInputSchema),z.lazy(() => RegistryPurchaseJoinCreateWithoutPurchaserInputSchema).array(),z.lazy(() => RegistryPurchaseJoinUncheckedCreateWithoutPurchaserInputSchema),z.lazy(() => RegistryPurchaseJoinUncheckedCreateWithoutPurchaserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RegistryPurchaseJoinCreateOrConnectWithoutPurchaserInputSchema),z.lazy(() => RegistryPurchaseJoinCreateOrConnectWithoutPurchaserInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RegistryPurchaseJoinUpsertWithWhereUniqueWithoutPurchaserInputSchema),z.lazy(() => RegistryPurchaseJoinUpsertWithWhereUniqueWithoutPurchaserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RegistryPurchaseJoinCreateManyPurchaserInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RegistryPurchaseJoinUpdateWithWhereUniqueWithoutPurchaserInputSchema),z.lazy(() => RegistryPurchaseJoinUpdateWithWhereUniqueWithoutPurchaserInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RegistryPurchaseJoinUpdateManyWithWhereWithoutPurchaserInputSchema),z.lazy(() => RegistryPurchaseJoinUpdateManyWithWhereWithoutPurchaserInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RegistryPurchaseJoinScalarWhereInputSchema),z.lazy(() => RegistryPurchaseJoinScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default RegistryPurchaseJoinUpdateManyWithoutPurchaserNestedInputSchema;
