import { z } from 'zod';

export const ProductStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED', 'DISCONTINUED']);

export type ProductStatusType = `${z.infer<typeof ProductStatusSchema>}`;

export default ProductStatusSchema;
