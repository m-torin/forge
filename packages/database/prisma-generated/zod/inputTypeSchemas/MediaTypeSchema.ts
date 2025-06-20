import { z } from 'zod';

export const MediaTypeSchema = z.enum(['IMAGE','VIDEO','DOCUMENT','AUDIO','MANUAL','SPECIFICATION','CERTIFICATE']);

export type MediaTypeType = `${z.infer<typeof MediaTypeSchema>}`

export default MediaTypeSchema;
