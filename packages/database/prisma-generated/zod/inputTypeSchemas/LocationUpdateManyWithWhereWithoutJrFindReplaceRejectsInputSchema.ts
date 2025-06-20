import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationScalarWhereInputSchema } from './LocationScalarWhereInputSchema';
import { LocationUpdateManyMutationInputSchema } from './LocationUpdateManyMutationInputSchema';
import { LocationUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema } from './LocationUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema';

export const LocationUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.LocationUpdateManyWithWhereWithoutJrFindReplaceRejectsInput> = z.object({
  where: z.lazy(() => LocationScalarWhereInputSchema),
  data: z.union([ z.lazy(() => LocationUpdateManyMutationInputSchema),z.lazy(() => LocationUncheckedUpdateManyWithoutJrFindReplaceRejectsInputSchema) ]),
}).strict();

export default LocationUpdateManyWithWhereWithoutJrFindReplaceRejectsInputSchema;
