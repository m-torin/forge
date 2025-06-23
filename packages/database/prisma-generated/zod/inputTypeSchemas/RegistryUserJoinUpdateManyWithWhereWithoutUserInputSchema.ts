import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinScalarWhereInputSchema } from './RegistryUserJoinScalarWhereInputSchema';
import { RegistryUserJoinUpdateManyMutationInputSchema } from './RegistryUserJoinUpdateManyMutationInputSchema';
import { RegistryUserJoinUncheckedUpdateManyWithoutUserInputSchema } from './RegistryUserJoinUncheckedUpdateManyWithoutUserInputSchema';

export const RegistryUserJoinUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.RegistryUserJoinUpdateManyWithWhereWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => RegistryUserJoinScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => RegistryUserJoinUpdateManyMutationInputSchema),
        z.lazy(() => RegistryUserJoinUncheckedUpdateManyWithoutUserInputSchema),
      ]),
    })
    .strict();

export default RegistryUserJoinUpdateManyWithWhereWithoutUserInputSchema;
