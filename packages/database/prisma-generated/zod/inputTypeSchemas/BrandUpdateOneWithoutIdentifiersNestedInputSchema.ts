import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateWithoutIdentifiersInputSchema } from './BrandCreateWithoutIdentifiersInputSchema';
import { BrandUncheckedCreateWithoutIdentifiersInputSchema } from './BrandUncheckedCreateWithoutIdentifiersInputSchema';
import { BrandCreateOrConnectWithoutIdentifiersInputSchema } from './BrandCreateOrConnectWithoutIdentifiersInputSchema';
import { BrandUpsertWithoutIdentifiersInputSchema } from './BrandUpsertWithoutIdentifiersInputSchema';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';
import { BrandWhereUniqueInputSchema } from './BrandWhereUniqueInputSchema';
import { BrandUpdateToOneWithWhereWithoutIdentifiersInputSchema } from './BrandUpdateToOneWithWhereWithoutIdentifiersInputSchema';
import { BrandUpdateWithoutIdentifiersInputSchema } from './BrandUpdateWithoutIdentifiersInputSchema';
import { BrandUncheckedUpdateWithoutIdentifiersInputSchema } from './BrandUncheckedUpdateWithoutIdentifiersInputSchema';

export const BrandUpdateOneWithoutIdentifiersNestedInputSchema: z.ZodType<Prisma.BrandUpdateOneWithoutIdentifiersNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => BrandCreateWithoutIdentifiersInputSchema),
          z.lazy(() => BrandUncheckedCreateWithoutIdentifiersInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => BrandCreateOrConnectWithoutIdentifiersInputSchema).optional(),
      upsert: z.lazy(() => BrandUpsertWithoutIdentifiersInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => BrandWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => BrandWhereInputSchema)]).optional(),
      connect: z.lazy(() => BrandWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => BrandUpdateToOneWithWhereWithoutIdentifiersInputSchema),
          z.lazy(() => BrandUpdateWithoutIdentifiersInputSchema),
          z.lazy(() => BrandUncheckedUpdateWithoutIdentifiersInputSchema),
        ])
        .optional(),
    })
    .strict();

export default BrandUpdateOneWithoutIdentifiersNestedInputSchema;
