import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithoutFandomsInputSchema } from './LocationUpdateWithoutFandomsInputSchema';
import { LocationUncheckedUpdateWithoutFandomsInputSchema } from './LocationUncheckedUpdateWithoutFandomsInputSchema';

export const LocationUpdateWithWhereUniqueWithoutFandomsInputSchema: z.ZodType<Prisma.LocationUpdateWithWhereUniqueWithoutFandomsInput> =
  z
    .object({
      where: z.lazy(() => LocationWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => LocationUpdateWithoutFandomsInputSchema),
        z.lazy(() => LocationUncheckedUpdateWithoutFandomsInputSchema),
      ]),
    })
    .strict();

export default LocationUpdateWithWhereUniqueWithoutFandomsInputSchema;
