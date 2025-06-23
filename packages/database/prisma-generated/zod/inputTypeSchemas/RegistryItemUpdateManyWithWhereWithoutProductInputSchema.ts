import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemScalarWhereInputSchema } from './RegistryItemScalarWhereInputSchema';
import { RegistryItemUpdateManyMutationInputSchema } from './RegistryItemUpdateManyMutationInputSchema';
import { RegistryItemUncheckedUpdateManyWithoutProductInputSchema } from './RegistryItemUncheckedUpdateManyWithoutProductInputSchema';

export const RegistryItemUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.RegistryItemUpdateManyWithWhereWithoutProductInput> =
  z
    .object({
      where: z.lazy(() => RegistryItemScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => RegistryItemUpdateManyMutationInputSchema),
        z.lazy(() => RegistryItemUncheckedUpdateManyWithoutProductInputSchema),
      ]),
    })
    .strict();

export default RegistryItemUpdateManyWithWhereWithoutProductInputSchema;
