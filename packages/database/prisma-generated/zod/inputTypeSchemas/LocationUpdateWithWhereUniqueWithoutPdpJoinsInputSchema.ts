import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithoutPdpJoinsInputSchema } from './LocationUpdateWithoutPdpJoinsInputSchema';
import { LocationUncheckedUpdateWithoutPdpJoinsInputSchema } from './LocationUncheckedUpdateWithoutPdpJoinsInputSchema';

export const LocationUpdateWithWhereUniqueWithoutPdpJoinsInputSchema: z.ZodType<Prisma.LocationUpdateWithWhereUniqueWithoutPdpJoinsInput> =
  z
    .object({
      where: z.lazy(() => LocationWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => LocationUpdateWithoutPdpJoinsInputSchema),
        z.lazy(() => LocationUncheckedUpdateWithoutPdpJoinsInputSchema),
      ]),
    })
    .strict();

export default LocationUpdateWithWhereUniqueWithoutPdpJoinsInputSchema;
