import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemCreateWithoutVariantInputSchema } from './OrderItemCreateWithoutVariantInputSchema';
import { OrderItemUncheckedCreateWithoutVariantInputSchema } from './OrderItemUncheckedCreateWithoutVariantInputSchema';
import { OrderItemCreateOrConnectWithoutVariantInputSchema } from './OrderItemCreateOrConnectWithoutVariantInputSchema';
import { OrderItemUpsertWithWhereUniqueWithoutVariantInputSchema } from './OrderItemUpsertWithWhereUniqueWithoutVariantInputSchema';
import { OrderItemCreateManyVariantInputEnvelopeSchema } from './OrderItemCreateManyVariantInputEnvelopeSchema';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemUpdateWithWhereUniqueWithoutVariantInputSchema } from './OrderItemUpdateWithWhereUniqueWithoutVariantInputSchema';
import { OrderItemUpdateManyWithWhereWithoutVariantInputSchema } from './OrderItemUpdateManyWithWhereWithoutVariantInputSchema';
import { OrderItemScalarWhereInputSchema } from './OrderItemScalarWhereInputSchema';

export const OrderItemUpdateManyWithoutVariantNestedInputSchema: z.ZodType<Prisma.OrderItemUpdateManyWithoutVariantNestedInput> = z.object({
  create: z.union([ z.lazy(() => OrderItemCreateWithoutVariantInputSchema),z.lazy(() => OrderItemCreateWithoutVariantInputSchema).array(),z.lazy(() => OrderItemUncheckedCreateWithoutVariantInputSchema),z.lazy(() => OrderItemUncheckedCreateWithoutVariantInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => OrderItemCreateOrConnectWithoutVariantInputSchema),z.lazy(() => OrderItemCreateOrConnectWithoutVariantInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutVariantInputSchema),z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutVariantInputSchema).array() ]).optional(),
  createMany: z.lazy(() => OrderItemCreateManyVariantInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema),z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema),z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema),z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => OrderItemWhereUniqueInputSchema),z.lazy(() => OrderItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutVariantInputSchema),z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutVariantInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => OrderItemUpdateManyWithWhereWithoutVariantInputSchema),z.lazy(() => OrderItemUpdateManyWithWhereWithoutVariantInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => OrderItemScalarWhereInputSchema),z.lazy(() => OrderItemScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default OrderItemUpdateManyWithoutVariantNestedInputSchema;
