import { z } from 'zod';

export const AddressTypeSchema = z.enum(['SHIPPING','BILLING','BOTH']);

export type AddressTypeType = `${z.infer<typeof AddressTypeSchema>}`

export default AddressTypeSchema;
