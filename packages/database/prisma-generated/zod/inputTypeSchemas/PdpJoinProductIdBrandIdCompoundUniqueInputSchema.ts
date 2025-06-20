import type { Prisma } from '../../client';

import { z } from 'zod';

export const PdpJoinProductIdBrandIdCompoundUniqueInputSchema: z.ZodType<Prisma.PdpJoinProductIdBrandIdCompoundUniqueInput> = z.object({
  productId: z.string(),
  brandId: z.string()
}).strict();

export default PdpJoinProductIdBrandIdCompoundUniqueInputSchema;
