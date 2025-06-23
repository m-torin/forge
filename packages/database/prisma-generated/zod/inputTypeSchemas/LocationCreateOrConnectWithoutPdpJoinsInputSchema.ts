import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationCreateWithoutPdpJoinsInputSchema } from './LocationCreateWithoutPdpJoinsInputSchema';
import { LocationUncheckedCreateWithoutPdpJoinsInputSchema } from './LocationUncheckedCreateWithoutPdpJoinsInputSchema';

export const LocationCreateOrConnectWithoutPdpJoinsInputSchema: z.ZodType<Prisma.LocationCreateOrConnectWithoutPdpJoinsInput> =
  z
    .object({
      where: z.lazy(() => LocationWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => LocationCreateWithoutPdpJoinsInputSchema),
        z.lazy(() => LocationUncheckedCreateWithoutPdpJoinsInputSchema),
      ]),
    })
    .strict();

export default LocationCreateOrConnectWithoutPdpJoinsInputSchema;
