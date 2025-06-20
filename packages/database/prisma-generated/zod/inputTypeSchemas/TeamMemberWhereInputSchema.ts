import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { TeamScalarRelationFilterSchema } from './TeamScalarRelationFilterSchema';
import { TeamWhereInputSchema } from './TeamWhereInputSchema';

export const TeamMemberWhereInputSchema: z.ZodType<Prisma.TeamMemberWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TeamMemberWhereInputSchema),z.lazy(() => TeamMemberWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TeamMemberWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TeamMemberWhereInputSchema),z.lazy(() => TeamMemberWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  teamId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  team: z.union([ z.lazy(() => TeamScalarRelationFilterSchema),z.lazy(() => TeamWhereInputSchema) ]).optional(),
}).strict();

export default TeamMemberWhereInputSchema;
