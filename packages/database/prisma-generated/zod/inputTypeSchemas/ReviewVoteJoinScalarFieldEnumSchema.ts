import { z } from 'zod';

export const ReviewVoteJoinScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','voteType','userId','reviewId']);

export default ReviewVoteJoinScalarFieldEnumSchema;
