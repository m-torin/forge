import { z } from 'zod';
import type { Prisma } from '../../client';

export const JollyRogerCountOutputTypeSelectSchema: z.ZodType<Prisma.JollyRogerCountOutputTypeSelect> = z.object({
  extractionRules: z.boolean().optional(),
}).strict();

export default JollyRogerCountOutputTypeSelectSchema;
