import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryCreateWithoutProductInputSchema } from './InventoryCreateWithoutProductInputSchema';
import { InventoryUncheckedCreateWithoutProductInputSchema } from './InventoryUncheckedCreateWithoutProductInputSchema';
import { InventoryCreateOrConnectWithoutProductInputSchema } from './InventoryCreateOrConnectWithoutProductInputSchema';
import { InventoryUpsertWithWhereUniqueWithoutProductInputSchema } from './InventoryUpsertWithWhereUniqueWithoutProductInputSchema';
import { InventoryCreateManyProductInputEnvelopeSchema } from './InventoryCreateManyProductInputEnvelopeSchema';
import { InventoryWhereUniqueInputSchema } from './InventoryWhereUniqueInputSchema';
import { InventoryUpdateWithWhereUniqueWithoutProductInputSchema } from './InventoryUpdateWithWhereUniqueWithoutProductInputSchema';
import { InventoryUpdateManyWithWhereWithoutProductInputSchema } from './InventoryUpdateManyWithWhereWithoutProductInputSchema';
import { InventoryScalarWhereInputSchema } from './InventoryScalarWhereInputSchema';

export const InventoryUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.InventoryUpdateManyWithoutProductNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => InventoryCreateWithoutProductInputSchema),
          z.lazy(() => InventoryCreateWithoutProductInputSchema).array(),
          z.lazy(() => InventoryUncheckedCreateWithoutProductInputSchema),
          z.lazy(() => InventoryUncheckedCreateWithoutProductInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => InventoryCreateOrConnectWithoutProductInputSchema),
          z.lazy(() => InventoryCreateOrConnectWithoutProductInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => InventoryUpsertWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => InventoryUpsertWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => InventoryCreateManyProductInputEnvelopeSchema).optional(),
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
          z.lazy(() => InventoryUpdateWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => InventoryUpdateWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => InventoryUpdateManyWithWhereWithoutProductInputSchema),
          z.lazy(() => InventoryUpdateManyWithWhereWithoutProductInputSchema).array(),
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

export default InventoryUpdateManyWithoutProductNestedInputSchema;
