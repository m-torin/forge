import { z } from 'zod';
import { VoteTypeSchema } from '../inputTypeSchemas/VoteTypeSchema'

/////////////////////////////////////////
// REVIEW VOTE JOIN SCHEMA
/////////////////////////////////////////

export const ReviewVoteJoinSchema = z.object({
  voteType: VoteTypeSchema,
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userId: z.string(),
  reviewId: z.string(),
})

export type ReviewVoteJoin = z.infer<typeof ReviewVoteJoinSchema>

export default ReviewVoteJoinSchema;
