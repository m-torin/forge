import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandCreateWithoutIdentifiersInputSchema } from './BrandCreateWithoutIdentifiersInputSchema';
import { BrandUncheckedCreateWithoutIdentifiersInputSchema } from './BrandUncheckedCreateWithoutIdentifiersInputSchema';

export const BrandCreateOrConnectWithoutIdentifiersInputSchema: z.ZodType<Prisma.BrandCreateOrConnectWithoutIdentifiersInput> = z.object({
  where: z.lazy(() => BrandWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BrandCreateWithoutIdentifiersInputSchema),z.lazy(() => BrandUncheckedCreateWithoutIdentifiersInputSchema) ]),
}).strict();

export default BrandCreateOrConnectWithoutIdentifiersInputSchema;
