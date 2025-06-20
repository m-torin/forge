import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandCreateWithoutJollyRogerInputSchema } from './BrandCreateWithoutJollyRogerInputSchema';
import { BrandUncheckedCreateWithoutJollyRogerInputSchema } from './BrandUncheckedCreateWithoutJollyRogerInputSchema';

export const BrandCreateOrConnectWithoutJollyRogerInputSchema: z.ZodType<Prisma.BrandCreateOrConnectWithoutJollyRogerInput> = z.object({
  where: z.lazy(() => BrandWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => BrandCreateWithoutJollyRogerInputSchema),z.lazy(() => BrandUncheckedCreateWithoutJollyRogerInputSchema) ]),
}).strict();

export default BrandCreateOrConnectWithoutJollyRogerInputSchema;
