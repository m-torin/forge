import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinWhereUniqueInputSchema } from './RegistryUserJoinWhereUniqueInputSchema';
import { RegistryUserJoinUpdateWithoutUserInputSchema } from './RegistryUserJoinUpdateWithoutUserInputSchema';
import { RegistryUserJoinUncheckedUpdateWithoutUserInputSchema } from './RegistryUserJoinUncheckedUpdateWithoutUserInputSchema';

export const RegistryUserJoinUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.RegistryUserJoinUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => RegistryUserJoinWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => RegistryUserJoinUpdateWithoutUserInputSchema),z.lazy(() => RegistryUserJoinUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default RegistryUserJoinUpdateWithWhereUniqueWithoutUserInputSchema;
