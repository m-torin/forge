import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { ProductUpdateOneWithoutFavoritesNestedInputSchema } from './ProductUpdateOneWithoutFavoritesNestedInputSchema';
import { CollectionUpdateOneWithoutFavoritesNestedInputSchema } from './CollectionUpdateOneWithoutFavoritesNestedInputSchema';

export const FavoriteJoinUpdateWithoutUserInputSchema: z.ZodType<Prisma.FavoriteJoinUpdateWithoutUserInput> = z.object({
  id: z.union([ z.string().cuid(),z.lazy(() => StringFieldUpdateOperationsInputSchema) ]).optional(),
  createdAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  updatedAt: z.union([ z.coerce.date(),z.lazy(() => DateTimeFieldUpdateOperationsInputSchema) ]).optional(),
  product: z.lazy(() => ProductUpdateOneWithoutFavoritesNestedInputSchema).optional(),
  collection: z.lazy(() => CollectionUpdateOneWithoutFavoritesNestedInputSchema).optional()
}).strict();

export default FavoriteJoinUpdateWithoutUserInputSchema;
