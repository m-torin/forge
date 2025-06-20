import { z } from 'zod';

export const BarcodeTypeSchema = z.enum(['UPC_A','UPC_E','EAN_13','EAN_8','CODE_128','CODE_39','QR_CODE','PDF417','AZTEC','DATA_MATRIX','ITF14','CODABAR','OTHER']);

export type BarcodeTypeType = `${z.infer<typeof BarcodeTypeSchema>}`

export default BarcodeTypeSchema;
