import { z } from 'zod';

export const ContentStatusSchema = z.enum(['DRAFT','PUBLISHED','ARCHIVED']);

export type ContentStatusType = `${z.infer<typeof ContentStatusSchema>}`

export default ContentStatusSchema;
