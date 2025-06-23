import { z } from 'zod';
import { JrRuleActionSchema } from '../inputTypeSchemas/JrRuleActionSchema';

/////////////////////////////////////////
// JR FIND REPLACE REJECT SCHEMA
/////////////////////////////////////////

export const JrFindReplaceRejectSchema = z.object({
  ruleAction: JrRuleActionSchema,
  id: z.number().int(),
  lookFor: z.string(),
  replaceWith: z.string().nullable(),
  isRegex: z.boolean(),
  regexFlags: z.string().nullable(),
  priority: z.number().int(),
});

export type JrFindReplaceReject = z.infer<typeof JrFindReplaceRejectSchema>;

export default JrFindReplaceRejectSchema;
