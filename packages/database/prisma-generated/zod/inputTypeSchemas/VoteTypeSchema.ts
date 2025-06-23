import { z } from 'zod';

export const VoteTypeSchema = z.enum(['HELPFUL', 'NOT_HELPFUL']);

export type VoteTypeType = `${z.infer<typeof VoteTypeSchema>}`;

export default VoteTypeSchema;
