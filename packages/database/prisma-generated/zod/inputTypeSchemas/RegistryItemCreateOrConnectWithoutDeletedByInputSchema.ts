import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemCreateWithoutDeletedByInputSchema } from './RegistryItemCreateWithoutDeletedByInputSchema';
import { RegistryItemUncheckedCreateWithoutDeletedByInputSchema } from './RegistryItemUncheckedCreateWithoutDeletedByInputSchema';

export const RegistryItemCreateOrConnectWithoutDeletedByInputSchema: z.ZodType<Prisma.RegistryItemCreateOrConnectWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => RegistryItemWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => RegistryItemCreateWithoutDeletedByInputSchema),
        z.lazy(() => RegistryItemUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default RegistryItemCreateOrConnectWithoutDeletedByInputSchema;
