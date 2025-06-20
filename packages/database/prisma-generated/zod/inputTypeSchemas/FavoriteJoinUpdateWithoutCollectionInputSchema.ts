import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { UserUpdateOneRequiredWithoutFavoritesNestedInputSchema } from './UserUpdateOneRequiredWithoutFavoritesNestedInputSchema';
import { ProductUpdateOneWithoutFavoritesNestedInputSchema } from './ProductUpdateOneWithoutFavoritesNestedInputSchema';

export const FavoriteJoinUpdateWithoutCollectionInputSchema: z.ZodType<Prisma.FavoriteJoinUpdateWithoutCollectionInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  user: z.lazy(() => UserUpdateOneRequiredWithoutFavoritesNestedInputSchema).optional(),
  product: z.lazy(() => ProductUpdateOneWithoutFavoritesNestedInputSchema).optional()
}).strict();

export default FavoriteJoinUpdateWithoutCollectionInputSchema;
