import { z } from 'zod';

export const ProductTypeSchema = z.enum(['PHYSICAL','DIGITAL','SERVICE','SUBSCRIPTION','BUNDLE','VARIANT','OTHER']);

export type ProductTypeType = `${z.infer<typeof ProductTypeSchema>}`

export default ProductTypeSchema;
