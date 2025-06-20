import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryCreateWithoutOrderItemsInputSchema } from './RegistryCreateWithoutOrderItemsInputSchema';
import { RegistryUncheckedCreateWithoutOrderItemsInputSchema } from './RegistryUncheckedCreateWithoutOrderItemsInputSchema';
import { RegistryCreateOrConnectWithoutOrderItemsInputSchema } from './RegistryCreateOrConnectWithoutOrderItemsInputSchema';
import { RegistryUpsertWithoutOrderItemsInputSchema } from './RegistryUpsertWithoutOrderItemsInputSchema';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryUpdateToOneWithWhereWithoutOrderItemsInputSchema } from './RegistryUpdateToOneWithWhereWithoutOrderItemsInputSchema';
import { RegistryUpdateWithoutOrderItemsInputSchema } from './RegistryUpdateWithoutOrderItemsInputSchema';
import { RegistryUncheckedUpdateWithoutOrderItemsInputSchema } from './RegistryUncheckedUpdateWithoutOrderItemsInputSchema';

export const RegistryUpdateOneWithoutOrderItemsNestedInputSchema: z.ZodType<Prisma.RegistryUpdateOneWithoutOrderItemsNestedInput> = z.object({
  create: z.union([ z.lazy(() => RegistryCreateWithoutOrderItemsInputSchema),z.lazy(() => RegistryUncheckedCreateWithoutOrderItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => RegistryCreateOrConnectWithoutOrderItemsInputSchema).optional(),
  upsert: z.lazy(() => RegistryUpsertWithoutOrderItemsInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => RegistryWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => RegistryWhereInputSchema) ]).optional(),
  connect: z.lazy(() => RegistryWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => RegistryUpdateToOneWithWhereWithoutOrderItemsInputSchema),z.lazy(() => RegistryUpdateWithoutOrderItemsInputSchema),z.lazy(() => RegistryUncheckedUpdateWithoutOrderItemsInputSchema) ]).optional(),
}).strict();

export default RegistryUpdateOneWithoutOrderItemsNestedInputSchema;
