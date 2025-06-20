import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { PdpUrlTypeSchema } from '../inputTypeSchemas/PdpUrlTypeSchema'

/////////////////////////////////////////
// PDP URL SCHEMA
/////////////////////////////////////////

export const PdpUrlSchema = z.object({
  urlType: PdpUrlTypeSchema,
  id: z.string().cuid(),
  name: z.string(),
  url: z.string(),
  pdpJoinId: z.string(),
  isActive: z.boolean(),
  copy: JsonValueSchema,
  createdAt: z.coerce.date(),
})

export type PdpUrl = z.infer<typeof PdpUrlSchema>

export default PdpUrlSchema;
