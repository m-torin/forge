import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryCreateWithoutCreatedByUserInputSchema } from './RegistryCreateWithoutCreatedByUserInputSchema';
import { RegistryUncheckedCreateWithoutCreatedByUserInputSchema } from './RegistryUncheckedCreateWithoutCreatedByUserInputSchema';

export const RegistryCreateOrConnectWithoutCreatedByUserInputSchema: z.ZodType<Prisma.RegistryCreateOrConnectWithoutCreatedByUserInput> = z.object({
  where: z.lazy(() => RegistryWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => RegistryCreateWithoutCreatedByUserInputSchema),z.lazy(() => RegistryUncheckedCreateWithoutCreatedByUserInputSchema) ]),
}).strict();

export default RegistryCreateOrConnectWithoutCreatedByUserInputSchema;
