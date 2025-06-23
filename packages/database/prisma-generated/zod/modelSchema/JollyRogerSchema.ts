import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema';
import { JrChartMethodSchema } from '../inputTypeSchemas/JrChartMethodSchema';

/////////////////////////////////////////
// JOLLY ROGER SCHEMA
/////////////////////////////////////////

export const JollyRogerSchema = z.object({
  chartingMethod: JrChartMethodSchema,
  id: z.number().int(),
  canChart: z.boolean(),
  brandId: z.string().nullable(),
  sitemaps: z.string().nullable(),
  gridUrls: z.string().nullable(),
  pdpUrlPatterns: JsonValueSchema.nullable(),
});

export type JollyRoger = z.infer<typeof JollyRogerSchema>;

export default JollyRogerSchema;
