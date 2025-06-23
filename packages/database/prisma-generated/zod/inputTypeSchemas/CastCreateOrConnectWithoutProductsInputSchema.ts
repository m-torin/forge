import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastWhereUniqueInputSchema } from './CastWhereUniqueInputSchema';
import { CastCreateWithoutProductsInputSchema } from './CastCreateWithoutProductsInputSchema';
import { CastUncheckedCreateWithoutProductsInputSchema } from './CastUncheckedCreateWithoutProductsInputSchema';

export const CastCreateOrConnectWithoutProductsInputSchema: z.ZodType<Prisma.CastCreateOrConnectWithoutProductsInput> =
  z
    .object({
      where: z.lazy(() => CastWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => CastCreateWithoutProductsInputSchema),
        z.lazy(() => CastUncheckedCreateWithoutProductsInputSchema),
      ]),
    })
    .strict();

export default CastCreateOrConnectWithoutProductsInputSchema;
