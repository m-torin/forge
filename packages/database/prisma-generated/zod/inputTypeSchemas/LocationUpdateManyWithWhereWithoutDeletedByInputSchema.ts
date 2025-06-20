import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationScalarWhereInputSchema } from './LocationScalarWhereInputSchema';
import { LocationUpdateManyMutationInputSchema } from './LocationUpdateManyMutationInputSchema';
import { LocationUncheckedUpdateManyWithoutDeletedByInputSchema } from './LocationUncheckedUpdateManyWithoutDeletedByInputSchema';

export const LocationUpdateManyWithWhereWithoutDeletedByInputSchema: z.ZodType<Prisma.LocationUpdateManyWithWhereWithoutDeletedByInput> = z.object({
  where: z.lazy(() => LocationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => LocationUpdateManyMutationInputSchema),z.lazy(() => LocationUncheckedUpdateManyWithoutDeletedByInputSchema) ]),
}).strict();

export default LocationUpdateManyWithWhereWithoutDeletedByInputSchema;
