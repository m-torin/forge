import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastCreateWithoutProductsInputSchema } from './CastCreateWithoutProductsInputSchema';
import { CastUncheckedCreateWithoutProductsInputSchema } from './CastUncheckedCreateWithoutProductsInputSchema';
import { CastCreateOrConnectWithoutProductsInputSchema } from './CastCreateOrConnectWithoutProductsInputSchema';
import { CastWhereUniqueInputSchema } from './CastWhereUniqueInputSchema';

export const CastCreateNestedManyWithoutProductsInputSchema: z.ZodType<Prisma.CastCreateNestedManyWithoutProductsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => CastCreateWithoutProductsInputSchema),
          z.lazy(() => CastCreateWithoutProductsInputSchema).array(),
          z.lazy(() => CastUncheckedCreateWithoutProductsInputSchema),
          z.lazy(() => CastUncheckedCreateWithoutProductsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => CastCreateOrConnectWithoutProductsInputSchema),
          z.lazy(() => CastCreateOrConnectWithoutProductsInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => CastWhereUniqueInputSchema),
          z.lazy(() => CastWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default CastCreateNestedManyWithoutProductsInputSchema;
