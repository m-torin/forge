import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryCreateWithoutVariantInputSchema } from './InventoryCreateWithoutVariantInputSchema';
import { InventoryUncheckedCreateWithoutVariantInputSchema } from './InventoryUncheckedCreateWithoutVariantInputSchema';
import { InventoryCreateOrConnectWithoutVariantInputSchema } from './InventoryCreateOrConnectWithoutVariantInputSchema';
import { InventoryCreateManyVariantInputEnvelopeSchema } from './InventoryCreateManyVariantInputEnvelopeSchema';
import { InventoryWhereUniqueInputSchema } from './InventoryWhereUniqueInputSchema';

export const InventoryCreateNestedManyWithoutVariantInputSchema: z.ZodType<Prisma.InventoryCreateNestedManyWithoutVariantInput> = z.object({
  create: z.union([ z.lazy(() => InventoryCreateWithoutVariantInputSchema),z.lazy(() => InventoryCreateWithoutVariantInputSchema).array(),z.lazy(() => InventoryUncheckedCreateWithoutVariantInputSchema),z.lazy(() => InventoryUncheckedCreateWithoutVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InventoryCreateOrConnectWithoutVariantInputSchema),z.lazy(() => InventoryCreateOrConnectWithoutVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InventoryCreateManyVariantInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => InventoryWhereUniqueInputSchema),z.lazy(() => InventoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default InventoryCreateNestedManyWithoutVariantInputSchema;
