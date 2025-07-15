import { z } from 'zod';
import { InfrastructureWhereInputObjectSchema } from './objects/InfrastructureWhereInput.schema';

export const InfrastructureDeleteManySchema = z.object({
  where: InfrastructureWhereInputObjectSchema.optional(),
});
