import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationScalarWhereInputSchema } from './LocationScalarWhereInputSchema';
import { LocationUpdateManyMutationInputSchema } from './LocationUpdateManyMutationInputSchema';
import { LocationUncheckedUpdateManyWithoutPdpJoinsInputSchema } from './LocationUncheckedUpdateManyWithoutPdpJoinsInputSchema';

export const LocationUpdateManyWithWhereWithoutPdpJoinsInputSchema: z.ZodType<Prisma.LocationUpdateManyWithWhereWithoutPdpJoinsInput> =
  z
    .object({
      where: z.lazy(() => LocationScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => LocationUpdateManyMutationInputSchema),
        z.lazy(() => LocationUncheckedUpdateManyWithoutPdpJoinsInputSchema),
      ]),
    })
    .strict();

export default LocationUpdateManyWithWhereWithoutPdpJoinsInputSchema;
