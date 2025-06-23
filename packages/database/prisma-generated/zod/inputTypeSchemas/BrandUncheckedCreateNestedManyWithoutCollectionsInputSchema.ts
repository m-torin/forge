import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutCollectionsInputSchema } from './BrandCreateWithoutCollectionsInputSchema';
import { BrandUncheckedCreateWithoutCollectionsInputSchema } from './BrandUncheckedCreateWithoutCollectionsInputSchema';
import { BrandCreateOrConnectWithoutCollectionsInputSchema } from './BrandCreateOrConnectWithoutCollectionsInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';

export const BrandUncheckedCreateNestedManyWithoutCollectionsInputSchema: z.ZodType<Prisma.BrandUncheckedCreateNestedManyWithoutCollectionsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => BrandCreateWithoutCollectionsInputSchema),
          z.lazy(() => BrandCreateWithoutCollectionsInputSchema).array(),
          z.lazy(() => BrandUncheckedCreateWithoutCollectionsInputSchema),
          z.lazy(() => BrandUncheckedCreateWithoutCollectionsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => BrandCreateOrConnectWithoutCollectionsInputSchema),
          z.lazy(() => BrandCreateOrConnectWithoutCollectionsInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => BrandWhereUniqueInputSchema),
          z.lazy(() => BrandWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default BrandUncheckedCreateNestedManyWithoutCollectionsInputSchema;
