import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomCreateWithoutJrFindReplaceRejectsInputSchema } from './FandomCreateWithoutJrFindReplaceRejectsInputSchema';
import { FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';

export const FandomCreateOrConnectWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.FandomCreateOrConnectWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => FandomWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => FandomCreateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default FandomCreateOrConnectWithoutJrFindReplaceRejectsInputSchema;
