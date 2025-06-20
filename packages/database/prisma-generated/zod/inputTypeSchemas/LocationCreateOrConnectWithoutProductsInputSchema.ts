import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationCreateWithoutProductsInputSchema } from './LocationCreateWithoutProductsInputSchema';
import { LocationUncheckedCreateWithoutProductsInputSchema } from './LocationUncheckedCreateWithoutProductsInputSchema';

export const LocationCreateOrConnectWithoutProductsInputSchema: z.ZodType<Prisma.LocationCreateOrConnectWithoutProductsInput> = z.object({
  where: z.lazy(() => LocationWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => LocationCreateWithoutProductsInputSchema),z.lazy(() => LocationUncheckedCreateWithoutProductsInputSchema) ]),
}).strict();

export default LocationCreateOrConnectWithoutProductsInputSchema;
