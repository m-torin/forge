import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithoutDeletedByInputSchema } from './LocationUpdateWithoutDeletedByInputSchema';
import { LocationUncheckedUpdateWithoutDeletedByInputSchema } from './LocationUncheckedUpdateWithoutDeletedByInputSchema';

export const LocationUpdateWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.LocationUpdateWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => LocationWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => LocationUpdateWithoutDeletedByInputSchema),
        z.lazy(() => LocationUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default LocationUpdateWithWhereUniqueWithoutDeletedByInputSchema;
