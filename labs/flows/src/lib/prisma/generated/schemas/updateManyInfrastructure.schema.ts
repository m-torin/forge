import { z } from 'zod';
import { InfrastructureUpdateManyMutationInputObjectSchema } from './objects/InfrastructureUpdateManyMutationInput.schema';
import { InfrastructureWhereInputObjectSchema } from './objects/InfrastructureWhereInput.schema';

export const InfrastructureUpdateManySchema = z.object({
  data: InfrastructureUpdateManyMutationInputObjectSchema,
  where: InfrastructureWhereInputObjectSchema.optional(),
});
