import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandCreateWithoutCollectionsInputSchema } from './BrandCreateWithoutCollectionsInputSchema';
import { BrandUncheckedCreateWithoutCollectionsInputSchema } from './BrandUncheckedCreateWithoutCollectionsInputSchema';

export const BrandCreateOrConnectWithoutCollectionsInputSchema: z.ZodType<Prisma.BrandCreateOrConnectWithoutCollectionsInput> = z.object({
  where: z.lazy(() => BrandWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BrandCreateWithoutCollectionsInputSchema),z.lazy(() => BrandUncheckedCreateWithoutCollectionsInputSchema) ]),
}).strict();

export default BrandCreateOrConnectWithoutCollectionsInputSchema;
