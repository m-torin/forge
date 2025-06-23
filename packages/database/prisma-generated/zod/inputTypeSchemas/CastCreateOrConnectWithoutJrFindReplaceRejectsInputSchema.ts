import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastWhereUniqueInputSchema } from './CastWhereUniqueInputSchema';
import { CastCreateWithoutJrFindReplaceRejectsInputSchema } from './CastCreateWithoutJrFindReplaceRejectsInputSchema';
import { CastUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './CastUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';

export const CastCreateOrConnectWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.CastCreateOrConnectWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => CastWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => CastCreateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => CastUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default CastCreateOrConnectWithoutJrFindReplaceRejectsInputSchema;
