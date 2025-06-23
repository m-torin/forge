import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutSeriesInputSchema } from './JrFindReplaceRejectCreateWithoutSeriesInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutSeriesInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutSeriesInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutSeriesInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutSeriesInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';

export const JrFindReplaceRejectUncheckedCreateNestedManyWithoutSeriesInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUncheckedCreateNestedManyWithoutSeriesInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => JrFindReplaceRejectCreateWithoutSeriesInputSchema),
          z.lazy(() => JrFindReplaceRejectCreateWithoutSeriesInputSchema).array(),
          z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutSeriesInputSchema),
          z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutSeriesInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutSeriesInputSchema),
          z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutSeriesInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
          z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default JrFindReplaceRejectUncheckedCreateNestedManyWithoutSeriesInputSchema;
