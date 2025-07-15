import { z } from 'zod';
import { InfrastructureSelectObjectSchema } from './objects/InfrastructureSelect.schema';
import { InfrastructureIncludeObjectSchema } from './objects/InfrastructureInclude.schema';
import { InfrastructureWhereUniqueInputObjectSchema } from './objects/InfrastructureWhereUniqueInput.schema';

export const InfrastructureDeleteOneSchema = z.object({
  select: InfrastructureSelectObjectSchema.optional(),
  include: InfrastructureIncludeObjectSchema.optional(),
  where: InfrastructureWhereUniqueInputObjectSchema,
});
