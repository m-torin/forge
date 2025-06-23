import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemCreateWithoutProductInputSchema } from './RegistryItemCreateWithoutProductInputSchema';
import { RegistryItemUncheckedCreateWithoutProductInputSchema } from './RegistryItemUncheckedCreateWithoutProductInputSchema';
import { RegistryItemCreateOrConnectWithoutProductInputSchema } from './RegistryItemCreateOrConnectWithoutProductInputSchema';
import { RegistryItemUpsertWithWhereUniqueWithoutProductInputSchema } from './RegistryItemUpsertWithWhereUniqueWithoutProductInputSchema';
import { RegistryItemCreateManyProductInputEnvelopeSchema } from './RegistryItemCreateManyProductInputEnvelopeSchema';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemUpdateWithWhereUniqueWithoutProductInputSchema } from './RegistryItemUpdateWithWhereUniqueWithoutProductInputSchema';
import { RegistryItemUpdateManyWithWhereWithoutProductInputSchema } from './RegistryItemUpdateManyWithWhereWithoutProductInputSchema';
import { RegistryItemScalarWhereInputSchema } from './RegistryItemScalarWhereInputSchema';

export const RegistryItemUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.RegistryItemUpdateManyWithoutProductNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => RegistryItemCreateWithoutProductInputSchema),
          z.lazy(() => RegistryItemCreateWithoutProductInputSchema).array(),
          z.lazy(() => RegistryItemUncheckedCreateWithoutProductInputSchema),
          z.lazy(() => RegistryItemUncheckedCreateWithoutProductInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => RegistryItemCreateOrConnectWithoutProductInputSchema),
          z.lazy(() => RegistryItemCreateOrConnectWithoutProductInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => RegistryItemUpsertWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => RegistryItemUpsertWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => RegistryItemCreateManyProductInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => RegistryItemWhereUniqueInputSchema),
          z.lazy(() => RegistryItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => RegistryItemWhereUniqueInputSchema),
          z.lazy(() => RegistryItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => RegistryItemWhereUniqueInputSchema),
          z.lazy(() => RegistryItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => RegistryItemWhereUniqueInputSchema),
          z.lazy(() => RegistryItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => RegistryItemUpdateWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => RegistryItemUpdateWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => RegistryItemUpdateManyWithWhereWithoutProductInputSchema),
          z.lazy(() => RegistryItemUpdateManyWithWhereWithoutProductInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => RegistryItemScalarWhereInputSchema),
          z.lazy(() => RegistryItemScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default RegistryItemUpdateManyWithoutProductNestedInputSchema;
