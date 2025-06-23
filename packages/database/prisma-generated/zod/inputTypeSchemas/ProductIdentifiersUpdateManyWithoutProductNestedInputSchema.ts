import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersCreateWithoutProductInputSchema } from './ProductIdentifiersCreateWithoutProductInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutProductInputSchema } from './ProductIdentifiersUncheckedCreateWithoutProductInputSchema';
import { ProductIdentifiersCreateOrConnectWithoutProductInputSchema } from './ProductIdentifiersCreateOrConnectWithoutProductInputSchema';
import { ProductIdentifiersUpsertWithWhereUniqueWithoutProductInputSchema } from './ProductIdentifiersUpsertWithWhereUniqueWithoutProductInputSchema';
import { ProductIdentifiersCreateManyProductInputEnvelopeSchema } from './ProductIdentifiersCreateManyProductInputEnvelopeSchema';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersUpdateWithWhereUniqueWithoutProductInputSchema } from './ProductIdentifiersUpdateWithWhereUniqueWithoutProductInputSchema';
import { ProductIdentifiersUpdateManyWithWhereWithoutProductInputSchema } from './ProductIdentifiersUpdateManyWithWhereWithoutProductInputSchema';
import { ProductIdentifiersScalarWhereInputSchema } from './ProductIdentifiersScalarWhereInputSchema';

export const ProductIdentifiersUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.ProductIdentifiersUpdateManyWithoutProductNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductIdentifiersCreateWithoutProductInputSchema),
          z.lazy(() => ProductIdentifiersCreateWithoutProductInputSchema).array(),
          z.lazy(() => ProductIdentifiersUncheckedCreateWithoutProductInputSchema),
          z.lazy(() => ProductIdentifiersUncheckedCreateWithoutProductInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductIdentifiersCreateOrConnectWithoutProductInputSchema),
          z.lazy(() => ProductIdentifiersCreateOrConnectWithoutProductInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => ProductIdentifiersUpsertWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => ProductIdentifiersUpsertWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => ProductIdentifiersCreateManyProductInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
          z.lazy(() => ProductIdentifiersWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
          z.lazy(() => ProductIdentifiersWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
          z.lazy(() => ProductIdentifiersWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => ProductIdentifiersWhereUniqueInputSchema),
          z.lazy(() => ProductIdentifiersWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => ProductIdentifiersUpdateWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => ProductIdentifiersUpdateWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => ProductIdentifiersUpdateManyWithWhereWithoutProductInputSchema),
          z.lazy(() => ProductIdentifiersUpdateManyWithWhereWithoutProductInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => ProductIdentifiersScalarWhereInputSchema),
          z.lazy(() => ProductIdentifiersScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default ProductIdentifiersUpdateManyWithoutProductNestedInputSchema;
