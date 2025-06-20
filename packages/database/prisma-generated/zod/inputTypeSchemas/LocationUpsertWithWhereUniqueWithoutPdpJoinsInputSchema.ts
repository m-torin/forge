import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithoutPdpJoinsInputSchema } from './LocationUpdateWithoutPdpJoinsInputSchema';
import { LocationUncheckedUpdateWithoutPdpJoinsInputSchema } from './LocationUncheckedUpdateWithoutPdpJoinsInputSchema';
import { LocationCreateWithoutPdpJoinsInputSchema } from './LocationCreateWithoutPdpJoinsInputSchema';
import { LocationUncheckedCreateWithoutPdpJoinsInputSchema } from './LocationUncheckedCreateWithoutPdpJoinsInputSchema';

export const LocationUpsertWithWhereUniqueWithoutPdpJoinsInputSchema: z.ZodType<Prisma.LocationUpsertWithWhereUniqueWithoutPdpJoinsInput> = z.object({
  where: z.lazy(() => LocationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => LocationUpdateWithoutPdpJoinsInputSchema),z.lazy(() => LocationUncheckedUpdateWithoutPdpJoinsInputSchema) ]),
  create: z.union([ z.lazy(() => LocationCreateWithoutPdpJoinsInputSchema),z.lazy(() => LocationUncheckedCreateWithoutPdpJoinsInputSchema) ]),
}).strict();

export default LocationUpsertWithWhereUniqueWithoutPdpJoinsInputSchema;
