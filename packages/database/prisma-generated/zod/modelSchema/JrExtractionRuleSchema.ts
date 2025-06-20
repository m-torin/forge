import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { JrChartRuleForSchema } from '../inputTypeSchemas/JrChartRuleForSchema'

/////////////////////////////////////////
// JR EXTRACTION RULE SCHEMA
/////////////////////////////////////////

export const JrExtractionRuleSchema = z.object({
  fieldName: JrChartRuleForSchema,
  id: z.number().int(),
  jollyRogerId: z.number().int(),
  isActive: z.boolean(),
  selectors: JsonValueSchema,
  mustContain: z.string().nullable(),
  cannotContain: z.string().nullable(),
  lastSuccessfulSelector: JsonValueSchema.nullable(),
  successRate: z.number().nullable(),
  lastTestedAt: z.coerce.date().nullable(),
  notes: z.string().nullable(),
})

export type JrExtractionRule = z.infer<typeof JrExtractionRuleSchema>

export default JrExtractionRuleSchema;
