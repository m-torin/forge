import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryCreateWithoutVariantInputSchema } from './InventoryCreateWithoutVariantInputSchema';
import { InventoryUncheckedCreateWithoutVariantInputSchema } from './InventoryUncheckedCreateWithoutVariantInputSchema';
import { InventoryCreateOrConnectWithoutVariantInputSchema } from './InventoryCreateOrConnectWithoutVariantInputSchema';
import { InventoryUpsertWithWhereUniqueWithoutVariantInputSchema } from './InventoryUpsertWithWhereUniqueWithoutVariantInputSchema';
import { InventoryCreateManyVariantInputEnvelopeSchema } from './InventoryCreateManyVariantInputEnvelopeSchema';
import { InventoryWhereUniqueInputSchema } from './InventoryWhereUniqueInputSchema';
import { InventoryUpdateWithWhereUniqueWithoutVariantInputSchema } from './InventoryUpdateWithWhereUniqueWithoutVariantInputSchema';
import { InventoryUpdateManyWithWhereWithoutVariantInputSchema } from './InventoryUpdateManyWithWhereWithoutVariantInputSchema';
import { InventoryScalarWhereInputSchema } from './InventoryScalarWhereInputSchema';

export const InventoryUpdateManyWithoutVariantNestedInputSchema: z.ZodType<Prisma.InventoryUpdateManyWithoutVariantNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => InventoryCreateWithoutVariantInputSchema),
          z.lazy(() => InventoryCreateWithoutVariantInputSchema).array(),
          z.lazy(() => InventoryUncheckedCreateWithoutVariantInputSchema),
          z.lazy(() => InventoryUncheckedCreateWithoutVariantInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => InventoryCreateOrConnectWithoutVariantInputSchema),
          z.lazy(() => InventoryCreateOrConnectWithoutVariantInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => InventoryUpsertWithWhereUniqueWithoutVariantInputSchema),
          z.lazy(() => InventoryUpsertWithWhereUniqueWithoutVariantInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => InventoryCreateManyVariantInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => InventoryWhereUniqueInputSchema),
          z.lazy(() => InventoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => InventoryWhereUniqueInputSchema),
          z.lazy(() => InventoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => InventoryWhereUniqueInputSchema),
          z.lazy(() => InventoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => InventoryWhereUniqueInputSchema),
          z.lazy(() => InventoryWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => InventoryUpdateWithWhereUniqueWithoutVariantInputSchema),
          z.lazy(() => InventoryUpdateWithWhereUniqueWithoutVariantInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => InventoryUpdateManyWithWhereWithoutVariantInputSchema),
          z.lazy(() => InventoryUpdateManyWithWhereWithoutVariantInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => InventoryScalarWhereInputSchema),
          z.lazy(() => InventoryScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default InventoryUpdateManyWithoutVariantNestedInputSchema;
