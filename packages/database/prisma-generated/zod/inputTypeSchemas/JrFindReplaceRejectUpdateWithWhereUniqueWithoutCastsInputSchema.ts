import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectUpdateWithoutCastsInputSchema } from './JrFindReplaceRejectUpdateWithoutCastsInputSchema';
import { JrFindReplaceRejectUncheckedUpdateWithoutCastsInputSchema } from './JrFindReplaceRejectUncheckedUpdateWithoutCastsInputSchema';

export const JrFindReplaceRejectUpdateWithWhereUniqueWithoutCastsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectUpdateWithWhereUniqueWithoutCastsInput> =
  z
    .object({
      where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => JrFindReplaceRejectUpdateWithoutCastsInputSchema),
        z.lazy(() => JrFindReplaceRejectUncheckedUpdateWithoutCastsInputSchema),
      ]),
    })
    .strict();

export default JrFindReplaceRejectUpdateWithWhereUniqueWithoutCastsInputSchema;
