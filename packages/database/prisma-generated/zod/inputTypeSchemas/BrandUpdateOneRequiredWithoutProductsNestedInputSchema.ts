import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutProductsInputSchema } from './BrandCreateWithoutProductsInputSchema';
import { BrandUncheckedCreateWithoutProductsInputSchema } from './BrandUncheckedCreateWithoutProductsInputSchema';
import { BrandCreateOrConnectWithoutProductsInputSchema } from './BrandCreateOrConnectWithoutProductsInputSchema';
import { BrandUpsertWithoutProductsInputSchema } from './BrandUpsertWithoutProductsInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateToOneWithWhereWithoutProductsInputSchema } from './BrandUpdateToOneWithWhereWithoutProductsInputSchema';
import { BrandUpdateWithoutProductsInputSchema } from './BrandUpdateWithoutProductsInputSchema';
import { BrandUncheckedUpdateWithoutProductsInputSchema } from './BrandUncheckedUpdateWithoutProductsInputSchema';

export const BrandUpdateOneRequiredWithoutProductsNestedInputSchema: z.ZodType<Prisma.BrandUpdateOneRequiredWithoutProductsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => BrandCreateWithoutProductsInputSchema),
          z.lazy(() => BrandUncheckedCreateWithoutProductsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => BrandCreateOrConnectWithoutProductsInputSchema).optional(),
      upsert: z.lazy(() => BrandUpsertWithoutProductsInputSchema).optional(),
      connect: z.lazy(() => BrandWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => BrandUpdateToOneWithWhereWithoutProductsInputSchema),
          z.lazy(() => BrandUpdateWithoutProductsInputSchema),
          z.lazy(() => BrandUncheckedUpdateWithoutProductsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default BrandUpdateOneRequiredWithoutProductsNestedInputSchema;
