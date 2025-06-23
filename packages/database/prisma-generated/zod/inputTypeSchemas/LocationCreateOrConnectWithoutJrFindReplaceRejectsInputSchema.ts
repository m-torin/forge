import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationCreateWithoutJrFindReplaceRejectsInputSchema } from './LocationCreateWithoutJrFindReplaceRejectsInputSchema';
import { LocationUncheckedCreateWithoutJrFindReplaceRejectsInputSchema } from './LocationUncheckedCreateWithoutJrFindReplaceRejectsInputSchema';

export const LocationCreateOrConnectWithoutJrFindReplaceRejectsInputSchema: z.ZodType<Prisma.LocationCreateOrConnectWithoutJrFindReplaceRejectsInput> =
  z
    .object({
      where: z.lazy(() => LocationWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => LocationCreateWithoutJrFindReplaceRejectsInputSchema),
        z.lazy(() => LocationUncheckedCreateWithoutJrFindReplaceRejectsInputSchema),
      ]),
    })
    .strict();

export default LocationCreateOrConnectWithoutJrFindReplaceRejectsInputSchema;
