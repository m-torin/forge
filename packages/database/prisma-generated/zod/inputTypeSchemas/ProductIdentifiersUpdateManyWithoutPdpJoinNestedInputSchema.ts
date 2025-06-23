import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersCreateWithoutPdpJoinInputSchema } from './ProductIdentifiersCreateWithoutPdpJoinInputSchema';
import { ProductIdentifiersUncheckedCreateWithoutPdpJoinInputSchema } from './ProductIdentifiersUncheckedCreateWithoutPdpJoinInputSchema';
import { ProductIdentifiersCreateOrConnectWithoutPdpJoinInputSchema } from './ProductIdentifiersCreateOrConnectWithoutPdpJoinInputSchema';
import { ProductIdentifiersUpsertWithWhereUniqueWithoutPdpJoinInputSchema } from './ProductIdentifiersUpsertWithWhereUniqueWithoutPdpJoinInputSchema';
import { ProductIdentifiersCreateManyPdpJoinInputEnvelopeSchema } from './ProductIdentifiersCreateManyPdpJoinInputEnvelopeSchema';
import { ProductIdentifiersWhereUniqueInputSchema } from './ProductIdentifiersWhereUniqueInputSchema';
import { ProductIdentifiersUpdateWithWhereUniqueWithoutPdpJoinInputSchema } from './ProductIdentifiersUpdateWithWhereUniqueWithoutPdpJoinInputSchema';
import { ProductIdentifiersUpdateManyWithWhereWithoutPdpJoinInputSchema } from './ProductIdentifiersUpdateManyWithWhereWithoutPdpJoinInputSchema';
import { ProductIdentifiersScalarWhereInputSchema } from './ProductIdentifiersScalarWhereInputSchema';

export const ProductIdentifiersUpdateManyWithoutPdpJoinNestedInputSchema: z.ZodType<Prisma.ProductIdentifiersUpdateManyWithoutPdpJoinNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => ProductIdentifiersCreateWithoutPdpJoinInputSchema),
          z.lazy(() => ProductIdentifiersCreateWithoutPdpJoinInputSchema).array(),
          z.lazy(() => ProductIdentifiersUncheckedCreateWithoutPdpJoinInputSchema),
          z.lazy(() => ProductIdentifiersUncheckedCreateWithoutPdpJoinInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => ProductIdentifiersCreateOrConnectWithoutPdpJoinInputSchema),
          z.lazy(() => ProductIdentifiersCreateOrConnectWithoutPdpJoinInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => ProductIdentifiersUpsertWithWhereUniqueWithoutPdpJoinInputSchema),
          z.lazy(() => ProductIdentifiersUpsertWithWhereUniqueWithoutPdpJoinInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => ProductIdentifiersCreateManyPdpJoinInputEnvelopeSchema).optional(),
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
          z.lazy(() => ProductIdentifiersUpdateWithWhereUniqueWithoutPdpJoinInputSchema),
          z.lazy(() => ProductIdentifiersUpdateWithWhereUniqueWithoutPdpJoinInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => ProductIdentifiersUpdateManyWithWhereWithoutPdpJoinInputSchema),
          z.lazy(() => ProductIdentifiersUpdateManyWithWhereWithoutPdpJoinInputSchema).array(),
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

export default ProductIdentifiersUpdateManyWithoutPdpJoinNestedInputSchema;
