import type { Prisma } from '../../client';

import { z } from 'zod';
import { MemberScalarWhereInputSchema } from './MemberScalarWhereInputSchema';
import { MemberUpdateManyMutationInputSchema } from './MemberUpdateManyMutationInputSchema';
import { MemberUncheckedUpdateManyWithoutUserInputSchema } from './MemberUncheckedUpdateManyWithoutUserInputSchema';

export const MemberUpdateManyWithWhereWithoutUserInputSchema: z.ZodType<Prisma.MemberUpdateManyWithWhereWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => MemberScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => MemberUpdateManyMutationInputSchema),
        z.lazy(() => MemberUncheckedUpdateManyWithoutUserInputSchema),
      ]),
    })
    .strict();

export default MemberUpdateManyWithWhereWithoutUserInputSchema;
