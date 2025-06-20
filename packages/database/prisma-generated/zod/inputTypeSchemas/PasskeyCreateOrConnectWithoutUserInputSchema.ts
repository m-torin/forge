import type { Prisma } from '../../client';

import { z } from 'zod';
import { PasskeyWhereUniqueInputSchema } from './PasskeyWhereUniqueInputSchema';
import { PasskeyCreateWithoutUserInputSchema } from './PasskeyCreateWithoutUserInputSchema';
import { PasskeyUncheckedCreateWithoutUserInputSchema } from './PasskeyUncheckedCreateWithoutUserInputSchema';

export const PasskeyCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.PasskeyCreateOrConnectWithoutUserInput> = z.object({
  where: z.lazy(() => PasskeyWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => PasskeyCreateWithoutUserInputSchema),z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default PasskeyCreateOrConnectWithoutUserInputSchema;
