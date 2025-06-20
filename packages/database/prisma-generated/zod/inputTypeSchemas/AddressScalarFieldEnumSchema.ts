import { z } from 'zod';

export const AddressScalarFieldEnumSchema = z.enum(['id','userId','type','isDefault','firstName','lastName','company','phone','street1','street2','city','state','postalCode','country','isValidated','validatedAt','createdAt','updatedAt','deletedAt']);

export default AddressScalarFieldEnumSchema;
