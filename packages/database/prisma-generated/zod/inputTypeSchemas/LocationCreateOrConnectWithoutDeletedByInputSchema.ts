import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationCreateWithoutDeletedByInputSchema } from './LocationCreateWithoutDeletedByInputSchema';
import { LocationUncheckedCreateWithoutDeletedByInputSchema } from './LocationUncheckedCreateWithoutDeletedByInputSchema';

export const LocationCreateOrConnectWithoutDeletedByInputSchema: z.ZodType<Prisma.LocationCreateOrConnectWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => LocationWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => LocationCreateWithoutDeletedByInputSchema),
        z.lazy(() => LocationUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default LocationCreateOrConnectWithoutDeletedByInputSchema;
