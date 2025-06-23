import type { Prisma } from '../../client';

import { z } from 'zod';
import { JrFindReplaceRejectCreateWithoutCastsInputSchema } from './JrFindReplaceRejectCreateWithoutCastsInputSchema';
import { JrFindReplaceRejectUncheckedCreateWithoutCastsInputSchema } from './JrFindReplaceRejectUncheckedCreateWithoutCastsInputSchema';
import { JrFindReplaceRejectCreateOrConnectWithoutCastsInputSchema } from './JrFindReplaceRejectCreateOrConnectWithoutCastsInputSchema';
import { JrFindReplaceRejectWhereUniqueInputSchema } from './JrFindReplaceRejectWhereUniqueInputSchema';

export const JrFindReplaceRejectCreateNestedManyWithoutCastsInputSchema: z.ZodType<Prisma.JrFindReplaceRejectCreateNestedManyWithoutCastsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => JrFindReplaceRejectCreateWithoutCastsInputSchema),
          z.lazy(() => JrFindReplaceRejectCreateWithoutCastsInputSchema).array(),
          z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutCastsInputSchema),
          z.lazy(() => JrFindReplaceRejectUncheckedCreateWithoutCastsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutCastsInputSchema),
          z.lazy(() => JrFindReplaceRejectCreateOrConnectWithoutCastsInputSchema).array(),
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

export default JrFindReplaceRejectCreateNestedManyWithoutCastsInputSchema;
