import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandCreateWithoutJrFindReplaceRejectsInputSchema } from './BrandCreateWithoutJrFindReplaceRejectsInputSchema';
import { BrandUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './BrandUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';

export const BrandCreateOrConnectWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.BrandCreateOrConnectWithoutJrFindReplaceRejectsInput> = z.object({
  where: z.lazy(() => BrandWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BrandCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => BrandUncheckedCreateWithoutJrFindReplaceRejectsInputSchema) ]),
}).strict();

export default BrandCreateOrConnectWithoutJrFindReplaceRejectsInputSchema;
