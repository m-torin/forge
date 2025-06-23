import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemScalarWhereInputSchema } from './RegistryItemScalarWhereInputSchema';
import { RegistryItemUpdateManyMutationInputSchema } from './RegistryItemUpdateManyMutationInputSchema';
import { RegistryItemUncheckedUpdateManyWithoutCollectionInputSchema } from './RegistryItemUncheckedUpdateManyWithoutCollectionInputSchema';

export const RegistryItemUpdateManyWithWhereWithoutCollectionInputSchema: z.ZodType<Prisma.RegistryItemUpdateManyWithWhereWithoutCollectionInput> =
  z
    .object({
      where: z.lazy(() => RegistryItemScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => RegistryItemUpdateManyMutationInputSchema),
        z.lazy(() => RegistryItemUncheckedUpdateManyWithoutCollectionInputSchema),
      ]),
    })
    .strict();

export default RegistryItemUpdateManyWithWhereWithoutCollectionInputSchema;
