import { z } from 'zod';

export const BrandTypeSchema = z.enum(['LABEL','RETAILER','MARKETPLACE','OTHER']);

export type BrandTypeType = `${z.infer<typeof BrandTypeSchema>}`

export default BrandTypeSchema;
