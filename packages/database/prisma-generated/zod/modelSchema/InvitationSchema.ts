import { z } from 'zod';

/////////////////////////////////////////
// INVITATION SCHEMA
/////////////////////////////////////////

export const InvitationSchema = z.object({
  id: z.string(),
  email: z.string(),
  invitedById: z.string(),
  organizationId: z.string(),
  role: z.string(),
  teamId: z.string().nullable(),
  status: z.string(),
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
})

export type Invitation = z.infer<typeof InvitationSchema>

export default InvitationSchema;
