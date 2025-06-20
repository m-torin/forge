import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutSeriesInputSchema } from './JrFindReplaceRejectUpdateWithoutSeriesInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutSeriesInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutSeriesInputSchema';
import { JrFindReplaceRejectCreateWithoutSeriesInputSchema } from './JrFindReplaceRejectCreateWithoutSeriesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutSeriesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutSeriesInputSchema';

export const JrFindReplaceRejectUpsertWithWhereUniqueWithoutSeriesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpsertWithWhereUniqueWithoutSeriesInput> = z.object({
  where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => JrFindReplaceRejectUpdateWithoutSeriesInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutSeriesInputSchema) ]),
  create: z.union([ z.lazy(() => JrFindReplaceRejectCreateWithoutSeriesInputSchema),z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutSeriesInputSchema) ]),
}).strict();

export default JrFindReplaceRejectUpsertWithWhereUniqueWithoutSeriesInputSchema;
