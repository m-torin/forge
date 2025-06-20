import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutChildrenInputSchema } from './BrandCreateWithoutChildrenInputSchema';
import { BrandUncheckedCreateWithoutChildrenInputSchema } from './BrandUncheckedCreateWithoutChildrenInputSchema';
import { BrandCreateOrConnectWithoutChildrenInputSchema } from './BrandCreateOrConnectWithoutChildrenInputSchema';
import { BrandUpsertWithoutChildrenInputSchema } from './BrandUpsertWithoutChildrenInputSchema';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateToOneWithWhereWithoutChildrenInputSchema } from './BrandUpdateToOneWithWhereWithoutChildrenInputSchema';
import { BrandUpdateWithoutChildrenInputSchema } from './BrandUpdateWithoutChildrenInputSchema';
import { BrandUncheckedUpdateWithoutChildrenInputSchema } from './BrandUncheckedUpdateWithoutChildrenInputSchema';

export const BrandUpdateOneWithoutChildrenNestedInputSchema: z.ZodType<Prisma.BrandUpdateOneWithoutChildrenNestedInput> = z.object({
  create: z.union([ z.lazy(() => BrandCreateWithoutChildrenInputSchema),z.lazy(() => BrandUncheckedCreateWithoutChildrenInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BrandCreateOrConnectWithoutChildrenInputSchema).optional(),
  upsert: z.lazy(() => BrandUpsertWithoutChildrenInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => BrandWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => BrandWhereInputSchema) ]).optional(),
  connect: z.lazy(() => BrandWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => BrandUpdateToOneWithWhereWithoutChildrenInputSchema),z.lazy(() => BrandUpdateWithoutChildrenInputSchema),z.lazy(() => BrandUncheckedUpdateWithoutChildrenInputSchema) ]).optional(),
}).strict();

export default BrandUpdateOneWithoutChildrenNestedInputSchema;
