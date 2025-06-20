import type { Prisma } from '../../client';

import { z } from 'zod';
import { WorkflowConfigWhereInputSchema } from './WorkflowConfigWhereInputSchema';

export const WorkflowConfigScalarRelationFilterSchema: z.ZodType<Prisma.WorkflowConfigScalarRelationFilter> = z.object({
  is: z.lazy(() => WorkflowConfigWhereInputSchema).optional(),
  isNot: z.lazy(() => WorkflowConfigWhereInputSchema).optional()
}).strict();

export default WorkflowConfigScalarRelationFilterSchema;
