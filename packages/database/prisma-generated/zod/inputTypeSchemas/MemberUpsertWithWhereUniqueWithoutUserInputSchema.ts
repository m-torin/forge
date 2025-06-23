import type { Prisma } from '../../client';

import { z } from 'zod';
import { MemberWhereUniqueInputSchema } from './MemberWhereUniqueInputSchema';
import { MemberUpdateWithoutUserInputSchema } from './MemberUpdateWithoutUserInputSchema';
import { MemberUncheckedUpdateWithoutUserInputSchema } from './MemberUncheckedUpdateWithoutUserInputSchema';
import { MemberCreateWithoutUserInputSchema } from './MemberCreateWithoutUserInputSchema';
import { MemberUncheckedCreateWithoutUserInputSchema } from './MemberUncheckedCreateWithoutUserInputSchema';

export const MemberUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.MemberUpsertWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => MemberWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => MemberUpdateWithoutUserInputSchema),
        z.lazy(() => MemberUncheckedUpdateWithoutUserInputSchema),
      ]),
      create: z.union([
        z.lazy(() => MemberCreateWithoutUserInputSchema),
        z.lazy(() => MemberUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default MemberUpsertWithWhereUniqueWithoutUserInputSchema;
