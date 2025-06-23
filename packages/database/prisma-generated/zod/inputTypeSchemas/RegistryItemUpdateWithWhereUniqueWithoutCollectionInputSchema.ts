import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemUpdateWithoutCollectionInputSchema } from './RegistryItemUpdateWithoutCollectionInputSchema';
import { RegistryItemUncheckedUpdateWithoutCollectionInputSchema } from './RegistryItemUncheckedUpdateWithoutCollectionInputSchema';

export const RegistryItemUpdateWithWhereUniqueWithoutCollectionInputSchema: z.ZodType<Prisma.RegistryItemUpdateWithWhereUniqueWithoutCollectionInput> =
  z
    .object({
      where: z.lazy(() => RegistryItemWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => RegistryItemUpdateWithoutCollectionInputSchema),
        z.lazy(() => RegistryItemUncheckedUpdateWithoutCollectionInputSchema),
      ]),
    })
    .strict();

export default RegistryItemUpdateWithWhereUniqueWithoutCollectionInputSchema;
