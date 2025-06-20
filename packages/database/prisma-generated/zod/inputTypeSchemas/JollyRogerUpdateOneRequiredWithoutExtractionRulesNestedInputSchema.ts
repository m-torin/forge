import type { Prisma } from '../../client';

import { z } from 'zod';
import { JollyRogerCreateWithoutExtractionRulesInputSchema } from './JollyRogerCreateWithoutExtractionRulesInputSchema';
import { JollyRogerUncheckedCreateWithoutExtractionRulesInputSchema } from './JollyRogerUncheckedCreateWithoutExtractionRulesInputSchema';
import { JollyRogerCreateOrConnectWithoutExtractionRulesInputSchema } from './JollyRogerCreateOrConnectWithoutExtractionRulesInputSchema';
import { JollyRogerUpsertWithoutExtractionRulesInputSchema } from './JollyRogerUpsertWithoutExtractionRulesInputSchema';
import { JollyRogerWhereUniqueInputSchema } from './JollyRogerWhereUniqueInputSchema';
import { JollyRogerUpdateToOneWithWhereWithoutExtractionRulesInputSchema } from './JollyRogerUpdateToOneWithWhereWithoutExtractionRulesInputSchema';
import { JollyRogerUpdateWithoutExtractionRulesInputSchema } from './JollyRogerUpdateWithoutExtractionRulesInputSchema';
import { JollyRogerUncheckedUpdateWithoutExtractionRulesInputSchema } from './JollyRogerUncheckedUpdateWithoutExtractionRulesInputSchema';

export const JollyRogerUpdateOneRequiredWithoutExtractionRulesNestedInputSchema: z.ZodType<Prisma.JollyRogerUpdateOneRequiredWithoutExtractionRulesNestedInput> = z.object({
  create: z.union([ z.lazy(() => JollyRogerCreateWithoutExtractionRulesInputSchema),z.lazy(() => JollyRogerUncheckedCreateWithoutExtractionRulesInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => JollyRogerCreateOrConnectWithoutExtractionRulesInputSchema).optional(),
  upsert: z.lazy(() => JollyRogerUpsertWithoutExtractionRulesInputSchema).optional(),
  connect: z.lazy(() => JollyRogerWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => JollyRogerUpdateToOneWithWhereWithoutExtractionRulesInputSchema),z.lazy(() => JollyRogerUpdateWithoutExtractionRulesInputSchema),z.lazy(() => JollyRogerUncheckedUpdateWithoutExtractionRulesInputSchema) ]).optional(),
}).strict();

export default JollyRogerUpdateOneRequiredWithoutExtractionRulesNestedInputSchema;
