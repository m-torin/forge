import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';
import { RegistryUpdateWithoutItemsInputSchema } from './RegistryUpdateWithoutItemsInputSchema';
import { RegistryUncheckedUpdateWithoutItemsInputSchema } from './RegistryUncheckedUpdateWithoutItemsInputSchema';

export const RegistryUpdateToOneWithWhereWithoutItemsInputSchema: z.ZodType<Prisma.RegistryUpdateToOneWithWhereWithoutItemsInput> = z.object({
  where: z.lazy(() => RegistryWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => RegistryUpdateWithoutItemsInputSchema),z.lazy(() => RegistryUncheckedUpdateWithoutItemsInputSchema) ]),
}).strict();

export default RegistryUpdateToOneWithWhereWithoutItemsInputSchema;
