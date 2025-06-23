import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandScalarWhereInputSchema } from './BrandScalarWhereInputSchema';
import { BrandUpdateManyMutationInputSchema } from './BrandUpdateManyMutationInputSchema';
import { BrandUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema } from './BrandUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema';

export const BrandUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.BrandUpdateManyWithWhereWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => BrandScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => BrandUpdateManyMutationInputSchema),
        z.lazy(() => BrandUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default BrandUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema;
