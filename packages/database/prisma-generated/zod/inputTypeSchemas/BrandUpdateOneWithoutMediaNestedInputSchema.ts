import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutMediaInputSchema } from './BrandCreateWithoutMediaInputSchema';
import { BrandUncheckedCreateWithoutMediaInputSchema } from './BrandUncheckedCreateWithoutMediaInputSchema';
import { BrandCreateOrConnectWithoutMediaInputSchema } from './BrandCreateOrConnectWithoutMediaInputSchema';
import { BrandUpsertWithoutMediaInputSchema } from './BrandUpsertWithoutMediaInputSchema';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateToOneWithWhereWithoutMediaInputSchema } from './BrandUpdateToOneWithWhereWithoutMediaInputSchema';
import { BrandUpdateWithoutMediaInputSchema } from './BrandUpdateWithoutMediaInputSchema';
import { BrandUncheckedUpdateWithoutMediaInputSchema } from './BrandUncheckedUpdateWithoutMediaInputSchema';

export const BrandUpdateOneWithoutMediaNestedInputSchema: z.ZodType<Prisma.BrandUpdateOneWithoutMediaNestedInput> = z.object({
  create: z.union([ z.lazy(() => BrandCreateWithoutMediaInputSchema),z.lazy(() => BrandUncheckedCreateWithoutMediaInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BrandCreateOrConnectWithoutMediaInputSchema).optional(),
  upsert: z.lazy(() => BrandUpsertWithoutMediaInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => BrandWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => BrandWhereInputSchema) ]).optional(),
  connect: z.lazy(() => BrandWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => BrandUpdateToOneWithWhereWithoutMediaInputSchema),z.lazy(() => BrandUpdateWithoutMediaInputSchema),z.lazy(() => BrandUncheckedUpdateWithoutMediaInputSchema) ]).optional(),
}).strict();

export default BrandUpdateOneWithoutMediaNestedInputSchema;
