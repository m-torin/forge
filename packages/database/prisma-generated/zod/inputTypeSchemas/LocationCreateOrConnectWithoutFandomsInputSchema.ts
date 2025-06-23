import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationCreateWithoutFandomsInputSchema } from './LocationCreateWithoutFandomsInputSchema';
import { LocationUncheckedCreateWithoutFandomsInputSchema } from './LocationUncheckedCreateWithoutFandomsInputSchema';

export const LocationCreateOrConnectWithoutFandomsInputSchema: z.ZodType<Prisma.LocationCreateOrConnectWithoutFandomsInput> =
  z
    .object({
      where: z.lazy(() => LocationWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => LocationCreateWithoutFandomsInputSchema),
        z.lazy(() => LocationUncheckedCreateWithoutFandomsInputSchema),
      ]),
    })
    .strict();

export default LocationCreateOrConnectWithoutFandomsInputSchema;
