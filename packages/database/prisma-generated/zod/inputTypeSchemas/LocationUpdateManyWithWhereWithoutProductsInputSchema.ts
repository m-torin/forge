import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationScalarWhereInputSchema } from './LocationScalarWhereInputSchema';
import { LocationUpdateManyMutationInputSchema } from './LocationUpdateManyMutationInputSchema';
import { LocationUncheckedUpdateManyWithoutProductsInputSchema } from './LocationUncheckedUpdateManyWithoutProductsInputSchema';

export const LocationUpdateManyWithWhereWithoutProductsInputSchema: z.ZodType<Prisma.LocationUpdateManyWithWhereWithoutProductsInput> = z.object({
  where: z.lazy(() => LocationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => LocationUpdateManyMutationInputSchema),z.lazy(() => LocationUncheckedUpdateManyWithoutProductsInputSchema) ]),
}).strict();

export default LocationUpdateManyWithWhereWithoutProductsInputSchema;
