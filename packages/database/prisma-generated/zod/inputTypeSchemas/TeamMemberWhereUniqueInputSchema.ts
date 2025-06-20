import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberUserIdTeamIdCompoundUniqueInputSchema } from './TeamMemberUserIdTeamIdCompoundUniqueInputSchema';
import { TeamMemberWhereInputSchema } from './TeamMemberWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { TeamScalarRelationFilterSchema } from './TeamScalarRelationFilterSchema';
import { TeamWhereInputSchema } from './TeamWhereInputSchema';

export const TeamMemberWhereUniqueInputSchema: z.ZodType<Prisma.TeamMemberWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    userId_teamId: z.lazy(() => TeamMemberUserIdTeamIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    userId_teamId: z.lazy(() => TeamMemberUserIdTeamIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  userId_teamId: z.lazy(() => TeamMemberUserIdTeamIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => TeamMemberWhereInputSchema),z.lazy(() => TeamMemberWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TeamMemberWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TeamMemberWhereInputSchema),z.lazy(() => TeamMemberWhereInputSchema).array() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  teamId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  role: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  team: z.union([ z.lazy(() => TeamScalarRelationFilterSchema),z.lazy(() => TeamWhereInputSchema) ]).optional(),
}).strict());

export default TeamMemberWhereUniqueInputSchema;
