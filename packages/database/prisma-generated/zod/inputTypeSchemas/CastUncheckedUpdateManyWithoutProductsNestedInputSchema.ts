import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastCreateWithoutProductsInputSchema } from './CastCreateWithoutProductsInputSchema';
import { CastUncheckedCreateWithoutProductsInputSchema } from './CastUncheckedCreateWithoutProductsInputSchema';
import { CastCreateOrConnectWithoutProductsInputSchema } from './CastCreateOrConnectWithoutProductsInputSchema';
import { CastUpsertWithWhereUniqueWithoutProductsInputSchema } from './CastUpsertWithWhereUniqueWithoutProductsInputSchema';
import { CastWhereUniqueInputSchema } from './CastWhereUniqueInputSchema';
import { CastUpdateWithWhereUniqueWithoutProductsInputSchema } from './CastUpdateWithWhereUniqueWithoutProductsInputSchema';
import { CastUpdateManyWithWhereWithoutProductsInputSchema } from './CastUpdateManyWithWhereWithoutProductsInputSchema';
import { CastScalarWhereInputSchema } from './CastScalarWhereInputSchema';

export const CastUncheckedUpdateManyWithoutProductsNestedInputSchema: z.ZodType<Prisma.CastUncheckedUpdateManyWithoutProductsNestedInput> = z.object({
  create: z.union([ z.lazy(() => CastCreateWithoutProductsInputSchema),z.lazy(() => CastCreateWithoutProductsInputSchema).array(),z.lazy(() => CastUncheckedCreateWithoutProductsInputSchema),z.lazy(() => CastUncheckedCreateWithoutProductsInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CastCreateOrConnectWithoutProductsInputSchema),z.lazy(() => CastCreateOrConnectWithoutProductsInputSchema).array() ]).optional(),
  upsert: z.union([ z.lazy(() => CastUpsertWithWhereUniqueWithoutProductsInputSchema),z.lazy(() => CastUpsertWithWhereUniqueWithoutProductsInputSchema).array() ]).optional(),
  set: z.union([ z.lazy(() => CastWhereUniqueInputSchema),z.lazy(() => CastWhereUniqueInputSchema).array() ]).optional(),
  disconnect: z.union([ z.lazy(() => CastWhereUniqueInputSchema),z.lazy(() => CastWhereUniqueInputSchema).array() ]).optional(),
  delete: z.union([ z.lazy(() => CastWhereUniqueInputSchema),z.lazy(() => CastWhereUniqueInputSchema).array() ]).optional(),
  connect: z.union([ z.lazy(() => CastWhereUniqueInputSchema),z.lazy(() => CastWhereUniqueInputSchema).array() ]).optional(),
  update: z.union([ z.lazy(() => CastUpdateWithWhereUniqueWithoutProductsInputSchema),z.lazy(() => CastUpdateWithWhereUniqueWithoutProductsInputSchema).array() ]).optional(),
  updateMany: z.union([ z.lazy(() => CastUpdateManyWithWhereWithoutProductsInputSchema),z.lazy(() => CastUpdateManyWithWhereWithoutProductsInputSchema).array() ]).optional(),
  deleteMany: z.union([ z.lazy(() => CastScalarWhereInputSchema),z.lazy(() => CastScalarWhereInputSchema).array() ]).optional(),
}).strict();

export default CastUncheckedUpdateManyWithoutProductsNestedInputSchema;
