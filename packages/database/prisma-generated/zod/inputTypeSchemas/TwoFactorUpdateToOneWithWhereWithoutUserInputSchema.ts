import type { Prisma } from '../../client';

import { z } from 'zod';
import { TwoFactorWhereInputSchema } from './TwoFactorWhereInputSchema';
import { TwoFactorUpdateWithoutUserInputSchema } from './TwoFactorUpdateWithoutUserInputSchema';
import { TwoFactorUncheckedUpdateWithoutUserInputSchema } from './TwoFactorUncheckedUpdateWithoutUserInputSchema';

export const TwoFactorUpdateToOneWithWhereWithoutUserInputSchema: z.ZodType<Prisma.TwoFactorUpdateToOneWithWhereWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => TwoFactorWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => TwoFactorUpdateWithoutUserInputSchema),
        z.lazy(() => TwoFactorUncheckedUpdateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default TwoFactorUpdateToOneWithWhereWithoutUserInputSchema;
