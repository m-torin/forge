import type { Prisma } from '../../client';

import { z } from 'zod';
import { JollyRogerCreateWithoutBrandInputSchema } from './JollyRogerCreateWithoutBrandInputSchema';
import { JollyRogerUncheckedCreateWithoutBrandInputSchema } from './JollyRogerUncheckedCreateWithoutBrandInputSchema';
import { JollyRogerCreateOrConnectWithoutBrandInputSchema } from './JollyRogerCreateOrConnectWithoutBrandInputSchema';
import { JollyRogerUpsertWithoutBrandInputSchema } from './JollyRogerUpsertWithoutBrandInputSchema';
import { JollyRogerWhereInputSchema } from './JollyRogerWhereInputSchema';
import { JollyRogerWhereUniqueInputSchema } from './JollyRogerWhereUniqueInputSchema';
import { JollyRogerUpdateToOneWithWhereWithoutBrandInputSchema } from './JollyRogerUpdateToOneWithWhereWithoutBrandInputSchema';
import { JollyRogerUpdateWithoutBrandInputSchema } from './JollyRogerUpdateWithoutBrandInputSchema';
import { JollyRogerUncheckedUpdateWithoutBrandInputSchema } from './JollyRogerUncheckedUpdateWithoutBrandInputSchema';

export const JollyRogerUncheckedUpdateOneWithoutBrandNestedInputSchema: z.ZodType<Prisma.JollyRogerUncheckedUpdateOneWithoutBrandNestedInput> = z.object({
  create: z.union([ z.lazy(() => JollyRogerCreateWithoutBrandInputSchema),z.lazy(() => JollyRogerUncheckedCreateWithoutBrandInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => JollyRogerCreateOrConnectWithoutBrandInputSchema).optional(),
  upsert: z.lazy(() => JollyRogerUpsertWithoutBrandInputSchema).optional(),
  disconnect: z.union([ z.boolean(),z.lazy(() => JollyRogerWhereInputSchema) ]).optional(),
  delete: z.union([ z.boolean(),z.lazy(() => JollyRogerWhereInputSchema) ]).optional(),
  connect: z.lazy(() => JollyRogerWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => JollyRogerUpdateToOneWithWhereWithoutBrandInputSchema),z.lazy(() => JollyRogerUpdateWithoutBrandInputSchema),z.lazy(() => JollyRogerUncheckedUpdateWithoutBrandInputSchema) ]).optional(),
}).strict();

export default JollyRogerUncheckedUpdateOneWithoutBrandNestedInputSchema;
