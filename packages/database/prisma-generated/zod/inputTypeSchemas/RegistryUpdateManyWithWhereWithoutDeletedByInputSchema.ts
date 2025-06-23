import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryScalarWhereInputSchema } from './RegistryScalarWhereInputSchema';
import { RegistryUpdateManyMutationInputSchema } from './RegistryUpdateManyMutationInputSchema';
import { RegistryUncheckedUpdateManyWithoutDeletedByInputSchema } from './RegistryUncheckedUpdateManyWithoutDeletedByInputSchema';

export const RegistryUpdateManyWithWhereWithoutDeletedByInputSchema: z.ZodType<Prisma.RegistryUpdateManyWithWhereWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => RegistryScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => RegistryUpdateManyMutationInputSchema),
        z.lazy(() => RegistryUncheckedUpdateManyWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default RegistryUpdateManyWithWhereWithoutDeletedByInputSchema;
