import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithoutProductsInputSchema } from './LocationUpdateWithoutProductsInputSchema';
import { LocationUncheckedUpdateWithoutProductsInputSchema } from './LocationUncheckedUpdateWithoutProductsInputSchema';

export const LocationUpdateWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.LocationUpdateWithWhereUniqueWithoutProductsInput> = z.object({
  where: z.lazy(() => LocationWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => LocationUpdateWithoutProductsInputSchema),z.lazy(() => LocationUncheckedUpdateWithoutProductsInputSchema) ]),
}).strict();

export default LocationUpdateWithWhereUniqueWithoutProductsInputSchema;
