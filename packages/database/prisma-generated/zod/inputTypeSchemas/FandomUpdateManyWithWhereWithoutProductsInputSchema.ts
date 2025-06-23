import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomScalarWhereInputSchema } from './FandomScalarWhereInputSchema';
import { FandomUpdateManyMutationInputSchema } from './FandomUpdateManyMutationInputSchema';
import { FandomUncheckedUpdateManyWithoutProductsInputSchema } from './FandomUncheckedUpdateManyWithoutProductsInputSchema';

export const FandomUpdateManyWithWhereWithoutProductsInputSchema: z.ZodType<Prisma.FandomUpdateManyWithWhereWithoutProductsInput> =
  z
    .object({
      where: z.lazy(() => FandomScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => FandomUpdateManyMutationInputSchema),
        z.lazy(() => FandomUncheckedUpdateManyWithoutProductsInputSchema),
      ]),
    })
    .strict();

export default FandomUpdateManyWithWhereWithoutProductsInputSchema;
