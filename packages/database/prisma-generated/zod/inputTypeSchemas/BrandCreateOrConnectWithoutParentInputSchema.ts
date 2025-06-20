import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandCreateWithoutParentInputSchema } from './BrandCreateWithoutParentInputSchema';
import { BrandUncheckedCreateWithoutParentInputSchema } from './BrandUncheckedCreateWithoutParentInputSchema';

export const BrandCreateOrConnectWithoutParentInputSchema: z.ZodType<Prisma.BrandCreateOrConnectWithoutParentInput> = z.object({
  where: z.lazy(() => BrandWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BrandCreateWithoutParentInputSchema),z.lazy(() => BrandUncheckedCreateWithoutParentInputSchema) ]),
}).strict();

export default BrandCreateOrConnectWithoutParentInputSchema;
