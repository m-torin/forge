import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutSeriesInputSchema } from './JrFindReplaceRejectUpdateWithoutSeriesInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutSeriesInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutSeriesInputSchema';

export const JrFindReplaceRejectUpdateWithWhereUniqueWithoutSeriesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateWithWhereUniqueWithoutSeriesInput> =
  z
    .object({
      where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => JrFindReplaceRejectUpdateWithoutSeriesInputSchema),
        z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutSeriesInputSchema),
      ]),
    })
    .strict();

export default JrFindReplaceRejectUpdateWithWhereUniqueWithoutSeriesInputSchema;
