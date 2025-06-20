import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationCreateWithoutDeletedByInputSchema } from './LocationCreateWithoutDeletedByInputSchema';
import { LocationUncheckedCreateWithoutDeletedByInputSchema } from './LocationUncheckedCreateWithoutDeletedByInputSchema';
import { LocationCreateOrConnectWithoutDeletedByInputSchema } from './LocationCreateOrConnectWithoutDeletedByInputSchema';
import { LocationCreateManyDeletedByInputEnvelopeSchema } from './LocationCreateManyDeletedByInputEnvelopeSchema';
import { LocationWhereUniqueInputSchema } from './LocationWhereUniqueInputSchema';

export const LocationUncheckedCreateNestedManyWithoutDeletedByInputSchema: z.ZodType<Prisma.LocationUncheckedCreateNestedManyWithoutDeletedByInput> = z.object({
  create: z.union([ z.lazy(() => LocationCreateWithoutDeletedByInputSchema),z.lazy(() => LocationCreateWithoutDeletedByInputSchema).array(),z.lazy(() => LocationUncheckedCreateWithoutDeletedByInputSchema),z.lazy(() => LocationUncheckedCreateWithoutDeletedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => LocationCreateOrConnectWithoutDeletedByInputSchema),z.lazy(() => LocationCreateOrConnectWithoutDeletedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => LocationCreateManyDeletedByInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => LocationWhereUniqueInputSchema),z.lazy(() => LocationWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default LocationUncheckedCreateNestedManyWithoutDeletedByInputSchema;
