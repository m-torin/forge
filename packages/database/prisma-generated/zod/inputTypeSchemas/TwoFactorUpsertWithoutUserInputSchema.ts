import type { Prisma } from '../../client';

import { z } from 'zod';
import { TwoFactorUpdateWithoutUserInputSchema } from './TwoFactorUpdateWithoutUserInputSchema';
import { TwoFactorUncheckedUpdateWithoutUserInputSchema } from './TwoFactorUncheckedUpdateWithoutUserInputSchema';
import { TwoFactorCreateWithoutUserInputSchema } from './TwoFactorCreateWithoutUserInputSchema';
import { TwoFactorUncheckedCreateWithoutUserInputSchema } from './TwoFactorUncheckedCreateWithoutUserInputSchema';
import { TwoFactorWhereInputSchema } from './TwoFactorWhereInputSchema';

export const TwoFactorUpsertWithoutUserInputSchema: z.ZodType<Prisma.TwoFactorUpsertWithoutUserInput> = z.object({
  update: z.union([ z.lazy(() => TwoFactorUpdateWithoutUserInputSchema),z.lazy(() => TwoFactorUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => TwoFactorCreateWithoutUserInputSchema),z.lazy(() => TwoFactorUncheckedCreateWithoutUserInputSchema) ]),
  where: z.lazy(() => TwoFactorWhereInputSchema).optional()
}).strict();

export default TwoFactorUpsertWithoutUserInputSchema;
