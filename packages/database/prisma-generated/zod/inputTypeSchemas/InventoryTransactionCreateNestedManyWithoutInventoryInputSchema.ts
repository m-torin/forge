import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryTransactionCreateWithoutInventoryInputSchema } from './InventoryTransactionCreateWithoutInventoryInputSchema';
import { InventoryTransactionUncheckedCreateWithoutInventoryInputSchema } from './InventoryTransactionUncheckedCreateWithoutInventoryInputSchema';
import { InventoryTransactionCreateOrConnectWithoutInventoryInputSchema } from './InventoryTransactionCreateOrConnectWithoutInventoryInputSchema';
import { InventoryTransactionCreateManyInventoryInputEnvelopeSchema } from './InventoryTransactionCreateManyInventoryInputEnvelopeSchema';
import { InventoryTransactionWhereUniqueInputSchema } from './InventoryTransactionWhereUniqueInputSchema';

export const InventoryTransactionCreateNestedManyWithoutInventoryInputSchema: z.ZodType<Prisma.InventoryTransactionCreateNestedManyWithoutInventoryInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => InventoryTransactionCreateWithoutInventoryInputSchema),
          z.lazy(() => InventoryTransactionCreateWithoutInventoryInputSchema).array(),
          z.lazy(() => InventoryTransactionUncheckedCreateWithoutInventoryInputSchema),
          z.lazy(() => InventoryTransactionUncheckedCreateWithoutInventoryInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => InventoryTransactionCreateOrConnectWithoutInventoryInputSchema),
          z.lazy(() => InventoryTransactionCreateOrConnectWithoutInventoryInputSchema).array(),
        ])
        .optional(),
      createMany: z
        .lazy(() => InventoryTransactionCreateManyInventoryInputEnvelopeSchema)
        .optional(),
      connect: z
        .union([
          z.lazy(() => InventoryTransactionWhereUniqueInputSchema),
          z.lazy(() => InventoryTransactionWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default InventoryTransactionCreateNestedManyWithoutInventoryInputSchema;
