import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryScalarWhereInputSchema } from './RegistryScalarWhereInputSchema';
import { RegistryUpdateManyMutationInputSchema } from './RegistryUpdateManyMutationInputSchema';
import { RegistryUncheckedUpdateManyWithoutCreatedByUserInputSchema } from './RegistryUncheckedUpdateManyWithoutCreatedByUserInputSchema';

export const RegistryUpdateManyWithWhereWithoutCreatedByUserInputSchema: z.ZodType<Prisma.RegistryUpdateManyWithWhereWithoutCreatedByUserInput> =
  z
    .object({
      where: z.lazy(() => RegistryScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => RegistryUpdateManyMutationInputSchema),
        z.lazy(() => RegistryUncheckedUpdateManyWithoutCreatedByUserInputSchema),
      ]),
    })
    .strict();

export default RegistryUpdateManyWithWhereWithoutCreatedByUserInputSchema;
