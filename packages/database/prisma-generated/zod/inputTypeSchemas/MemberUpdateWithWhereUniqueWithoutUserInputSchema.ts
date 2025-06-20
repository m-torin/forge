import type { Prisma } from '../../client';

import { z } from 'zod';
import { MemberWhereUniqueInputSchema } from './MemberWhereUniqueInputSchema';
import { MemberUpdateWithoutUserInputSchema } from './MemberUpdateWithoutUserInputSchema';
import { MemberUncheckedUpdateWithoutUserInputSchema } from './MemberUncheckedUpdateWithoutUserInputSchema';

export const MemberUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.MemberUpdateWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => MemberWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => MemberUpdateWithoutUserInputSchema),z.lazy(() => MemberUncheckedUpdateWithoutUserInputSchema) ]),
}).strict();

export default MemberUpdateWithWhereUniqueWithoutUserInputSchema;
