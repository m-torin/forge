import type { Prisma } from '../../client';

import { z } from 'zod';
import { PasskeyScalarWhereInputSchema } from './PasskeyScalarWhereInputSchema';
import { PasskeyUpdateManyMutationInputSchema } from './PasskeyUpdateManyMutationInputSchema';
import { PasskeyUncheckedUpdateManyWithoutUserInputSchema } from './PasskeyUncheckedUpdateManyWithoutUserInputSchema';

export const PasskeyUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.PasskeyUpdateManyWithWhereWithoutUserInput> = z.object({
  where: z.lazy(() => PasskeyScalarWhereInputSchema),
  data: z.union([ z.lazy(() => PasskeyUpdateManyMutationInputSchema),z.lazy(() => PasskeyUncheckedUpdateManyWithoutUserInputSchema) ]),
}).strict();

export default PasskeyUpdateManyWithWhereWithoutUserInputSchema;
