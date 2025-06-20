import type { Prisma } from '../../client';

import { z } from 'zod';
import { JollyRogerWhereUniqueInputSchema } from './JollyRogerWhereUniqueInputSchema';
import { JollyRogerCreateWithoutExtractionRulesInputSchema } from './JollyRogerCreateWithoutExtractionRulesInputSchema';
import { JollyRogerUncheckedCreateWithoutExtractionRulesInputSchema } from './JollyRogerUncheckedCreateWithoutExtractionRulesInputSchema';

export const JollyRogerCreateOrConnectWithoutExtractionRulesInputSchema: z.ZodType<Prisma.JollyRogerCreateOrConnectWithoutExtractionRulesInput> = z.object({
  where: z.lazy(() => JollyRogerWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => JollyRogerCreateWithoutExtractionRulesInputSchema),z.lazy(() => JollyRogerUncheckedCreateWithoutExtractionRulesInputSchema) ]),
}).strict();

export default JollyRogerCreateOrConnectWithoutExtractionRulesInputSchema;
