import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemUpdateWithoutProductInputSchema } from './RegistryItemUpdateWithoutProductInputSchema';
import { RegistryItemUncheckedUpdateWithoutProductInputSchema } from './RegistryItemUncheckedUpdateWithoutProductInputSchema';
import { RegistryItemCreateWithoutProductInputSchema } from './RegistryItemCreateWithoutProductInputSchema';
import { RegistryItemUncheckedCreateWithoutProductInputSchema } from './RegistryItemUncheckedCreateWithoutProductInputSchema';

export const RegistryItemUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.RegistryItemUpsertWithWhereUniqueWithoutProductInput> =
  z
    .object({
      where: z.lazy(() => RegistryItemWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => RegistryItemUpdateWithoutProductInputSchema),
        z.lazy(() => RegistryItemUncheckedUpdateWithoutProductInputSchema),
      ]),
      create: z.union([
        z.lazy(() => RegistryItemCreateWithoutProductInputSchema),
        z.lazy(() => RegistryItemUncheckedCreateWithoutProductInputSchema),
      ]),
    })
    .strict();

export default RegistryItemUpsertWithWhereUniqueWithoutProductInputSchema;
