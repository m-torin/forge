import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutIdentifiersInputSchema } from './BrandCreateWithoutIdentifiersInputSchema';
import { BrandUncheckedCreateWithoutIdentifiersInputSchema } from './BrandUncheckedCreateWithoutIdentifiersInputSchema';
import { BrandCreateOrConnectWithoutIdentifiersInputSchema } from './BrandCreateOrConnectWithoutIdentifiersInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';

export const BrandCreateNestedOneWithoutIdentifiersInputSchema: z.ZodType<Prisma.BrandCreateNestedOneWithoutIdentifiersInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => BrandCreateWithoutIdentifiersInputSchema),
          z.lazy(() => BrandUncheckedCreateWithoutIdentifiersInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => BrandCreateOrConnectWithoutIdentifiersInputSchema).optional(),
      connect: z.lazy(() => BrandWhereUniqueInputSchema).optional(),
    })
    .strict();

export default BrandCreateNestedOneWithoutIdentifiersInputSchema;
