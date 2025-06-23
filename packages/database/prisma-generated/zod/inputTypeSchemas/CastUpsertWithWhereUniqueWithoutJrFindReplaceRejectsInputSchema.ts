import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastWhereUniqueInputSchema } from './CastWhereUniqueInputSchema';
import { CastUpdateWithoutJrFindReplaceRejectsInputSchema } from './CastUpdateWithoutJrFindReplaceRejectsInputSchema';
import { CastUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema } from './CastUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema';
import { CastCreateWithoutJrFindReplaceRejectsInputSchema } from './CastCreateWithoutJrFindReplaceRejectsInputSchema';
import { CastUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './CastUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';

export const CastUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.CastUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => CastWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => CastUpdateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => CastUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => CastCreateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => CastUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default CastUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema;
