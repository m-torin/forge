import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomCreateWithoutProductsInputSchema } from './FandomCreateWithoutProductsInputSchema';
import { FandomUncheckedCreateWithoutProductsInputSchema } from './FandomUncheckedCreateWithoutProductsInputSchema';
import { FandomCreateOrConnectWithoutProductsInputSchema } from './FandomCreateOrConnectWithoutProductsInputSchema';
import { FandomUpsertWithWhereUniqueWithoutProductsInputSchema } from './FandomUpsertWithWhereUniqueWithoutProductsInputSchema';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomUpdateWithWhereUniqueWithoutProductsInputSchema } from './FandomUpdateWithWhereUniqueWithoutProductsInputSchema';
import { FandomUpdateManyWithWhereWithoutProductsInputSchema } from './FandomUpdateManyWithWhereWithoutProductsInputSchema';
import { FandomScalarWhereInputSchema } from './FandomScalarWhereInputSchema';

export const FandomUpdateManyWithoutProductsNestedInputSchema: z.ZodType<Prisma.FandomUpdateManyWithoutProductsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => FandomCreateWithoutProductsInputSchema),
          z.lazy(() => FandomCreateWithoutProductsInputSchema).array(),
          z.lazy(() => FandomUncheckedCreateWithoutProductsInputSchema),
          z.lazy(() => FandomUncheckedCreateWithoutProductsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => FandomCreateOrConnectWithoutProductsInputSchema),
          z.lazy(() => FandomCreateOrConnectWithoutProductsInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => FandomUpsertWithWhereUniqueWithoutProductsInputSchema),
          z.lazy(() => FandomUpsertWithWhereUniqueWithoutProductsInputSchema).array(),
        ])
        .optional(),
      set: z
        .union([
          z.lazy(() => FandomWhereUniqueInputSchema),
          z.lazy(() => FandomWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => FandomWhereUniqueInputSchema),
          z.lazy(() => FandomWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => FandomWhereUniqueInputSchema),
          z.lazy(() => FandomWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => FandomWhereUniqueInputSchema),
          z.lazy(() => FandomWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => FandomUpdateWithWhereUniqueWithoutProductsInputSchema),
          z.lazy(() => FandomUpdateWithWhereUniqueWithoutProductsInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => FandomUpdateManyWithWhereWithoutProductsInputSchema),
          z.lazy(() => FandomUpdateManyWithWhereWithoutProductsInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => FandomScalarWhereInputSchema),
          z.lazy(() => FandomScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default FandomUpdateManyWithoutProductsNestedInputSchema;
