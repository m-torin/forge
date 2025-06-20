import { z } from 'zod';

/////////////////////////////////////////
// TWO FACTOR SCHEMA
/////////////////////////////////////////

export const TwoFactorSchema = z.object({
  id: z.string(),
  userId: z.string(),
  secret: z.string(),
  secretHash: z.string().nullable(),
  enabled: z.boolean(),
  verified: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type TwoFactor = z.infer<typeof TwoFactorSchema>

export default TwoFactorSchema;
