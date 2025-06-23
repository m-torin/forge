import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutProductsInputSchema } from './BrandCreateWithoutProductsInputSchema';
import { BrandUncheckedCreateWithoutProductsInputSchema } from './BrandUncheckedCreateWithoutProductsInputSchema';
import { BrandCreateOrConnectWithoutProductsInputSchema } from './BrandCreateOrConnectWithoutProductsInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';

export const BrandCreateNestedOneWithoutProductsInputSchema: z.ZodType<Prisma.BrandCreateNestedOneWithoutProductsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => BrandCreateWithoutProductsInputSchema),
          z.lazy(() => BrandUncheckedCreateWithoutProductsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => BrandCreateOrConnectWithoutProductsInputSchema).optional(),
      connect: z.lazy(() => BrandWhereUniqueInputSchema).optional(),
    })
    .strict();

export default BrandCreateNestedOneWithoutProductsInputSchema;
