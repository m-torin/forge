import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryCreateWithoutUsersInputSchema } from './RegistryCreateWithoutUsersInputSchema';
import { RegistryUncheckedCreateWithoutUsersInputSchema } from './RegistryUncheckedCreateWithoutUsersInputSchema';

export const RegistryCreateOrConnectWithoutUsersInputSchema: z.ZodType<Prisma.RegistryCreateOrConnectWithoutUsersInput> = z.object({
  where: z.lazy(() => RegistryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RegistryCreateWithoutUsersInputSchema),z.lazy(() => RegistryUncheckedCreateWithoutUsersInputSchema) ]),
}).strict();

export default RegistryCreateOrConnectWithoutUsersInputSchema;
