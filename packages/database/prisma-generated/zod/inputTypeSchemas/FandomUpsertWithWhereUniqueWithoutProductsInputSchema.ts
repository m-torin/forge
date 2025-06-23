import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomUpdateWithoutProductsInputSchema } from './FandomUpdateWithoutProductsInputSchema';
import { FandomUncheckedUpdateWithoutProductsInputSchema } from './FandomUncheckedUpdateWithoutProductsInputSchema';
import { FandomCreateWithoutProductsInputSchema } from './FandomCreateWithoutProductsInputSchema';
import { FandomUncheckedCreateWithoutProductsInputSchema } from './FandomUncheckedCreateWithoutProductsInputSchema';

export const FandomUpsertWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.FandomUpsertWithWhereUniqueWithoutProductsInput> =
  z
    .object({
      where: z.lazy(() => FandomWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => FandomUpdateWithoutProductsInputSchema),
        z.lazy(() => FandomUncheckedUpdateWithoutProductsInputSchema),
      ]),
      create: z.union([
        z.lazy(() => FandomCreateWithoutProductsInputSchema),
        z.lazy(() => FandomUncheckedCreateWithoutProductsInputSchema),
      ]),
    })
    .strict();

export default FandomUpsertWithWhereUniqueWithoutProductsInputSchema;
