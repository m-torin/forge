import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutMediaInputSchema } from './BrandCreateWithoutMediaInputSchema';
import { BrandUncheckedCreateWithoutMediaInputSchema } from './BrandUncheckedCreateWithoutMediaInputSchema';
import { BrandCreateOrConnectWithoutMediaInputSchema } from './BrandCreateOrConnectWithoutMediaInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';

export const BrandCreateNestedOneWithoutMediaInputSchema: z.ZodType<Prisma.BrandCreateNestedOneWithoutMediaInput> = z.object({
  create: z.union([ z.lazy(() => BrandCreateWithoutMediaInputSchema),z.lazy(() => BrandUncheckedCreateWithoutMediaInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BrandCreateOrConnectWithoutMediaInputSchema).optional(),
  connect: z.lazy(() => BrandWhereUniqueInputSchema).optional()
}).strict();

export default BrandCreateNestedOneWithoutMediaInputSchema;
