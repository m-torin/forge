import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemUpdateWithoutDeletedByInputSchema } from './RegistryItemUpdateWithoutDeletedByInputSchema';
import { RegistryItemUncheckedUpdateWithoutDeletedByInputSchema } from './RegistryItemUncheckedUpdateWithoutDeletedByInputSchema';

export const RegistryItemUpdateWithWhereUniqueWithoutDeletedByInputSchema: z.ZodType<Prisma.RegistryItemUpdateWithWhereUniqueWithoutDeletedByInput> = z.object({
  where: z.lazy(() => RegistryItemWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => RegistryItemUpdateWithoutDeletedByInputSchema),z.lazy(() => RegistryItemUncheckedUpdateWithoutDeletedByInputSchema) ]),
}).strict();

export default RegistryItemUpdateWithWhereUniqueWithoutDeletedByInputSchema;
