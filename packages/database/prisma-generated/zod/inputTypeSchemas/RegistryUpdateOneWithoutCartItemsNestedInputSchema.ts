import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryCreateWithoutCartItemsInputSchema } from './RegistryCreateWithoutCartItemsInputSchema';
import { RegistryUncheckedCreateWithoutCartItemsInputSchema } from './RegistryUncheckedCreateWithoutCartItemsInputSchema';
import { RegistryCreateOrConnectWithoutCartItemsInputSchema } from './RegistryCreateOrConnectWithoutCartItemsInputSchema';
import { RegistryUpsertWithoutCartItemsInputSchema } from './RegistryUpsertWithoutCartItemsInputSchema';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';
import { RegistryWhereUniqueInputSchema } from './RegistryWhereUniqueInputSchema';
import { RegistryUpdateToOneWithWhereWithoutCartItemsInputSchema } from './RegistryUpdateToOneWithWhereWithoutCartItemsInputSchema';
import { RegistryUpdateWithoutCartItemsInputSchema } from './RegistryUpdateWithoutCartItemsInputSchema';
import { RegistryUncheckedUpdateWithoutCartItemsInputSchema } from './RegistryUncheckedUpdateWithoutCartItemsInputSchema';

export const RegistryUpdateOneWithoutCartItemsNestedInputSchema: z.ZodType<Prisma.RegistryUpdateOneWithoutCartItemsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => RegistryCreateWithoutCartItemsInputSchema),
          z.lazy(() => RegistryUncheckedCreateWithoutCartItemsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => RegistryCreateOrConnectWithoutCartItemsInputSchema).optional(),
      upsert: z.lazy(() => RegistryUpsertWithoutCartItemsInputSchema).optional(),
      disconnect: z.union([z.boolean(), z.lazy(() => RegistryWhereInputSchema)]).optional(),
      delete: z.union([z.boolean(), z.lazy(() => RegistryWhereInputSchema)]).optional(),
      connect: z.lazy(() => RegistryWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => RegistryUpdateToOneWithWhereWithoutCartItemsInputSchema),
          z.lazy(() => RegistryUpdateWithoutCartItemsInputSchema),
          z.lazy(() => RegistryUncheckedUpdateWithoutCartItemsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default RegistryUpdateOneWithoutCartItemsNestedInputSchema;
