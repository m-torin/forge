import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationCreateWithoutFandomsInputSchema } from './LocationCreateWithoutFandomsInputSchema';
import { LocationUncheckedCreateWithoutFandomsInputSchema } from './LocationUncheckedCreateWithoutFandomsInputSchema';
import { LocationCreateOrConnectWithoutFandomsInputSchema } from './LocationCreateOrConnectWithoutFandomsInputSchema';
import { LocationUpsertWithWhereUniqueWithoutFandomsInputSchema } from './LocationUpsertWithWhereUniqueWithoutFandomsInputSchema';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';
import { LocationUpdateWithWhereUniqueWithoutFandomsInputSchema } from './LocationUpdateWithWhereUniqueWithoutFandomsInputSchema';
import { LocationUpdateManyWithWhereWithoutFandomsInputSchema } from './LocationUpdateManyWithWhereWithoutFandomsInputSchema';
import { LocationScalarWhereInputSchema } from './LocationScalarWhereInputSchema';

export const LocationUncheckedUpdateManyWithoutFandomsNestedInputSchema: z.ZodType<Prisma.LocationUncheckedUpdateManyWithoutFandomsNestedInput> = z.object({
  create: z.union([ z.lazy(() => LocationCreateWithoutFandomsInputSchema),z.lazy(() => LocationCreateWithoutFandomsInputSchema).array(),z.lazy(() => LocationUncheckedCreateWithoutFandomsInputSchema),z.lazy(() => LocationUncheckedCreateWithoutFandomsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => LocationCreateOrConnectWithoutFandomsInputSchema),z.lazy(() => LocationCreateOrConnectWithoutFandomsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => LocationUpsertWithWhereUniqueWithoutFandomsInputSchema),z.lazy(() => LocationUpsertWithWhereUniqueWithoutFandomsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => LocationWhereUniqueInputSchema),z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => LocationWhereUniqueInputSchema),z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => LocationWhereUniqueInputSchema),z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => LocationWhereUniqueInputSchema),z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => LocationUpdateWithWhereUniqueWithoutFandomsInputSchema),z.lazy(() => LocationUpdateWithWhereUniqueWithoutFandomsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => LocationUpdateManyWithWhereWithoutFandomsInputSchema),z.lazy(() => LocationUpdateManyWithWhereWithoutFandomsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => LocationScalarWhereInputSchema),z.lazy(() => LocationScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default LocationUncheckedUpdateManyWithoutFandomsNestedInputSchema;
