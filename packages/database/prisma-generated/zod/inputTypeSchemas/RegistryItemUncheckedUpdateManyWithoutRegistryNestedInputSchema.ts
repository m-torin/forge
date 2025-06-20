import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemCreateWithoutRegistryInputSchema } from './RegistryItemCreateWithoutRegistryInputSchema';
import { RegistryItemUncheckedCreateWithoutRegistryInputSchema } from './RegistryItemUncheckedCreateWithoutRegistryInputSchema';
import { RegistryItemCreateOrConnectWithoutRegistryInputSchema } from './RegistryItemCreateOrConnectWithoutRegistryInputSchema';
import { RegistryItemUpsertWithWhereUniqueWithoutRegistryInputSchema } from './RegistryItemUpsertWithWhereUniqueWithoutRegistryInputSchema';
import { RegistryItemCreateManyRegistryInputEnvelopeSchema } from './RegistryItemCreateManyRegistryInputEnvelopeSchema';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemUpdateWithWhereUniqueWithoutRegistryInputSchema } from './RegistryItemUpdateWithWhereUniqueWithoutRegistryInputSchema';
import { RegistryItemUpdateManyWithWhereWithoutRegistryInputSchema } from './RegistryItemUpdateManyWithWhereWithoutRegistryInputSchema';
import { RegistryItemScalarWhereInputSchema } from './RegistryItemScalarWhereInputSchema';

export const RegistryItemUncheckedUpdateManyWithoutRegistryNestedInputSchema: z.ZodType<Prisma.RegistryItemUncheckedUpdateManyWithoutRegistryNestedInput> = z.object({
  create: z.union([ z.lazy(() => RegistryItemCreateWithoutRegistryInputSchema),z.lazy(() => RegistryItemCreateWithoutRegistryInputSchema).array(),z.lazy(() => RegistryItemUncheckedCreateWithoutRegistryInputSchema),z.lazy(() => RegistryItemUncheckedCreateWithoutRegistryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RegistryItemCreateOrConnectWithoutRegistryInputSchema),z.lazy(() => RegistryItemCreateOrConnectWithoutRegistryInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RegistryItemUpsertWithWhereUniqueWithoutRegistryInputSchema),z.lazy(() => RegistryItemUpsertWithWhereUniqueWithoutRegistryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RegistryItemCreateManyRegistryInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RegistryItemWhereUniqueInputSchema),z.lazy(() => RegistryItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RegistryItemWhereUniqueInputSchema),z.lazy(() => RegistryItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RegistryItemWhereUniqueInputSchema),z.lazy(() => RegistryItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RegistryItemWhereUniqueInputSchema),z.lazy(() => RegistryItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RegistryItemUpdateWithWhereUniqueWithoutRegistryInputSchema),z.lazy(() => RegistryItemUpdateWithWhereUniqueWithoutRegistryInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RegistryItemUpdateManyWithWhereWithoutRegistryInputSchema),z.lazy(() => RegistryItemUpdateManyWithWhereWithoutRegistryInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RegistryItemScalarWhereInputSchema),z.lazy(() => RegistryItemScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default RegistryItemUncheckedUpdateManyWithoutRegistryNestedInputSchema;
