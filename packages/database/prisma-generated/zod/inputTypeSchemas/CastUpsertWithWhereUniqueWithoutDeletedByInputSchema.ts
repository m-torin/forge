import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastWhereUniqueInputSchema } from './CastWhereUniqueInputSchema';
import { CastUpdateWithoutDeletedByInputSchema } from './CastUpdateWithoutDeletedByInputSchema';
import { CastUncheckedUpdateWithoutDeletedByInputSchema } from './CastUncheckedUpdateWithoutDeletedByInputSchema';
import { CastCreateWithoutDeletedByInputSchema } from './CastCreateWithoutDeletedByInputSchema';
import { CastUncheckedCreateWithoutDeletedByInputSchema } from './CastUncheckedCreateWithoutDeletedByInputSchema';

export const CastUpsertWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.CastUpsertWithWhereUniqueWithoutDeletedByInput> = z.object({
  where: z.lazy(() => CastWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CastUpdateWithoutDeletedByInputSchema),z.lazy(() => CastUncheckedUpdateWithoutDeletedByInputSchema) ]),
  create: z.union([ z.lazy(() => CastCreateWithoutDeletedByInputSchema),z.lazy(() => CastUncheckedCreateWithoutDeletedByInputSchema) ]),
}).strict();

export default CastUpsertWithWhereUniqueWithoutDeletedByInputSchema;
