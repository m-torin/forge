import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastScalarWhereInputSchema } from './CastScalarWhereInputSchema';
import { CastUpdateManyMutationInputSchema } from './CastUpdateManyMutationInputSchema';
import { CastUncheckedUpdateManyWithoutProductsInputSchema } from './CastUncheckedUpdateManyWithoutProductsInputSchema';

export const CastUpdateManyWithWhereWithoutProductsInputSchema: z.ZodType<Prisma.CastUpdateManyWithWhereWithoutProductsInput> = z.object({
  where: z.lazy(() => CastScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CastUpdateManyMutationInputSchema),z.lazy(() => CastUncheckedUpdateManyWithoutProductsInputSchema) ]),
}).strict();

export default CastUpdateManyWithWhereWithoutProductsInputSchema;
