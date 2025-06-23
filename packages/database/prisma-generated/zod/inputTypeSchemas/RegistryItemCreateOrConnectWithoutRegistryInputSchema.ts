import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemCreateWithoutRegistryInputSchema } from './RegistryItemCreateWithoutRegistryInputSchema';
import { RegistryItemUncheckedCreateWithoutRegistryInputSchema } from './RegistryItemUncheckedCreateWithoutRegistryInputSchema';

export const RegistryItemCreateOrConnectWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryItemCreateOrConnectWithoutRegistryInput> =
  z
    .object({
      where: z.lazy(() => RegistryItemWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => RegistryItemCreateWithoutRegistryInputSchema),
        z.lazy(() => RegistryItemUncheckedCreateWithoutRegistryInputSchema),
      ]),
    })
    .strict();

export default RegistryItemCreateOrConnectWithoutRegistryInputSchema;
