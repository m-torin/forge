import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomCreateWithoutLocationsInputSchema } from './FandomCreateWithoutLocationsInputSchema';
import { FandomUncheckedCreateWithoutLocationsInputSchema } from './FandomUncheckedCreateWithoutLocationsInputSchema';
import { FandomCreateOrConnectWithoutLocationsInputSchema } from './FandomCreateOrConnectWithoutLocationsInputSchema';
import { FandomUpsertWithWhereUniqueWithoutLocationsInputSchema } from './FandomUpsertWithWhereUniqueWithoutLocationsInputSchema';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';
import { FandomUpdateWithWhereUniqueWithoutLocationsInputSchema } from './FandomUpdateWithWhereUniqueWithoutLocationsInputSchema';
import { FandomUpdateManyWithWhereWithoutLocationsInputSchema } from './FandomUpdateManyWithWhereWithoutLocationsInputSchema';
import { FandomScalarWhereInputSchema } from './FandomScalarWhereInputSchema';

export const FandomUpdateManyWithoutLocationsNestedInputSchema: z.ZodType<Prisma.FandomUpdateManyWithoutLocationsNestedInput> = z.object({
  create: z.union([ z.lazy(() => FandomCreateWithoutLocationsInputSchema),z.lazy(() => FandomCreateWithoutLocationsInputSchema).array(),z.lazy(() => FandomUncheckedCreateWithoutLocationsInputSchema),z.lazy(() => FandomUncheckedCreateWithoutLocationsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FandomCreateOrConnectWithoutLocationsInputSchema),z.lazy(() => FandomCreateOrConnectWithoutLocationsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => FandomUpsertWithWhereUniqueWithoutLocationsInputSchema),z.lazy(() => FandomUpsertWithWhereUniqueWithoutLocationsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => FandomWhereUniqueInputSchema),z.lazy(() => FandomWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => FandomWhereUniqueInputSchema),z.lazy(() => FandomWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => FandomWhereUniqueInputSchema),z.lazy(() => FandomWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FandomWhereUniqueInputSchema),z.lazy(() => FandomWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => FandomUpdateWithWhereUniqueWithoutLocationsInputSchema),z.lazy(() => FandomUpdateWithWhereUniqueWithoutLocationsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => FandomUpdateManyWithWhereWithoutLocationsInputSchema),z.lazy(() => FandomUpdateManyWithWhereWithoutLocationsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => FandomScalarWhereInputSchema),z.lazy(() => FandomScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default FandomUpdateManyWithoutLocationsNestedInputSchema;
