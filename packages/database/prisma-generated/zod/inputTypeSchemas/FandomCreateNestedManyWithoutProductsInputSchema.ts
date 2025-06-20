import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomCreateWithoutProductsInputSchema } from './FandomCreateWithoutProductsInputSchema';
import { FandomUncheckedCreateWithoutProductsInputSchema } from './FandomUncheckedCreateWithoutProductsInputSchema';
import { FandomCreateOrConnectWithoutProductsInputSchema } from './FandomCreateOrConnectWithoutProductsInputSchema';
import { FandomWhereUniqueInputSchema } from './FandomWhereUniqueInputSchema';

export const FandomCreateNestedManyWithoutProductsInputSchema: z.ZodType<Prisma.FandomCreateNestedManyWithoutProductsInput> = z.object({
  create: z.union([ z.lazy(() => FandomCreateWithoutProductsInputSchema),z.lazy(() => FandomCreateWithoutProductsInputSchema).array(),z.lazy(() => FandomUncheckedCreateWithoutProductsInputSchema),z.lazy(() => FandomUncheckedCreateWithoutProductsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => FandomCreateOrConnectWithoutProductsInputSchema),z.lazy(() => FandomCreateOrConnectWithoutProductsInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => FandomWhereUniqueInputSchema),z.lazy(() => FandomWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default FandomCreateNestedManyWithoutProductsInputSchema;
