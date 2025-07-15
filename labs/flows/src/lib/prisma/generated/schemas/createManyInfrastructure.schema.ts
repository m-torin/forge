import { z } from 'zod';
import { InfrastructureCreateManyInputObjectSchema } from './objects/InfrastructureCreateManyInput.schema';

export const InfrastructureCreateManySchema = z.object({
  data: z.union([
    InfrastructureCreateManyInputObjectSchema,
    z.array(InfrastructureCreateManyInputObjectSchema),
  ]),
  skipDuplicates: z.boolean().optional(),
});
