import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutMediaInputSchema } from './CollectionCreateWithoutMediaInputSchema';
import { CollectionUncheckedCreateWithoutMediaInputSchema } from './CollectionUncheckedCreateWithoutMediaInputSchema';
import { CollectionCreateOrConnectWithoutMediaInputSchema } from './CollectionCreateOrConnectWithoutMediaInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';

export const CollectionCreateNestedOneWithoutMediaInputSchema: z.ZodType<Prisma.CollectionCreateNestedOneWithoutMediaInput> = z.object({
  create: z.union([ z.lazy(() => CollectionCreateWithoutMediaInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutMediaInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CollectionCreateOrConnectWithoutMediaInputSchema).optional(),
  connect: z.lazy(() => CollectionWhereUniqueInputSchema).optional()
}).strict();

export default CollectionCreateNestedOneWithoutMediaInputSchema;
