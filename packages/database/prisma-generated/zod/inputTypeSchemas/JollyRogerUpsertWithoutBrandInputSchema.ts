import type { Prisma } from '../../client';

import { z } from 'zod';
import { JollyRogerUpdateWithoutBrandInputSchema } from './JollyRogerUpdateWithoutBrandInputSchema';
import { JollyRogerUncheckedUpdateWithoutBrandInputSchema } from './JollyRogerUncheckedUpdateWithoutBrandInputSchema';
import { JollyRogerCreateWithoutBrandInputSchema } from './JollyRogerCreateWithoutBrandInputSchema';
import { JollyRogerUncheckedCreateWithoutBrandInputSchema } from './JollyRogerUncheckedCreateWithoutBrandInputSchema';
import { JollyRogerWhereInputSchema } from './JollyRogerWhereInputSchema';

export const JollyRogerUpsertWithoutBrandInputSchema: z.ZodType<Prisma.JollyRogerUpsertWithoutBrandInput> = z.object({
  update: z.union([ z.lazy(() => JollyRogerUpdateWithoutBrandInputSchema),z.lazy(() => JollyRogerUncheckedUpdateWithoutBrandInputSchema) ]),
  create: z.union([ z.lazy(() => JollyRogerCreateWithoutBrandInputSchema),z.lazy(() => JollyRogerUncheckedCreateWithoutBrandInputSchema) ]),
  where: z.lazy(() => JollyRogerWhereInputSchema).optional()
}).strict();

export default JollyRogerUpsertWithoutBrandInputSchema;
