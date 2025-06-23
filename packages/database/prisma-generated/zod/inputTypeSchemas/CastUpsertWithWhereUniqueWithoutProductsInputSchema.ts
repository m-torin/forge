import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastWhereUniqueInputSchema } from './CastWhereUniqueInputSchema';
import { CastUpdateWithoutProductsInputSchema } from './CastUpdateWithoutProductsInputSchema';
import { CastUncheckedUpdateWithoutProductsInputSchema } from './CastUncheckedUpdateWithoutProductsInputSchema';
import { CastCreateWithoutProductsInputSchema } from './CastCreateWithoutProductsInputSchema';
import { CastUncheckedCreateWithoutProductsInputSchema } from './CastUncheckedCreateWithoutProductsInputSchema';

export const CastUpsertWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.CastUpsertWithWhereUniqueWithoutProductsInput> =
  z
    .object({
      where: z.lazy(() => CastWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => CastUpdateWithoutProductsInputSchema),
        z.lazy(() => CastUncheckedUpdateWithoutProductsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => CastCreateWithoutProductsInputSchema),
        z.lazy(() => CastUncheckedCreateWithoutProductsInputSchema),
      ]),
    })
    .strict();

export default CastUpsertWithWhereUniqueWithoutProductsInputSchema;
