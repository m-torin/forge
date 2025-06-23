import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemUpdateWithoutDeletedByInputSchema } from './RegistryItemUpdateWithoutDeletedByInputSchema';
import { RegistryItemUncheckedUpdateWithoutDeletedByInputSchema } from './RegistryItemUncheckedUpdateWithoutDeletedByInputSchema';
import { RegistryItemCreateWithoutDeletedByInputSchema } from './RegistryItemCreateWithoutDeletedByInputSchema';
import { RegistryItemUncheckedCreateWithoutDeletedByInputSchema } from './RegistryItemUncheckedCreateWithoutDeletedByInputSchema';

export const RegistryItemUpsertWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.RegistryItemUpsertWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => RegistryItemWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => RegistryItemUpdateWithoutDeletedByInputSchema),
        z.lazy(() => RegistryItemUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
      create: z.union([
        z.lazy(() => RegistryItemCreateWithoutDeletedByInputSchema),
        z.lazy(() => RegistryItemUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default RegistryItemUpsertWithWhereUniqueWithoutDeletedByInputSchema;
