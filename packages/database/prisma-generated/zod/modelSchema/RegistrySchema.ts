import { z } from 'zod';
import { RegistryTypeSchema } from '../inputTypeSchemas/RegistryTypeSchema'

/////////////////////////////////////////
// REGISTRY SCHEMA
/////////////////////////////////////////

export const RegistrySchema = z.object({
  type: RegistryTypeSchema,
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  isPublic: z.boolean(),
  eventDate: z.coerce.date().nullable(),
  createdByUserId: z.string().nullable(),
})

export type Registry = z.infer<typeof RegistrySchema>

export default RegistrySchema;
