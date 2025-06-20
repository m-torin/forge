import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'

/////////////////////////////////////////
// PDP JOIN SCHEMA
/////////////////////////////////////////

export const PdpJoinSchema = z.object({
  id: z.string().cuid(),
  productId: z.string(),
  brandId: z.string(),
  canonicalUrl: z.string(),
  iframeUrl: z.string().nullable(),
  tempMediaUrls: z.string().nullable(),
  lastScanned: z.coerce.date().nullable(),
  copy: JsonValueSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type PdpJoin = z.infer<typeof PdpJoinSchema>

export default PdpJoinSchema;
