import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryCreateWithoutItemsInputSchema } from './RegistryCreateWithoutItemsInputSchema';
import { RegistryUncheckedCreateWithoutItemsInputSchema } from './RegistryUncheckedCreateWithoutItemsInputSchema';

export const RegistryCreateOrConnectWithoutItemsInputSchema: z.ZodType<Prisma.RegistryCreateOrConnectWithoutItemsInput> = z.object({
  where: z.lazy(() => RegistryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RegistryCreateWithoutItemsInputSchema),z.lazy(() => RegistryUncheckedCreateWithoutItemsInputSchema) ]),
}).strict();

export default RegistryCreateOrConnectWithoutItemsInputSchema;
