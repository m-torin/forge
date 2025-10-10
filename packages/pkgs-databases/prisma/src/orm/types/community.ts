// Import Prisma namespace for optimized tree-shaking
import type { Prisma } from '@repo/db-prisma/client';

// Article types
export type { Article } from '@repo/db-prisma/client';
export type ArticleCreateInput = Prisma.ArticleCreateInput;
export type ArticleInclude = Prisma.ArticleInclude;
export type ArticleOrderByWithRelationInput = Prisma.ArticleOrderByWithRelationInput;
export type ArticleSelect = Prisma.ArticleSelect;
export type ArticleUpdateInput = Prisma.ArticleUpdateInput;
export type ArticleWhereInput = Prisma.ArticleWhereInput;
export type ArticleWhereUniqueInput = Prisma.ArticleWhereUniqueInput;
