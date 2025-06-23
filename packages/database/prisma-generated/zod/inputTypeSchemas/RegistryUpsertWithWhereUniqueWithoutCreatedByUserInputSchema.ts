import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryUpdateWithoutCreatedByUserInputSchema } from './RegistryUpdateWithoutCreatedByUserInputSchema';
import { RegistryUncheckedUpdateWithoutCreatedByUserInputSchema } from './RegistryUncheckedUpdateWithoutCreatedByUserInputSchema';
import { RegistryCreateWithoutCreatedByUserInputSchema } from './RegistryCreateWithoutCreatedByUserInputSchema';
import { RegistryUncheckedCreateWithoutCreatedByUserInputSchema } from './RegistryUncheckedCreateWithoutCreatedByUserInputSchema';

export const RegistryUpsertWithWhereUniqueWithoutCreatedByUserInputSchema: z.ZodType<Prisma.RegistryUpsertWithWhereUniqueWithoutCreatedByUserInput> =
  z
    .object({
      where: z.lazy(() => RegistryWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => RegistryUpdateWithoutCreatedByUserInputSchema),
        z.lazy(() => RegistryUncheckedUpdateWithoutCreatedByUserInputSchema),
      ]),
      create: z.union([
        z.lazy(() => RegistryCreateWithoutCreatedByUserInputSchema),
        z.lazy(() => RegistryUncheckedCreateWithoutCreatedByUserInputSchema),
      ]),
    })
    .strict();

export default RegistryUpsertWithWhereUniqueWithoutCreatedByUserInputSchema;
