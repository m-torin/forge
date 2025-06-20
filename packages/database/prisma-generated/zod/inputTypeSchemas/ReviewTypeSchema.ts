import { z } from 'zod';

export const ReviewTypeSchema = z.enum(['IMPORTED','DEDICATED']);

export type ReviewTypeType = `${z.infer<typeof ReviewTypeSchema>}`

export default ReviewTypeSchema;
