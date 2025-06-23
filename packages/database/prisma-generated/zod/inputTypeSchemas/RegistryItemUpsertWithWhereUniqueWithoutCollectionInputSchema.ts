import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemUpdateWithoutCollectionInputSchema } from './RegistryItemUpdateWithoutCollectionInputSchema';
import { RegistryItemUncheckedUpdateWithoutCollectionInputSchema } from './RegistryItemUncheckedUpdateWithoutCollectionInputSchema';
import { RegistryItemCreateWithoutCollectionInputSchema } from './RegistryItemCreateWithoutCollectionInputSchema';
import { RegistryItemUncheckedCreateWithoutCollectionInputSchema } from './RegistryItemUncheckedCreateWithoutCollectionInputSchema';

export const RegistryItemUpsertWithWhereUniqueWithoutCollectionInputSchema: z.ZodType<Prisma.RegistryItemUpsertWithWhereUniqueWithoutCollectionInput> =
  z
    .object({
      where: z.lazy(() => RegistryItemWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => RegistryItemUpdateWithoutCollectionInputSchema),
        z.lazy(() => RegistryItemUncheckedUpdateWithoutCollectionInputSchema),
      ]),
      create: z.union([
        z.lazy(() => RegistryItemCreateWithoutCollectionInputSchema),
        z.lazy(() => RegistryItemUncheckedCreateWithoutCollectionInputSchema),
      ]),
    })
    .strict();

export default RegistryItemUpsertWithWhereUniqueWithoutCollectionInputSchema;
