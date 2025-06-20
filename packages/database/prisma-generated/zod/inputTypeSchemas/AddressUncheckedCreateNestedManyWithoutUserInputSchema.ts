import type { Prisma } from '../../client';

import { z } from 'zod';
import { AddressCreateWithoutUserInputSchema } from './AddressCreateWithoutUserInputSchema';
import { AddressUncheckedCreateWithoutUserInputSchema } from './AddressUncheckedCreateWithoutUserInputSchema';
import { AddressCreateOrConnectWithoutUserInputSchema } from './AddressCreateOrConnectWithoutUserInputSchema';
import { AddressCreateManyUserInputEnvelopeSchema } from './AddressCreateManyUserInputEnvelopeSchema';
import { AddressWhereUniqueInputSchema } from './AddressWhereUniqueInputSchema';

export const AddressUncheckedCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.AddressUncheckedCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => AddressCreateWithoutUserInputSchema),z.lazy(() => AddressCreateWithoutUserInputSchema).array(),z.lazy(() => AddressUncheckedCreateWithoutUserInputSchema),z.lazy(() => AddressUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => AddressCreateOrConnectWithoutUserInputSchema),z.lazy(() => AddressCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => AddressCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => AddressWhereUniqueInputSchema),z.lazy(() => AddressWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default AddressUncheckedCreateNestedManyWithoutUserInputSchema;
