import type { Prisma } from '../../client';

import { z } from 'zod';
import { JollyRogerWhereUniqueInputSchema } from './JollyRogerWhereUniqueInputSchema';
import { JollyRogerCreateWithoutBrandInputSchema } from './JollyRogerCreateWithoutBrandInputSchema';
import { JollyRogerUncheckedCreateWithoutBrandInputSchema } from './JollyRogerUncheckedCreateWithoutBrandInputSchema';

export const JollyRogerCreateOrConnectWithoutBrandInputSchema: z.ZodType<Prisma.JollyRogerCreateOrConnectWithoutBrandInput> = z.object({
  where: z.lazy(() => JollyRogerWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => JollyRogerCreateWithoutBrandInputSchema),z.lazy(() => JollyRogerUncheckedCreateWithoutBrandInputSchema) ]),
}).strict();

export default JollyRogerCreateOrConnectWithoutBrandInputSchema;
