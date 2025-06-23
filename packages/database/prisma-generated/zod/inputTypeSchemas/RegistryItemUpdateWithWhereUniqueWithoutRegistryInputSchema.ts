import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemUpdateWithoutRegistryInputSchema } from './RegistryItemUpdateWithoutRegistryInputSchema';
import { RegistryItemUncheckedUpdateWithoutRegistryInputSchema } from './RegistryItemUncheckedUpdateWithoutRegistryInputSchema';

export const RegistryItemUpdateWithWhereUniqueWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryItemUpdateWithWhereUniqueWithoutRegistryInput> =
  z
    .object({
      where: z.lazy(() => RegistryItemWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => RegistryItemUpdateWithoutRegistryInputSchema),
        z.lazy(() => RegistryItemUncheckedUpdateWithoutRegistryInputSchema),
      ]),
    })
    .strict();

export default RegistryItemUpdateWithWhereUniqueWithoutRegistryInputSchema;
