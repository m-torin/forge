import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemCreateWithoutDeletedByInputSchema } from './RegistryItemCreateWithoutDeletedByInputSchema';
import { RegistryItemUncheckedCreateWithoutDeletedByInputSchema } from './RegistryItemUncheckedCreateWithoutDeletedByInputSchema';
import { RegistryItemCreateOrConnectWithoutDeletedByInputSchema } from './RegistryItemCreateOrConnectWithoutDeletedByInputSchema';
import { RegistryItemUpsertWithWhereUniqueWithoutDeletedByInputSchema } from './RegistryItemUpsertWithWhereUniqueWithoutDeletedByInputSchema';
import { RegistryItemCreateManyDeletedByInputEnvelopeSchema } from './RegistryItemCreateManyDeletedByInputEnvelopeSchema';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemUpdateWithWhereUniqueWithoutDeletedByInputSchema } from './RegistryItemUpdateWithWhereUniqueWithoutDeletedByInputSchema';
import { RegistryItemUpdateManyWithWhereWithoutDeletedByInputSchema } from './RegistryItemUpdateManyWithWhereWithoutDeletedByInputSchema';
import { RegistryItemScalarWhereInputSchema } from './RegistryItemScalarWhereInputSchema';

export const RegistryItemUpdateManyWithoutDeletedByNestedInputSchema: z.ZodType<Prisma.RegistryItemUpdateManyWithoutDeletedByNestedInput> = z.object({
  create: z.union([ z.lazy(() => RegistryItemCreateWithoutDeletedByInputSchema),z.lazy(() => RegistryItemCreateWithoutDeletedByInputSchema).array(),z.lazy(() => RegistryItemUncheckedCreateWithoutDeletedByInputSchema),z.lazy(() => RegistryItemUncheckedCreateWithoutDeletedByInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RegistryItemCreateOrConnectWithoutDeletedByInputSchema),z.lazy(() => RegistryItemCreateOrConnectWithoutDeletedByInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RegistryItemUpsertWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => RegistryItemUpsertWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RegistryItemCreateManyDeletedByInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RegistryItemWhereUniqueInputSchema),z.lazy(() => RegistryItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RegistryItemWhereUniqueInputSchema),z.lazy(() => RegistryItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RegistryItemWhereUniqueInputSchema),z.lazy(() => RegistryItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RegistryItemWhereUniqueInputSchema),z.lazy(() => RegistryItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RegistryItemUpdateWithWhereUniqueWithoutDeletedByInputSchema),z.lazy(() => RegistryItemUpdateWithWhereUniqueWithoutDeletedByInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RegistryItemUpdateManyWithWhereWithoutDeletedByInputSchema),z.lazy(() => RegistryItemUpdateManyWithWhereWithoutDeletedByInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RegistryItemScalarWhereInputSchema),z.lazy(() => RegistryItemScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default RegistryItemUpdateManyWithoutDeletedByNestedInputSchema;
