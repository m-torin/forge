import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomCreateWithoutLocationsInputSchema } from './FandomCreateWithoutLocationsInputSchema';
import { FandomUncheckedCreateWithoutLocationsInputSchema } from './FandomUncheckedCreateWithoutLocationsInputSchema';
import { FandomCreateOrConnectWithoutLocationsInputSchema } from './FandomCreateOrConnectWithoutLocationsInputSchema';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';

export const FandomUncheckedCreateNestedManyWithoutLocationsInputSchema: z.ZodType<Prisma.FandomUncheckedCreateNestedManyWithoutLocationsInput> = z.object({
  create: z.union([ z.lazy(() => FandomCreateWithoutLocationsInputSchema),z.lazy(() => FandomCreateWithoutLocationsInputSchema).array(),z.lazy(() => FandomUncheckedCreateWithoutLocationsInputSchema),z.lazy(() => FandomUncheckedCreateWithoutLocationsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FandomCreateOrConnectWithoutLocationsInputSchema),z.lazy(() => FandomCreateOrConnectWithoutLocationsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FandomWhereUniqueInputSchema),z.lazy(() => FandomWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default FandomUncheckedCreateNestedManyWithoutLocationsInputSchema;
