import { z } from 'zod';
import type { Prisma } from '../../client';
import { JollyRogerArgsSchema } from '../outputTypeSchemas/JollyRogerArgsSchema';
import { JrFindReplaceRejectFindManyArgsSchema } from '../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema';
import { JrExtractionRuleCountOutputTypeArgsSchema } from '../outputTypeSchemas/JrExtractionRuleCountOutputTypeArgsSchema';

export const JrExtractionRuleSelectSchema: z.ZodType<Prisma.JrExtractionRuleSelect> = z
  .object({
    id: z.boolean().optional(),
    jollyRogerId: z.boolean().optional(),
    fieldName: z.boolean().optional(),
    isActive: z.boolean().optional(),
    selectors: z.boolean().optional(),
    mustContain: z.boolean().optional(),
    cannotContain: z.boolean().optional(),
    lastSuccessfulSelector: z.boolean().optional(),
    successRate: z.boolean().optional(),
    lastTestedAt: z.boolean().optional(),
    notes: z.boolean().optional(),
    jollyRoger: z.union([z.boolean(), z.lazy(() => JollyRogerArgsSchema)]).optional(),
    findReplaceRules: z
      .union([z.boolean(), z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)])
      .optional(),
    _count: z
      .union([z.boolean(), z.lazy(() => JrExtractionRuleCountOutputTypeArgsSchema)])
      .optional(),
  })
  .strict();

export default JrExtractionRuleSelectSchema;
