import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionCreateWithoutRegistriesInputSchema } from './CollectionCreateWithoutRegistriesInputSchema';
import { CollectionUncheckedCreateWithoutRegistriesInputSchema } from './CollectionUncheckedCreateWithoutRegistriesInputSchema';
import { CollectionCreateOrConnectWithoutRegistriesInputSchema } from './CollectionCreateOrConnectWithoutRegistriesInputSchema';
import { CollectionUpsertWithoutRegistriesInputSchema } from './CollectionUpsertWithoutRegistriesInputSchema';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';
import { CollectionWhereUniqueInputSchema } from './CollectionWhereUniqueInputSchema';
import { CollectionUpdateToOneWithWhereWithoutRegistriesInputSchema } from './CollectionUpdateToOneWithWhereWithoutRegistriesInputSchema';
import { CollectionUpdateWithoutRegistriesInputSchema } from './CollectionUpdateWithoutRegistriesInputSchema';
import { CollectionUncheckedUpdateWithoutRegistriesInputSchema } from './CollectionUncheckedUpdateWithoutRegistriesInputSchema';

export const CollectionUpdateOneWithoutRegistriesNestedInputSchema: z.ZodType<Prisma.CollectionUpdateOneWithoutRegistriesNestedInput> = z.object({
  create: z.union([ z.lazy(() => CollectionCreateWithoutRegistriesInputSchema),z.lazy(() => CollectionUncheckedCreateWithoutRegistriesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CollectionCreateOrConnectWithoutRegistriesInputSchema).optional(),
  upsert: z.lazy(() => CollectionUpsertWithoutRegistriesInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => CollectionWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => CollectionWhereInputSchema) ]).optional(),
  connect: z.lazy(() => CollectionWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CollectionUpdateToOneWithWhereWithoutRegistriesInputSchema),z.lazy(() => CollectionUpdateWithoutRegistriesInputSchema),z.lazy(() => CollectionUncheckedUpdateWithoutRegistriesInputSchema) ]).optional(),
}).strict();

export default CollectionUpdateOneWithoutRegistriesNestedInputSchema;
