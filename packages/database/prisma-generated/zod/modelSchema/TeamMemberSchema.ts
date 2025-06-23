import { z } from 'zod';

/////////////////////////////////////////
// TEAM MEMBER SCHEMA
/////////////////////////////////////////

export const TeamMemberSchema = z.object({
  id: z.string().cuid(),
  userId: z.string(),
  teamId: z.string(),
  role: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;

export default TeamMemberSchema;
