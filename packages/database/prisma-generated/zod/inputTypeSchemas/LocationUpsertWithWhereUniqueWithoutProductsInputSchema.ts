import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithoutProductsInputSchema } from './LocationUpdateWithoutProductsInputSchema';
import { LocationUncheckedUpdateWithoutProductsInputSchema } from './LocationUncheckedUpdateWithoutProductsInputSchema';
import { LocationCreateWithoutProductsInputSchema } from './LocationCreateWithoutProductsInputSchema';
import { LocationUncheckedCreateWithoutProductsInputSchema } from './LocationUncheckedCreateWithoutProductsInputSchema';

export const LocationUpsertWithWhereUniqueWithoutProductsInputSchema: z.ZodType<Prisma.LocationUpsertWithWhereUniqueWithoutProductsInput> = z.object({
  where: z.lazy(() => LocationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => LocationUpdateWithoutProductsInputSchema),z.lazy(() => LocationUncheckedUpdateWithoutProductsInputSchema) ]),
  create: z.union([ z.lazy(() => LocationCreateWithoutProductsInputSchema),z.lazy(() => LocationUncheckedCreateWithoutProductsInputSchema) ]),
}).strict();

export default LocationUpsertWithWhereUniqueWithoutProductsInputSchema;
