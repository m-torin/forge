import { z } from 'zod';

export const PdpUrlTypeSchema = z.enum(['CANONICAL','IFRAME','LEGACY','ALTERNATE']);

export type PdpUrlTypeType = `${z.infer<typeof PdpUrlTypeSchema>}`

export default PdpUrlTypeSchema;
