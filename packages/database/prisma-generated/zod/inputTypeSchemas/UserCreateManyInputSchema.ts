import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateexpertiseInputSchema } from './UserCreateexpertiseInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const UserCreateManyInputSchema: z.ZodType<Prisma.UserCreateManyInput> = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  role: z.string().optional(),
  banned: z.boolean().optional(),
  banReason: z.string().optional().nullable(),
  banExpires: z.coerce.date().optional().nullable(),
  deletedAt: z.coerce.date().optional().nullable(),
  bio: z.string().optional().nullable(),
  expertise: z.union([ z.lazy(() => UserCreateexpertiseInputSchema),z.string().array() ]).optional(),
  isVerifiedAuthor: z.boolean().optional(),
  authorSince: z.coerce.date().optional().nullable(),
  preferences: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  isSuspended: z.boolean().optional(),
  suspensionDetails: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
}).strict();

export default UserCreateManyInputSchema;
