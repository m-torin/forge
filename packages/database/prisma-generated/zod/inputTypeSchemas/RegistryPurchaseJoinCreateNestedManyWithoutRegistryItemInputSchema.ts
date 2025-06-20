import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema';
import { RegistryPurchaseJoinUncheckedCreateWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinUncheckedCreateWithoutRegistryItemInputSchema';
import { RegistryPurchaseJoinCreateOrConnectWithoutRegistryItemInputSchema } from './RegistryPurchaseJoinCreateOrConnectWithoutRegistryItemInputSchema';
import { RegistryPurchaseJoinCreateManyRegistryItemInputEnvelopeSchema } from './RegistryPurchaseJoinCreateManyRegistryItemInputEnvelopeSchema';
import { RegistryPurchaseJoinWhereUniqueInputSchema } from './RegistryPurchaseJoinWhereUniqueInputSchema';

export const RegistryPurchaseJoinCreateNestedManyWithoutRegistryItemInputSchema: z.ZodType<Prisma.RegistryPurchaseJoinCreateNestedManyWithoutRegistryItemInput> = z.object({
  create: z.union([ z.lazy(() => RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema),z.lazy(() => RegistryPurchaseJoinCreateWithoutRegistryItemInputSchema).array(),z.lazy(() => RegistryPurchaseJoinUncheckedCreateWithoutRegistryItemInputSchema),z.lazy(() => RegistryPurchaseJoinUncheckedCreateWithoutRegistryItemInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RegistryPurchaseJoinCreateOrConnectWithoutRegistryItemInputSchema),z.lazy(() => RegistryPurchaseJoinCreateOrConnectWithoutRegistryItemInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RegistryPurchaseJoinCreateManyRegistryItemInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema),z.lazy(() => RegistryPurchaseJoinWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default RegistryPurchaseJoinCreateNestedManyWithoutRegistryItemInputSchema;
