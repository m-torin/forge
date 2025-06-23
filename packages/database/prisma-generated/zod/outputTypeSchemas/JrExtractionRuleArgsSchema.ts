import { z } from 'zod';
import type { Prisma } from '../../client';
import { JrExtractionRuleSelectSchema } from '../inputTypeSchemas/JrExtractionRuleSelectSchema';
import { JrExtractionRuleIncludeSchema } from '../inputTypeSchemas/JrExtractionRuleIncludeSchema';

export const JrExtractionRuleArgsSchema: z.ZodType<Prisma.JrExtractionRuleDefaultArgs> = z
  .object({
    select: z.lazy(() => JrExtractionRuleSelectSchema).optional(),
    include: z.lazy(() => JrExtractionRuleIncludeSchema).optional(),
  })
  .strict();

export default JrExtractionRuleArgsSchema;
