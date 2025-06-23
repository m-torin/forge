import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithoutDeletedByInputSchema } from './LocationUpdateWithoutDeletedByInputSchema';
import { LocationUncheckedUpdateWithoutDeletedByInputSchema } from './LocationUncheckedUpdateWithoutDeletedByInputSchema';
import { LocationCreateWithoutDeletedByInputSchema } from './LocationCreateWithoutDeletedByInputSchema';
import { LocationUncheckedCreateWithoutDeletedByInputSchema } from './LocationUncheckedCreateWithoutDeletedByInputSchema';

export const LocationUpsertWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.LocationUpsertWithWhereUniqueWithoutDeletedByInput> =
  z
    .object({
      where: z.lazy(() => LocationWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => LocationUpdateWithoutDeletedByInputSchema),
        z.lazy(() => LocationUncheckedUpdateWithoutDeletedByInputSchema),
      ]),
      create: z.union([
        z.lazy(() => LocationCreateWithoutDeletedByInputSchema),
        z.lazy(() => LocationUncheckedCreateWithoutDeletedByInputSchema),
      ]),
    })
    .strict();

export default LocationUpsertWithWhereUniqueWithoutDeletedByInputSchema;
