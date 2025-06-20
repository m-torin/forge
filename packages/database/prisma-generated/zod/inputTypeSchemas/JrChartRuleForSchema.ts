import { z } from 'zod';

export const JrChartRuleForSchema = z.enum(['AVAILABILITY','BRAND','CANONICAL_URL','DESCRIPTION','DESCRIPTION_STRING','JSON_LD','MEDIA','NAME','OFFSITE_IFRAME','PRICE','SKU','SUMMARY']);

export type JrChartRuleForType = `${z.infer<typeof JrChartRuleForSchema>}`

export default JrChartRuleForSchema;
