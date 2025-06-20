import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationCreateWithoutJrFindReplaceRejectsInputSchema } from './LocationCreateWithoutJrFindReplaceRejectsInputSchema';
import { LocationUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './LocationUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';
import { LocationCreateOrConnectWithoutJrFindReplaceRejectsInputSchema } from './LocationCreateOrConnectWithoutJrFindReplaceRejectsInputSchema';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';

export const LocationUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.LocationUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInput> = z.object({
  create: z.union([ z.lazy(() => LocationCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => LocationCreateWithoutJrFindReplaceRejectsInputSchema).array(),z.lazy(() => LocationUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => LocationUncheckedCreateWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => LocationCreateOrConnectWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => LocationCreateOrConnectWithoutJrFindReplaceRejectsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => LocationWhereUniqueInputSchema),z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default LocationUncheckedCreateNestedManyWithoutJrFindReplaceRejectsInputSchema;
