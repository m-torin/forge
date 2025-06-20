import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryCreateWithoutItemsInputSchema } from './RegistryCreateWithoutItemsInputSchema';
import { RegistryUncheckedCreateWithoutItemsInputSchema } from './RegistryUncheckedCreateWithoutItemsInputSchema';
import { RegistryCreateOrConnectWithoutItemsInputSchema } from './RegistryCreateOrConnectWithoutItemsInputSchema';
import { RegistryUpsertWithoutItemsInputSchema } from './RegistryUpsertWithoutItemsInputSchema';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryUpdateToOneWithWhereWithoutItemsInputSchema } from './RegistryUpdateToOneWithWhereWithoutItemsInputSchema';
import { RegistryUpdateWithoutItemsInputSchema } from './RegistryUpdateWithoutItemsInputSchema';
import { RegistryUncheckedUpdateWithoutItemsInputSchema } from './RegistryUncheckedUpdateWithoutItemsInputSchema';

export const RegistryUpdateOneRequiredWithoutItemsNestedInputSchema: z.ZodType<Prisma.RegistryUpdateOneRequiredWithoutItemsNestedInput> = z.object({
  create: z.union([ z.lazy(() => RegistryCreateWithoutItemsInputSchema),z.lazy(() => RegistryUncheckedCreateWithoutItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => RegistryCreateOrConnectWithoutItemsInputSchema).optional(),
  upsert: z.lazy(() => RegistryUpsertWithoutItemsInputSchema).optional(),
  connect: z.lazy(() => RegistryWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => RegistryUpdateToOneWithWhereWithoutItemsInputSchema),z.lazy(() => RegistryUpdateWithoutItemsInputSchema),z.lazy(() => RegistryUncheckedUpdateWithoutItemsInputSchema) ]).optional(),
}).strict();

export default RegistryUpdateOneRequiredWithoutItemsNestedInputSchema;
