import { z } from 'zod';

export const LocationTypeSchema = z.enum(['DESTINATION','LOCATION','LODGING','PLACE']);

export type LocationTypeType = `${z.infer<typeof LocationTypeSchema>}`

export default LocationTypeSchema;
