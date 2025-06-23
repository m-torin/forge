import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationScalarWhereInputSchema } from './LocationScalarWhereInputSchema';
import { LocationUpdateManyMutationInputSchema } from './LocationUpdateManyMutationInputSchema';
import { LocationUncheckedUpdateManyWithoutFandomsInputSchema } from './LocationUncheckedUpdateManyWithoutFandomsInputSchema';

export const LocationUpdateManyWithWhereWithoutFandomsInputSchema: z.ZodType<Prisma.LocationUpdateManyWithWhereWithoutFandomsInput> =
  z
    .object({
      where: z.lazy(() => LocationScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => LocationUpdateManyMutationInputSchema),
        z.lazy(() => LocationUncheckedUpdateManyWithoutFandomsInputSchema),
      ]),
    })
    .strict();

export default LocationUpdateManyWithWhereWithoutFandomsInputSchema;
