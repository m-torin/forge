import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryItemCreateWithoutCollectionInputSchema } from './RegistryItemCreateWithoutCollectionInputSchema';
import { RegistryItemUncheckedCreateWithoutCollectionInputSchema } from './RegistryItemUncheckedCreateWithoutCollectionInputSchema';
import { RegistryItemCreateOrConnectWithoutCollectionInputSchema } from './RegistryItemCreateOrConnectWithoutCollectionInputSchema';
import { RegistryItemUpsertWithWhereUniqueWithoutCollectionInputSchema } from './RegistryItemUpsertWithWhereUniqueWithoutCollectionInputSchema';
import { RegistryItemCreateManyCollectionInputEnvelopeSchema } from './RegistryItemCreateManyCollectionInputEnvelopeSchema';
import { RegistryItemWhereUniqueInputSchema } from './RegistryItemWhereUniqueInputSchema';
import { RegistryItemUpdateWithWhereUniqueWithoutCollectionInputSchema } from './RegistryItemUpdateWithWhereUniqueWithoutCollectionInputSchema';
import { RegistryItemUpdateManyWithWhereWithoutCollectionInputSchema } from './RegistryItemUpdateManyWithWhereWithoutCollectionInputSchema';
import { RegistryItemScalarWhereInputSchema } from './RegistryItemScalarWhereInputSchema';

export const RegistryItemUncheckedUpdateManyWithoutCollectionNestedInputSchema: z.ZodType<Prisma.RegistryItemUncheckedUpdateManyWithoutCollectionNestedInput> = z.object({
  create: z.union([ z.lazy(() => RegistryItemCreateWithoutCollectionInputSchema),z.lazy(() => RegistryItemCreateWithoutCollectionInputSchema).array(),z.lazy(() => RegistryItemUncheckedCreateWithoutCollectionInputSchema),z.lazy(() => RegistryItemUncheckedCreateWithoutCollectionInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => RegistryItemCreateOrConnectWithoutCollectionInputSchema),z.lazy(() => RegistryItemCreateOrConnectWithoutCollectionInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => RegistryItemUpsertWithWhereUniqueWithoutCollectionInputSchema),z.lazy(() => RegistryItemUpsertWithWhereUniqueWithoutCollectionInputSchema).array() ]).optional(),
  createMany: z.lazy(() => RegistryItemCreateManyCollectionInputEnvelopeSchema).optional(),
  set: z.union([ z.lazy(() => RegistryItemWhereUniqueInputSchema),z.lazy(() => RegistryItemWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => RegistryItemWhereUniqueInputSchema),z.lazy(() => RegistryItemWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => RegistryItemWhereUniqueInputSchema),z.lazy(() => RegistryItemWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => RegistryItemWhereUniqueInputSchema),z.lazy(() => RegistryItemWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => RegistryItemUpdateWithWhereUniqueWithoutCollectionInputSchema),z.lazy(() => RegistryItemUpdateWithWhereUniqueWithoutCollectionInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => RegistryItemUpdateManyWithWhereWithoutCollectionInputSchema),z.lazy(() => RegistryItemUpdateManyWithWhereWithoutCollectionInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => RegistryItemScalarWhereInputSchema),z.lazy(() => RegistryItemScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default RegistryItemUncheckedUpdateManyWithoutCollectionNestedInputSchema;
