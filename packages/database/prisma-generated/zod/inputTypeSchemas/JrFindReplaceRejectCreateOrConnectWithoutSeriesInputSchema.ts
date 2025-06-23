import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectCreateWithoutSeriesInputSchema } from './JrFindReplaceRejectCreateWithoutSeriesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutSeriesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutSeriesInputSchema';

export const JrFindReplaceRejectCreateOrConnectWithoutSeriesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectCreateOrConnectWithoutSeriesInput> =
  z
    .object({
      where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => JrFindReplaceRejectCreateWithoutSeriesInputSchema),
        z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutSeriesInputSchema),
      ]),
    })
    .strict();

export default JrFindReplaceRejectCreateOrConnectWithoutSeriesInputSchema;
