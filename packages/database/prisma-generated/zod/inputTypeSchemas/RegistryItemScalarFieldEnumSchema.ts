import { z } from 'zod';

export const RegistryItemScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','deletedAt','deletedById','quantity','priority','notes','purchased','registryId','productId','collectionId']);

export default RegistryItemScalarFieldEnumSchema;
