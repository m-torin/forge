import { z } from 'zod';

export const ProductIdentifiersScalarFieldEnumSchema = z.enum(['id','productId','pdpJoinId','collectionId','brandId','mpn','upcA','ean13','gs1128','upcE','ean8','isbn10','isbn13','asin','tcin','dpci','themoviedbId','hardcoverappId','itf14','customBarcode','customBarcodeType','primaryIdentifierField','source','verifiedAt','confidence','notes','createdAt','updatedAt']);

export default ProductIdentifiersScalarFieldEnumSchema;
