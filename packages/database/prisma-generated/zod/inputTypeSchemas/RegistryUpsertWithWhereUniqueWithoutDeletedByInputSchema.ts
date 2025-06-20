import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryUpdateWithoutDeletedByInputSchema } from './RegistryUpdateWithoutDeletedByInputSchema';
import { RegistryUncheckedUpdateWithoutDeletedByInputSchema } from './RegistryUncheckedUpdateWithoutDeletedByInputSchema';
import { RegistryCreateWithoutDeletedByInputSchema } from './RegistryCreateWithoutDeletedByInputSchema';
import { RegistryUncheckedCreateWithoutDeletedByInputSchema } from './RegistryUncheckedCreateWithoutDeletedByInputSchema';

export const RegistryUpsertWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.RegistryUpsertWithWhereUniqueWithoutDeletedByInput> = z.object({
  where: z.lazy(() => RegistryWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => RegistryUpdateWithoutDeletedByInputSchema),z.lazy(() => RegistryUncheckedUpdateWithoutDeletedByInputSchema) ]),
  create: z.union([ z.lazy(() => RegistryCreateWithoutDeletedByInputSchema),z.lazy(() => RegistryUncheckedCreateWithoutDeletedByInputSchema) ]),
}).strict();

export default RegistryUpsertWithWhereUniqueWithoutDeletedByInputSchema;
