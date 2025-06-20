import type { Prisma } from '../../client';

import { z } from 'zod';
import { TwoFactorCreateWithoutUserInputSchema } from './TwoFactorCreateWithoutUserInputSchema';
import { TwoFactorUncheckedCreateWithoutUserInputSchema } from './TwoFactorUncheckedCreateWithoutUserInputSchema';
import { TwoFactorCreateOrConnectWithoutUserInputSchema } from './TwoFactorCreateOrConnectWithoutUserInputSchema';
import { TwoFactorWhereUniqueInputSchema } from './TwoFactorWhereUniqueInputSchema';

export const TwoFactorUncheckedCreateNestedOneWithoutUserInputSchema: z.ZodType<Prisma.TwoFactorUncheckedCreateNestedOneWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => TwoFactorCreateWithoutUserInputSchema),z.lazy(() => TwoFactorUncheckedCreateWithoutUserInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => TwoFactorCreateOrConnectWithoutUserInputSchema).optional(),
  connect: z.lazy(() => TwoFactorWhereUniqueInputSchema).optional()
}).strict();

export default TwoFactorUncheckedCreateNestedOneWithoutUserInputSchema;
