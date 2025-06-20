import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastCreateWithoutJrFindReplaceRejectsInputSchema } from './CastCreateWithoutJrFindReplaceRejectsInputSchema';
import { CastUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './CastUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';
import { CastCreateOrConnectWithoutJrFindReplaceRejectsInputSchema } from './CastCreateOrConnectWithoutJrFindReplaceRejectsInputSchema';
import { CastWhereUniqueInputSchema } from './CastWhereUniqueInputSchema';

export const CastUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.CastUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInput> = z.object({
  create: z.union([ z.lazy(() => CastCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => CastCreateWithoutJrFindReplaceRejectsInputSchema).array(),z.lazy(() => CastUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => CastUncheckedCreateWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CastCreateOrConnectWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => CastCreateOrConnectWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CastWhereUniqueInputSchema),z.lazy(() => CastWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CastUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema;
