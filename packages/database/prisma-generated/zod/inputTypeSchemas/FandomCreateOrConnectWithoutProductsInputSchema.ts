import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomCreateWithoutProductsInputSchema } from './FandomCreateWithoutProductsInputSchema';
import { FandomUncheckedCreateWithoutProductsInputSchema } from './FandomUncheckedCreateWithoutProductsInputSchema';

export const FandomCreateOrConnectWithoutProductsInputSchema: z.ZodType<Prisma.FandomCreateOrConnectWithoutProductsInput> =
  z
    .object({
      where: z.lazy(() => FandomWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => FandomCreateWithoutProductsInputSchema),
        z.lazy(() => FandomUncheckedCreateWithoutProductsInputSchema),
      ]),
    })
    .strict();

export default FandomCreateOrConnectWithoutProductsInputSchema;
