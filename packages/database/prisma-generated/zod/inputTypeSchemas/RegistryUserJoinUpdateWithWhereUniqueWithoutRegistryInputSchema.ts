import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinWhereUniqueInputSchema } from './RegistryUserJoinWhereUniqueInputSchema';
import { RegistryUserJoinUpdateWithoutRegistryInputSchema } from './RegistryUserJoinUpdateWithoutRegistryInputSchema';
import { RegistryUserJoinUncheckedUpdateWithoutRegistryInputSchema } from './RegistryUserJoinUncheckedUpdateWithoutRegistryInputSchema';

export const RegistryUserJoinUpdateWithWhereUniqueWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryUserJoinUpdateWithWhereUniqueWithoutRegistryInput> =
  z
    .object({
      where: z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => RegistryUserJoinUpdateWithoutRegistryInputSchema),
        z.lazy(() => RegistryUserJoinUncheckedUpdateWithoutRegistryInputSchema),
      ]),
    })
    .strict();

export default RegistryUserJoinUpdateWithWhereUniqueWithoutRegistryInputSchema;
