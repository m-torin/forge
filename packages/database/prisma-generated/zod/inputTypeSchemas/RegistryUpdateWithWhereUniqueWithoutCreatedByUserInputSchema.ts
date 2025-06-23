import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryUpdateWithoutCreatedByUserInputSchema } from './RegistryUpdateWithoutCreatedByUserInputSchema';
import { RegistryUncheckedUpdateWithoutCreatedByUserInputSchema } from './RegistryUncheckedUpdateWithoutCreatedByUserInputSchema';

export const RegistryUpdateWithWhereUniqueWithoutCreatedByUserInputSchema: z.ZodType<Prisma.RegistryUpdateWithWhereUniqueWithoutCreatedByUserInput> =
  z
    .object({
      where: z.lazy(() => RegistryWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => RegistryUpdateWithoutCreatedByUserInputSchema),
        z.lazy(() => RegistryUncheckedUpdateWithoutCreatedByUserInputSchema),
      ]),
    })
    .strict();

export default RegistryUpdateWithWhereUniqueWithoutCreatedByUserInputSchema;
