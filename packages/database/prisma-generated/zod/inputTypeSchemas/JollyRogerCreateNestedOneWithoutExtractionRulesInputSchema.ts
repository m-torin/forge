import type { Prisma } from '../../client';

import { z } from 'zod';
import { JollyRogerCreateWithoutExtractionRulesInputSchema } from './JollyRogerCreateWithoutExtractionRulesInputSchema';
import { JollyRogerUncheckedCreateWithoutExtractionRulesInputSchema } from './JollyRogerUncheckedCreateWithoutExtractionRulesInputSchema';
import { JollyRogerCreateOrConnectWithoutExtractionRulesInputSchema } from './JollyRogerCreateOrConnectWithoutExtractionRulesInputSchema';
import { JollyRogerWhereUniqueInputSchema } from './JollyRogerWhereUniqueInputSchema';

export const JollyRogerCreateNestedOneWithoutExtractionRulesInputSchema: z.ZodType<Prisma.JollyRogerCreateNestedOneWithoutExtractionRulesInput> = z.object({
  create: z.union([ z.lazy(() => JollyRogerCreateWithoutExtractionRulesInputSchema),z.lazy(() => JollyRogerUncheckedCreateWithoutExtractionRulesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => JollyRogerCreateOrConnectWithoutExtractionRulesInputSchema).optional(),
  connect: z.lazy(() => JollyRogerWhereUniqueInputSchema).optional()
}).strict();

export default JollyRogerCreateNestedOneWithoutExtractionRulesInputSchema;
