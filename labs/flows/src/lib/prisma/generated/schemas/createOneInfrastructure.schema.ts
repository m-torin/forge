import { z } from 'zod';
import { InfrastructureSelectObjectSchema } from './objects/InfrastructureSelect.schema';
import { InfrastructureIncludeObjectSchema } from './objects/InfrastructureInclude.schema';
import { InfrastructureCreateInputObjectSchema } from './objects/InfrastructureCreateInput.schema';
import { InfrastructureUncheckedCreateInputObjectSchema } from './objects/InfrastructureUncheckedCreateInput.schema';

export const InfrastructureCreateOneSchema = z.object({
  select: InfrastructureSelectObjectSchema.optional(),
  include: InfrastructureIncludeObjectSchema.optional(),
  data: z.union([
    InfrastructureCreateInputObjectSchema,
    InfrastructureUncheckedCreateInputObjectSchema,
  ]),
});
