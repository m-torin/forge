import type { Prisma } from '../../client';

import { z } from 'zod';
import { InventoryCreateWithoutProductInputSchema } from './InventoryCreateWithoutProductInputSchema';
import { InventoryUncheckedCreateWithoutProductInputSchema } from './InventoryUncheckedCreateWithoutProductInputSchema';
import { InventoryCreateOrConnectWithoutProductInputSchema } from './InventoryCreateOrConnectWithoutProductInputSchema';
import { InventoryCreateManyProductInputEnvelopeSchema } from './InventoryCreateManyProductInputEnvelopeSchema';
import { InventoryWhereUniqueInputSchema } from './InventoryWhereUniqueInputSchema';

export const InventoryCreateNestedManyWithoutProductInputSchema: z.ZodType<Prisma.InventoryCreateNestedManyWithoutProductInput> = z.object({
  create: z.union([ z.lazy(() => InventoryCreateWithoutProductInputSchema),z.lazy(() => InventoryCreateWithoutProductInputSchema).array(),z.lazy(() => InventoryUncheckedCreateWithoutProductInputSchema),z.lazy(() => InventoryUncheckedCreateWithoutProductInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => InventoryCreateOrConnectWithoutProductInputSchema),z.lazy(() => InventoryCreateOrConnectWithoutProductInputSchema).array() ]).optional(),
  createMany: z.lazy(() => InventoryCreateManyProductInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => InventoryWhereUniqueInputSchema),z.lazy(() => InventoryWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default InventoryCreateNestedManyWithoutProductInputSchema;
