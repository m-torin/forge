import { z } from 'zod';

export const JrRuleActionSchema = z.enum(['MATCH_ON', 'REJECT_ON', 'REPLACE']);

export type JrRuleActionType = `${z.infer<typeof JrRuleActionSchema>}`;

export default JrRuleActionSchema;
