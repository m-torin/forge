import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemUpdateWithoutRegistryInputSchema } from './RegistryItemUpdateWithoutRegistryInputSchema';
import { RegistryItemUncheckedUpdateWithoutRegistryInputSchema } from './RegistryItemUncheckedUpdateWithoutRegistryInputSchema';
import { RegistryItemCreateWithoutRegistryInputSchema } from './RegistryItemCreateWithoutRegistryInputSchema';
import { RegistryItemUncheckedCreateWithoutRegistryInputSchema } from './RegistryItemUncheckedCreateWithoutRegistryInputSchema';

export const RegistryItemUpsertWithWhereUniqueWithoutRegistryInputSchema: z.ZodType<Prisma.RegistryItemUpsertWithWhereUniqueWithoutRegistryInput> = z.object({
  where: z.lazy(() => RegistryItemWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => RegistryItemUpdateWithoutRegistryInputSchema),z.lazy(() => RegistryItemUncheckedUpdateWithoutRegistryInputSchema) ]),
  create: z.union([ z.lazy(() => RegistryItemCreateWithoutRegistryInputSchema),z.lazy(() => RegistryItemUncheckedCreateWithoutRegistryInputSchema) ]),
}).strict();

export default RegistryItemUpsertWithWhereUniqueWithoutRegistryInputSchema;
