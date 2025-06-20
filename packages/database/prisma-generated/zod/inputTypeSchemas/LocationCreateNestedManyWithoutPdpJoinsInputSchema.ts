import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationCreateWithoutPdpJoinsInputSchema } from './LocationCreateWithoutPdpJoinsInputSchema';
import { LocationUncheckedCreateWithoutPdpJoinsInputSchema } from './LocationUncheckedCreateWithoutPdpJoinsInputSchema';
import { LocationCreateOrConnectWithoutPdpJoinsInputSchema } from './LocationCreateOrConnectWithoutPdpJoinsInputSchema';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';

export const LocationCreateNestedManyWithoutPdpJoinsInputSchema: z.ZodType<Prisma.LocationCreateNestedManyWithoutPdpJoinsInput> = z.object({
  create: z.union([ z.lazy(() => LocationCreateWithoutPdpJoinsInputSchema),z.lazy(() => LocationCreateWithoutPdpJoinsInputSchema).array(),z.lazy(() => LocationUncheckedCreateWithoutPdpJoinsInputSchema),z.lazy(() => LocationUncheckedCreateWithoutPdpJoinsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => LocationCreateOrConnectWithoutPdpJoinsInputSchema),z.lazy(() => LocationCreateOrConnectWithoutPdpJoinsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => LocationWhereUniqueInputSchema),z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default LocationCreateNestedManyWithoutPdpJoinsInputSchema;
