import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemCreateWithoutProductInputSchema } from './RegistryItemCreateWithoutProductInputSchema';
import { RegistryItemUncheckedCreateWithoutProductInputSchema } from './RegistryItemUncheckedCreateWithoutProductInputSchema';

export const RegistryItemCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.RegistryItemCreateOrConnectWithoutProductInput> = z.object({
  where: z.lazy(() => RegistryItemWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RegistryItemCreateWithoutProductInputSchema),z.lazy(() => RegistryItemUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export default RegistryItemCreateOrConnectWithoutProductInputSchema;
