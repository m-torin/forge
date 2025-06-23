import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithoutJrFindReplaceRejectsInputSchema } from './LocationUpdateWithoutJrFindReplaceRejectsInputSchema';
import { LocationUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema } from './LocationUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema';

export const LocationUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.LocationUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => LocationWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => LocationUpdateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => LocationUncheckedUpdateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default LocationUpdateWithWhereUniqueWithoutJrFindReplaceRejectsInputSchema;
