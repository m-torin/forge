import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinScalarWhereInputSchema } from './RegistryUserJoinScalarWhereInputSchema';
import { RegistryUserJoinUpdateManyMutationInputSchema } from './RegistryUserJoinUpdateManyMutationInputSchema';
import { RegistryUserJoinUncheckedUpdateManyWithoutRegistryInputSchema } from './RegistryUserJoinUncheckedUpdateManyWithoutRegistryInputSchema';

export const RegistryUserJoinUpdateManyWithWhereWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryUserJoinUpdateManyWithWhereWithoutRegistryInput> =
  z
    .object({
      where: z.lazy(() => RegistryUserJoinScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => RegistryUserJoinUpdateManyMutationInputSchema),
        z.lazy(() => RegistryUserJoinUncheckedUpdateManyWithoutRegistryInputSchema),
      ]),
    })
    .strict();

export default RegistryUserJoinUpdateManyWithWhereWithoutRegistryInputSchema;
