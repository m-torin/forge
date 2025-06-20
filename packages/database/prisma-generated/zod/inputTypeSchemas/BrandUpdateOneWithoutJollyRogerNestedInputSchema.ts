import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutJollyRogerInputSchema } from './BrandCreateWithoutJollyRogerInputSchema';
import { BrandUncheckedCreateWithoutJollyRogerInputSchema } from './BrandUncheckedCreateWithoutJollyRogerInputSchema';
import { BrandCreateOrConnectWithoutJollyRogerInputSchema } from './BrandCreateOrConnectWithoutJollyRogerInputSchema';
import { BrandUpsertWithoutJollyRogerInputSchema } from './BrandUpsertWithoutJollyRogerInputSchema';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateToOneWithWhereWithoutJollyRogerInputSchema } from './BrandUpdateToOneWithWhereWithoutJollyRogerInputSchema';
import { BrandUpdateWithoutJollyRogerInputSchema } from './BrandUpdateWithoutJollyRogerInputSchema';
import { BrandUncheckedUpdateWithoutJollyRogerInputSchema } from './BrandUncheckedUpdateWithoutJollyRogerInputSchema';

export const BrandUpdateOneWithoutJollyRogerNestedInputSchema: z.ZodType<Prisma.BrandUpdateOneWithoutJollyRogerNestedInput> = z.object({
  create: z.union([ z.lazy(() => BrandCreateWithoutJollyRogerInputSchema),z.lazy(() => BrandUncheckedCreateWithoutJollyRogerInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => BrandCreateOrConnectWithoutJollyRogerInputSchema).optional(),
  upsert: z.lazy(() => BrandUpsertWithoutJollyRogerInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => BrandWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => BrandWhereInputSchema) ]).optional(),
  connect: z.lazy(() => BrandWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => BrandUpdateToOneWithWhereWithoutJollyRogerInputSchema),z.lazy(() => BrandUpdateWithoutJollyRogerInputSchema),z.lazy(() => BrandUncheckedUpdateWithoutJollyRogerInputSchema) ]).optional(),
}).strict();

export default BrandUpdateOneWithoutJollyRogerNestedInputSchema;
