import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemScalarWhereInputSchema } from './RegistryItemScalarWhereInputSchema';
import { RegistryItemUpdateManyMutationInputSchema } from './RegistryItemUpdateManyMutationInputSchema';
import { RegistryItemUncheckedUpdateManyWithoutDeletedByInputSchema } from './RegistryItemUncheckedUpdateManyWithoutDeletedByInputSchema';

export const RegistryItemUpdateManyWithWhereWithoutDeletedByInputSchema: z.ZodType<Prisma.RegistryItemUpdateManyWithWhereWithoutDeletedByInput> = z.object({
  where: z.lazy(() => RegistryItemScalarWhereInputSchema),
  data: z.union([ z.lazy(() => RegistryItemUpdateManyMutationInputSchema),z.lazy(() => RegistryItemUncheckedUpdateManyWithoutDeletedByInputSchema) ]),
}).strict();

export default RegistryItemUpdateManyWithWhereWithoutDeletedByInputSchema;
