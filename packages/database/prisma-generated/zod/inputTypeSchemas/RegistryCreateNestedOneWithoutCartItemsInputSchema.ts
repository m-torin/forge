import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryCreateWithoutCartItemsInputSchema } from './RegistryCreateWithoutCartItemsInputSchema';
import { RegistryUncheckedCreateWithoutCartItemsInputSchema } from './RegistryUncheckedCreateWithoutCartItemsInputSchema';
import { RegistryCreateOrConnectWithoutCartItemsInputSchema } from './RegistryCreateOrConnectWithoutCartItemsInputSchema';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';

export const RegistryCreateNestedOneWithoutCartItemsInputSchema: z.ZodType<Prisma.RegistryCreateNestedOneWithoutCartItemsInput> = z.object({
  create: z.union([ z.lazy(() => RegistryCreateWithoutCartItemsInputSchema),z.lazy(() => RegistryUncheckedCreateWithoutCartItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => RegistryCreateOrConnectWithoutCartItemsInputSchema).optional(),
  connect: z.lazy(() => RegistryWhereUniqueInputSchema).optional()
}).strict();

export default RegistryCreateNestedOneWithoutCartItemsInputSchema;
