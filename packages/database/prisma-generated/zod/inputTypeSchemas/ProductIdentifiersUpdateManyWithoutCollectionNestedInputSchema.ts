import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersCreateWithoutCollectionInputSchema } from './ProductIdentifiersCreateWithoutCollectionInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutCollectionInputSchema } from './ProductIdentifiersUncheckedCreateWithoutCollectionInputSchema';
import { ProductIdentifiersCreateOrConnectWithoutCollectionInputSchema } from './ProductIdentifiersCreateOrConnectWithoutCollectionInputSchema';
import { ProductIdentifiersUpsertWithWhereUniqueWithoutCollectionInputSchema } from './ProductIdentifiersUpsertWithWhereUniqueWithoutCollectionInputSchema';
import { ProductIdentifiersCreateManyCollectionInputEnvelopeSchema } from './ProductIdentifiersCreateManyCollectionInputEnvelopeSchema';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersUpdateWithWhereUniqueWithoutCollectionInputSchema } from './ProductIdentifiersUpdateWithWhereUniqueWithoutCollectionInputSchema';
import { ProductIdentifiersUpdateManyWithWhereWithoutCollectionInputSchema } from './ProductIdentifiersUpdateManyWithWhereWithoutCollectionInputSchema';
import { ProductIdentifiersScalarWhereInputSchema } from './ProductIdentifiersScalarWhereInputSchema';

export const ProductIdentifiersUpdateManyWithoutCollectionNestedInputSchema: z.ZodType<Prisma.ProductIdentifiersUpdateManyWithoutCollectionNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductIdentifiersCreateWithoutCollectionInputSchema),
          z.lazy(() => ProductIdentifiersCreateWithoutCollectionInputSchema).array(),
          z.lazy(() => ProductIdentifiersUncheckedCreateWithoutCollectionInputSchema),
          z.lazy(() => ProductIdentifiersUncheckedCreateWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductIdentifiersCreateOrConnectWithoutCollectionInputSchema),
          z.lazy(() => ProductIdentifiersCreateOrConnectWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => ProductIdentifiersUpsertWithWhereUniqueWithoutCollectionInputSchema),
          z.lazy(() => ProductIdentifiersUpsertWithWhereUniqueWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      createMany: z
        .lazy(() => ProductIdentifiersCreateManyCollectionInputEnvelopeSchema)
        .optional(),
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
          z.lazy(() => ProductIdentifiersUpdateWithWhereUniqueWithoutCollectionInputSchema),
          z.lazy(() => ProductIdentifiersUpdateWithWhereUniqueWithoutCollectionInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => ProductIdentifiersUpdateManyWithWhereWithoutCollectionInputSchema),
          z.lazy(() => ProductIdentifiersUpdateManyWithWhereWithoutCollectionInputSchema).array(),
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

export default ProductIdentifiersUpdateManyWithoutCollectionNestedInputSchema;
