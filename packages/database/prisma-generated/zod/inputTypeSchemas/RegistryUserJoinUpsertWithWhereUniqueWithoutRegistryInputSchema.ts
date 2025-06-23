import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinWhereUniqueInputSchema } from './RegistryUserJoinWhereUniqueInputSchema';
import { RegistryUserJoinUpdateWithoutRegistryInputSchema } from './RegistryUserJoinUpdateWithoutRegistryInputSchema';
import { RegistryUserJoinUncheckedUpdateWithoutRegistryInputSchema } from './RegistryUserJoinUncheckedUpdateWithoutRegistryInputSchema';
import { RegistryUserJoinCreateWithoutRegistryInputSchema } from './RegistryUserJoinCreateWithoutRegistryInputSchema';
import { RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema } from './RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema';

export const RegistryUserJoinUpsertWithWhereUniqueWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryUserJoinUpsertWithWhereUniqueWithoutRegistryInput> =
  z
    .object({
      where: z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => RegistryUserJoinUpdateWithoutRegistryInputSchema),
        z.lazy(() => RegistryUserJoinUncheckedUpdateWithoutRegistryInputSchema),
      ]),
      create: z.union([
        z.lazy(() => RegistryUserJoinCreateWithoutRegistryInputSchema),
        z.lazy(() => RegistryUserJoinUncheckedCreateWithoutRegistryInputSchema),
      ]),
    })
    .strict();

export default RegistryUserJoinUpsertWithWhereUniqueWithoutRegistryInputSchema;
