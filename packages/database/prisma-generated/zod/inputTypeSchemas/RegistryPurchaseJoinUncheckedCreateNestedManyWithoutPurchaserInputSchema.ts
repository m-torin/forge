import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinCreateWithoutPurchaserInputSchema } from './RegistryPurchaseJoinCreateWithoutPurchaserInputSchema';
import { RegistryPurchaseJoinUncheckedCreateWithoutPurchaserInputSchema } from './RegistryPurchaseJoinUncheckedCreateWithoutPurchaserInputSchema';
import { RegistryPurchaseJoinCreateOrConnectWithoutPurchaserInputSchema } from './RegistryPurchaseJoinCreateOrConnectWithoutPurchaserInputSchema';
import { RegistryPurchaseJoinCreateManyPurchaserInputEnvelopeSchema } from './RegistryPurchaseJoinCreateManyPurchaserInputEnvelopeSchema';
import { RegistryPurchaseJoinWhereUniqueInputSchema } from './RegistryPurchaseJoinWhereUniqueInputSchema';

export const RegistryPurchaseJoinUncheckedCreateNestedManyWithoutPurchaserInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinUncheckedCreateNestedManyWithoutPurchaserInput> = z.object({
  create: z.union([ z.lazy(() => RegistryPurchaseJoinCreateWithoutPurchaserInputSchema),z.lazy(() => RegistryPurchaseJoinCreateWithoutPurchaserInputSchema).array(),z.lazy(() => RegistryPurchaseJoinUncheckedCreateWithoutPurchaserInputSchema),z.lazy(() => RegistryPurchaseJoinUncheckedCreateWithoutPurchaserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RegistryPurchaseJoinCreateOrConnectWithoutPurchaserInputSchema),z.lazy(() => RegistryPurchaseJoinCreateOrConnectWithoutPurchaserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RegistryPurchaseJoinCreateManyPurchaserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default RegistryPurchaseJoinUncheckedCreateNestedManyWithoutPurchaserInputSchema;
