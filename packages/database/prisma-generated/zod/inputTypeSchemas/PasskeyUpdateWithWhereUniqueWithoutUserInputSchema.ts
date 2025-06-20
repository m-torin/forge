import type { Prisma } from '../../client';

import { z } from 'zod';
import { PasskeyWhereUniqueInputSchema } from './PasskeyWhereUniqueInputSchema';
import { PasskeyUpdateWithoutUserInputSchema } from './PasskeyUpdateWithoutUserInputSchema';
import { PasskeyUncheckedUpdateWithoutUserInputSchema } from './PasskeyUncheckedUpdateWithoutUserInputSchema';

export const PasskeyUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.PasskeyUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => PasskeyWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => PasskeyUpdateWithoutUserInputSchema),z.lazy(() => PasskeyUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default PasskeyUpdateWithWhereUniqueWithoutUserInputSchema;
