import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryUpdateWithoutDeletedByInputSchema } from './RegistryUpdateWithoutDeletedByInputSchema';
import { RegistryUncheckedUpdateWithoutDeletedByInputSchema } from './RegistryUncheckedUpdateWithoutDeletedByInputSchema';

export const RegistryUpdateWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.RegistryUpdateWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => RegistryWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => RegistryUpdateWithoutDeletedByInputSchema),
        z.lazy(() => RegistryUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default RegistryUpdateWithWhereUniqueWithoutDeletedByInputSchema;
