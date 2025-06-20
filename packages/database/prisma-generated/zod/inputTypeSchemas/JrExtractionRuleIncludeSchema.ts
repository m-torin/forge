import { z } from 'zod';
import type { Prisma } from '../../client';
import { JollyRogerArgsSchema } from "../outputTypeSchemas/JollyRogerArgsSchema"
import { JrFindReplaceRejectFindManyArgsSchema } from "../outputTypeSchemas/JrFindReplaceRejectFindManyArgsSchema"
import { JrExtractionRuleCountOutputTypeArgsSchema } from "../outputTypeSchemas/JrExtractionRuleCountOutputTypeArgsSchema"

export const JrExtractionRuleIncludeSchema: z.ZodType<Prisma.JrExtractionRuleInclude> = z.object({
  jollyRoger: z.union([z.boolean(),z.lazy(() => JollyRogerArgsSchema)]).optional(),
  findReplaceRules: z.union([z.boolean(),z.lazy(() => JrFindReplaceRejectFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => JrExtractionRuleCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default JrExtractionRuleIncludeSchema;
