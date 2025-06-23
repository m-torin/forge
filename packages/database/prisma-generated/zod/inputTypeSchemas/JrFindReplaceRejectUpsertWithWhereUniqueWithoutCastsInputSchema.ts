import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutCastsInputSchema } from './JrFindReplaceRejectUpdateWithoutCastsInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutCastsInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutCastsInputSchema';
import { JrFindReplaceRejectCreateWithoutCastsInputSchema } from './JrFindReplaceRejectCreateWithoutCastsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutCastsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutCastsInputSchema';

export const JrFindReplaceRejectUpsertWithWhereUniqueWithoutCastsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpsertWithWhereUniqueWithoutCastsInput> =
  z
    .object({
      where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => JrFindReplaceRejectUpdateWithoutCastsInputSchema),
        z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutCastsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => JrFindReplaceRejectCreateWithoutCastsInputSchema),
        z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutCastsInputSchema),
      ]),
    })
    .strict();

export default JrFindReplaceRejectUpsertWithWhereUniqueWithoutCastsInputSchema;
