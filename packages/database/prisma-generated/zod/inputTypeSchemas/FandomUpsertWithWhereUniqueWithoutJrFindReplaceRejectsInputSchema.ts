import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomUpdateWithoutJrFindReplaceRejectsInputSchema } from './FandomUpdateWithoutJrFindReplaceRejectsInputSchema';
import { FandomUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema } from './FandomUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema';
import { FandomCreateWithoutJrFindReplaceRejectsInputSchema } from './FandomCreateWithoutJrFindReplaceRejectsInputSchema';
import { FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';

export const FandomUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.FandomUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => FandomWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => FandomUpdateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => FandomUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => FandomCreateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default FandomUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema;
