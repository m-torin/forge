import type { Prisma } from '../../client';

import { z } from 'zod';
import { PasskeyWhereUniqueInputSchema } from './PasskeyWhereUniqueInputSchema';
import { PasskeyUpdateWithoutUserInputSchema } from './PasskeyUpdateWithoutUserInputSchema';
import { PasskeyUncheckedUpdateWithoutUserInputSchema } from './PasskeyUncheckedUpdateWithoutUserInputSchema';
import { PasskeyCreateWithoutUserInputSchema } from './PasskeyCreateWithoutUserInputSchema';
import { PasskeyUncheckedCreateWithoutUserInputSchema } from './PasskeyUncheckedCreateWithoutUserInputSchema';

export const PasskeyUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PasskeyUpsertWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => PasskeyWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => PasskeyUpdateWithoutUserInputSchema),
        z.lazy(() => PasskeyUncheckedUpdateWithoutUserInputSchema),
      ]),
      create: z.union([
        z.lazy(() => PasskeyCreateWithoutUserInputSchema),
        z.lazy(() => PasskeyUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default PasskeyUpsertWithWhereUniqueWithoutUserInputSchema;
