import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemScalarWhereInputSchema } from './RegistryItemScalarWhereInputSchema';
import { RegistryItemUpdateManyMutationInputSchema } from './RegistryItemUpdateManyMutationInputSchema';
import { RegistryItemUncheckedUpdateManyWithoutRegistryInputSchema } from './RegistryItemUncheckedUpdateManyWithoutRegistryInputSchema';

export const RegistryItemUpdateManyWithWhereWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryItemUpdateManyWithWhereWithoutRegistryInput> =
  z
    .object({
      where: z.lazy(() => RegistryItemScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => RegistryItemUpdateManyMutationInputSchema),
        z.lazy(() => RegistryItemUncheckedUpdateManyWithoutRegistryInputSchema),
      ]),
    })
    .strict();

export default RegistryItemUpdateManyWithWhereWithoutRegistryInputSchema;
