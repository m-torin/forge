import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryCreateWithoutCartItemsInputSchema } from './RegistryCreateWithoutCartItemsInputSchema';
import { RegistryUncheckedCreateWithoutCartItemsInputSchema } from './RegistryUncheckedCreateWithoutCartItemsInputSchema';

export const RegistryCreateOrConnectWithoutCartItemsInputSchema: z.ZodType<Prisma.RegistryCreateOrConnectWithoutCartItemsInput> = z.object({
  where: z.lazy(() => RegistryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RegistryCreateWithoutCartItemsInputSchema),z.lazy(() => RegistryUncheckedCreateWithoutCartItemsInputSchema) ]),
}).strict();

export default RegistryCreateOrConnectWithoutCartItemsInputSchema;
