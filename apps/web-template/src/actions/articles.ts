'use server';

import {
  findManyArticlesAction,
  findUniqueArticleAction,
  findFirstArticleAction,
} from '@repo/database/prisma';

// Wrapper functions that return expected format with data property
export async function getArticles(args?: any) {
  'use server';
  const articles = await findManyArticlesAction(args);
  return { data: articles };
}

export async function getArticle(id: string) {
  'use server';
  const article = await findUniqueArticleAction({ where: { id } });
  return { data: article };
}

export async function getArticleByHandle(slug: string) {
  'use server';
  const article = await findFirstArticleAction({ where: { slug } });
  return article;
}
