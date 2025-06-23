import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrExtractionRuleCountOutputTypeSelectSchema } from './JrExtractionRuleCountOutputTypeSelectSchema';

export const JrExtractionRuleCountOutputTypeArgsSchema: z.ZodType<Prisma.JrExtractionRuleCountOutputTypeDefaultArgs> =
  z
    .object({
      select: z.lazy(() => JrExtractionRuleCountOutputTypeSelectSchema).nullish(),
    })
    .strict();

export default JrExtractionRuleCountOutputTypeSelectSchema;
