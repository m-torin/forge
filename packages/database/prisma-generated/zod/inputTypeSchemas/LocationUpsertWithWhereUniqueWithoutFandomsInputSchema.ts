import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithoutFandomsInputSchema } from './LocationUpdateWithoutFandomsInputSchema';
import { LocationUncheckedUpdateWithoutFandomsInputSchema } from './LocationUncheckedUpdateWithoutFandomsInputSchema';
import { LocationCreateWithoutFandomsInputSchema } from './LocationCreateWithoutFandomsInputSchema';
import { LocationUncheckedCreateWithoutFandomsInputSchema } from './LocationUncheckedCreateWithoutFandomsInputSchema';

export const LocationUpsertWithWhereUniqueWithoutFandomsInputSchema: z.ZodType<Prisma.LocationUpsertWithWhereUniqueWithoutFandomsInput> = z.object({
  where: z.lazy(() => LocationWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => LocationUpdateWithoutFandomsInputSchema),z.lazy(() => LocationUncheckedUpdateWithoutFandomsInputSchema) ]),
  create: z.union([ z.lazy(() => LocationCreateWithoutFandomsInputSchema),z.lazy(() => LocationUncheckedCreateWithoutFandomsInputSchema) ]),
}).strict();

export default LocationUpsertWithWhereUniqueWithoutFandomsInputSchema;
