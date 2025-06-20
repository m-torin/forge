import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithoutJrFindReplaceRejectsInputSchema } from './LocationUpdateWithoutJrFindReplaceRejectsInputSchema';
import { LocationUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema } from './LocationUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema';
import { LocationCreateWithoutJrFindReplaceRejectsInputSchema } from './LocationCreateWithoutJrFindReplaceRejectsInputSchema';
import { LocationUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './LocationUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';

export const LocationUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.LocationUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInput> = z.object({
  where: z.lazy(() => LocationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => LocationUpdateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => LocationUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema) ]),
  create: z.union([ z.lazy(() => LocationCreateWithoutJrFindReplaceRejectsInputSchema),z.lazy(() => LocationUncheckedCreateWithoutJrFindReplaceRejectsInputSchema) ]),
}).strict();

export default LocationUpsertWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema;
