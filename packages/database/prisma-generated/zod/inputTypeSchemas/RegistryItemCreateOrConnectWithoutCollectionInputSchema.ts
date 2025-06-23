import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemCreateWithoutCollectionInputSchema } from './RegistryItemCreateWithoutCollectionInputSchema';
import { RegistryItemUncheckedCreateWithoutCollectionInputSchema } from './RegistryItemUncheckedCreateWithoutCollectionInputSchema';

export const RegistryItemCreateOrConnectWithoutCollectionInputSchema: z.ZodType<Prisma.RegistryItemCreateOrConnectWithoutCollectionInput> =
  z
    .object({
      where: z.lazy(() => RegistryItemWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => RegistryItemCreateWithoutCollectionInputSchema),
        z.lazy(() => RegistryItemUncheckedCreateWithoutCollectionInputSchema),
      ]),
    })
    .strict();

export default RegistryItemCreateOrConnectWithoutCollectionInputSchema;
