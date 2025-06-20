import { z } from 'zod';

/////////////////////////////////////////
// PASSKEY SCHEMA
/////////////////////////////////////////

export const PasskeySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  userId: z.string(),
  credentialId: z.string(),
  publicKey: z.string(),
  counter: z.number().int(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.string().array(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastUsedAt: z.coerce.date().nullable(),
})

export type Passkey = z.infer<typeof PasskeySchema>

export default PasskeySchema;
