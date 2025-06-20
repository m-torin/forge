import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutUserInputSchema } from './CollectionCreateWithoutUserInputSchema';
import { CollectionUncheckedCreateWithoutUserInputSchema } from './CollectionUncheckedCreateWithoutUserInputSchema';
import { CollectionCreateOrConnectWithoutUserInputSchema } from './CollectionCreateOrConnectWithoutUserInputSchema';
import { CollectionCreateManyUserInputEnvelopeSchema } from './CollectionCreateManyUserInputEnvelopeSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';

export const CollectionCreateNestedManyWithoutUserInputSchema: z.ZodType<Prisma.CollectionCreateNestedManyWithoutUserInput> = z.object({
  create: z.union([ z.lazy(() => CollectionCreateWithoutUserInputSchema),z.lazy(() => CollectionCreateWithoutUserInputSchema).array(),z.lazy(() => CollectionUncheckedCreateWithoutUserInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutUserInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CollectionCreateOrConnectWithoutUserInputSchema),z.lazy(() => CollectionCreateOrConnectWithoutUserInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CollectionCreateManyUserInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CollectionWhereUniqueInputSchema),z.lazy(() => CollectionWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CollectionCreateNestedManyWithoutUserInputSchema;
