import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationCreateWithoutProductsInputSchema } from './LocationCreateWithoutProductsInputSchema';
import { LocationUncheckedCreateWithoutProductsInputSchema } from './LocationUncheckedCreateWithoutProductsInputSchema';
import { LocationCreateOrConnectWithoutProductsInputSchema } from './LocationCreateOrConnectWithoutProductsInputSchema';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';

export const LocationUncheckedCreateNestedManyWithoutProductsInputSchema: z.ZodType<Prisma.LocationUncheckedCreateNestedManyWithoutProductsInput> = z.object({
  create: z.union([ z.lazy(() => LocationCreateWithoutProductsInputSchema),z.lazy(() => LocationCreateWithoutProductsInputSchema).array(),z.lazy(() => LocationUncheckedCreateWithoutProductsInputSchema),z.lazy(() => LocationUncheckedCreateWithoutProductsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => LocationCreateOrConnectWithoutProductsInputSchema),z.lazy(() => LocationCreateOrConnectWithoutProductsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => LocationWhereUniqueInputSchema),z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default LocationUncheckedCreateNestedManyWithoutProductsInputSchema;
