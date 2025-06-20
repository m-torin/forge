import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemCreateWithoutPurchasesInputSchema } from './RegistryItemCreateWithoutPurchasesInputSchema';
import { RegistryItemUncheckedCreateWithoutPurchasesInputSchema } from './RegistryItemUncheckedCreateWithoutPurchasesInputSchema';

export const RegistryItemCreateOrConnectWithoutPurchasesInputSchema: z.ZodType<Prisma.RegistryItemCreateOrConnectWithoutPurchasesInput> = z.object({
  where: z.lazy(() => RegistryItemWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RegistryItemCreateWithoutPurchasesInputSchema),z.lazy(() => RegistryItemUncheckedCreateWithoutPurchasesInputSchema) ]),
}).strict();

export default RegistryItemCreateOrConnectWithoutPurchasesInputSchema;
