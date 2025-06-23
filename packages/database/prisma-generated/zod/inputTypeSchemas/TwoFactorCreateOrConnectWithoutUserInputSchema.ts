import type { Prisma } from '../../client';

import { z } from 'zod';
import { TwoFactorWhereUniqueInputSchema } from './TwoFactorWhereUniqueInputSchema';
import { TwoFactorCreateWithoutUserInputSchema } from './TwoFactorCreateWithoutUserInputSchema';
import { TwoFactorUncheckedCreateWithoutUserInputSchema } from './TwoFactorUncheckedCreateWithoutUserInputSchema';

export const TwoFactorCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.TwoFactorCreateOrConnectWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => TwoFactorWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => TwoFactorCreateWithoutUserInputSchema),
        z.lazy(() => TwoFactorUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default TwoFactorCreateOrConnectWithoutUserInputSchema;
