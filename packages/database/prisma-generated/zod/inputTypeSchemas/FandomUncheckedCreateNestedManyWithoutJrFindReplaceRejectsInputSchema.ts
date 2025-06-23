import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomCreateWithoutJrFindReplaceRejectsInputSchema } from './FandomCreateWithoutJrFindReplaceRejectsInputSchema';
import { FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';
import { FandomCreateOrConnectWithoutJrFindReplaceRejectsInputSchema } from './FandomCreateOrConnectWithoutJrFindReplaceRejectsInputSchema';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';

export const FandomUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.FandomUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => FandomCreateWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => FandomCreateWithoutJrFindReplaceRejectsInputSchema).array(),
          z.lazy(() => FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => FandomUncheckedCreateWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => FandomCreateOrConnectWithoutJrFindReplaceRejectsInputSchema),
          z.lazy(() => FandomCreateOrConnectWithoutJrFindReplaceRejectsInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => FandomWhereUniqueInputSchema),
          z.lazy(() => FandomWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default FandomUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema;
