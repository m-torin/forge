import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryCreateWithoutItemsInputSchema } from './RegistryCreateWithoutItemsInputSchema';
import { RegistryUncheckedCreateWithoutItemsInputSchema } from './RegistryUncheckedCreateWithoutItemsInputSchema';
import { RegistryCreateOrConnectWithoutItemsInputSchema } from './RegistryCreateOrConnectWithoutItemsInputSchema';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';

export const RegistryCreateNestedOneWithoutItemsInputSchema: z.ZodType<Prisma.RegistryCreateNestedOneWithoutItemsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => RegistryCreateWithoutItemsInputSchema),
          z.lazy(() => RegistryUncheckedCreateWithoutItemsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => RegistryCreateOrConnectWithoutItemsInputSchema).optional(),
      connect: z.lazy(() => RegistryWhereUniqueInputSchema).optional(),
    })
    .strict();

export default RegistryCreateNestedOneWithoutItemsInputSchema;
