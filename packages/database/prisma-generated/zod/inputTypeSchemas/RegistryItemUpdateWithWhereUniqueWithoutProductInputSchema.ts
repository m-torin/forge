import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemUpdateWithoutProductInputSchema } from './RegistryItemUpdateWithoutProductInputSchema';
import { RegistryItemUncheckedUpdateWithoutProductInputSchema } from './RegistryItemUncheckedUpdateWithoutProductInputSchema';

export const RegistryItemUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.RegistryItemUpdateWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => RegistryItemWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => RegistryItemUpdateWithoutProductInputSchema),z.lazy(() => RegistryItemUncheckedUpdateWithoutProductInputSchema) ]),
}).strict();

export default RegistryItemUpdateWithWhereUniqueWithoutProductInputSchema;
