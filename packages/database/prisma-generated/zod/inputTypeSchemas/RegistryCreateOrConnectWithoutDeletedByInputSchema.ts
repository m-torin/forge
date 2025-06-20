import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryCreateWithoutDeletedByInputSchema } from './RegistryCreateWithoutDeletedByInputSchema';
import { RegistryUncheckedCreateWithoutDeletedByInputSchema } from './RegistryUncheckedCreateWithoutDeletedByInputSchema';

export const RegistryCreateOrConnectWithoutDeletedByInputSchema: z.ZodType<Prisma.RegistryCreateOrConnectWithoutDeletedByInput> = z.object({
  where: z.lazy(() => RegistryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RegistryCreateWithoutDeletedByInputSchema),z.lazy(() => RegistryUncheckedCreateWithoutDeletedByInputSchema) ]),
}).strict();

export default RegistryCreateOrConnectWithoutDeletedByInputSchema;
