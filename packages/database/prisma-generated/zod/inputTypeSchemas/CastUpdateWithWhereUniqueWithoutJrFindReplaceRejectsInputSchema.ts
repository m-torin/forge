import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastWhereUniqueInputSchema } from './CastWhereUniqueInputSchema';
import { CastUpdateWithoutJrFindReplaceRejectsInputSchema } from './CastUpdateWithoutJrFindReplaceRejectsInputSchema';
import { CastUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema } from './CastUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema';

export const CastUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.CastUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => CastWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => CastUpdateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => CastUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default CastUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema;
