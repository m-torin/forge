import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';
import { JrFindReplaceRejectCreateWithoutCastsInputSchema } from './JrFindReplaceRejectCreateWithoutCastsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutCastsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutCastsInputSchema';

export const JrFindReplaceRejectCreateOrConnectWithoutCastsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectCreateOrConnectWithoutCastsInput> =
  z
    .object({
      where: z.lazy(() => JrFindReplaceRejectWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => JrFindReplaceRejectCreateWithoutCastsInputSchema),
        z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutCastsInputSchema),
      ]),
    })
    .strict();

export default JrFindReplaceRejectCreateOrConnectWithoutCastsInputSchema;
