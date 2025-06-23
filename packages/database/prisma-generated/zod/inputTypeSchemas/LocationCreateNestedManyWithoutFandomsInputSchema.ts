import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationCreateWithoutFandomsInputSchema } from './LocationCreateWithoutFandomsInputSchema';
import { LocationUncheckedCreateWithoutFandomsInputSchema } from './LocationUncheckedCreateWithoutFandomsInputSchema';
import { LocationCreateOrConnectWithoutFandomsInputSchema } from './LocationCreateOrConnectWithoutFandomsInputSchema';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';

export const LocationCreateNestedManyWithoutFandomsInputSchema: z.ZodType<Prisma.LocationCreateNestedManyWithoutFandomsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => LocationCreateWithoutFandomsInputSchema),
          z.lazy(() => LocationCreateWithoutFandomsInputSchema).array(),
          z.lazy(() => LocationUncheckedCreateWithoutFandomsInputSchema),
          z.lazy(() => LocationUncheckedCreateWithoutFandomsInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => LocationCreateOrConnectWithoutFandomsInputSchema),
          z.lazy(() => LocationCreateOrConnectWithoutFandomsInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => LocationWhereUniqueInputSchema),
          z.lazy(() => LocationWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default LocationCreateNestedManyWithoutFandomsInputSchema;
