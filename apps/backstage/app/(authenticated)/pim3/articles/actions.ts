'use server';

import { auth } from '@repo/auth/server/next';
import {
  getArticlesAction,
  getArticleBySlugAction,
  createArticleAction,
  updateArticleAction,
  deleteArticleAction,
  findUniqueArticleAction,
  type ContentStatus,
} from '@repo/database/prisma';

export interface ArticleData {
  content: any;
  slug: string;
  status: ContentStatus;
  title: string;
  userId?: string;
}

export async function getArticles() {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const articles = await getArticlesAction({
    where: { deletedAt: null },
  });

  return articles;
}

export async function createArticle(data: ArticleData) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const existingArticle = await getArticleBySlugAction(data.slug);

  if (existingArticle) {
    throw new Error('An article with this slug already exists');
  }

  return await createArticleAction({
    data: {
      title: data.title,
      slug: data.slug,
      content: data.content,
      status: data.status,
      user: { connect: { id: data.userId || session.user.id } },
    },
  });
}

export async function updateArticle(id: string, data: ArticleData) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const existingArticle = await getArticleBySlugAction(data.slug);

  if (existingArticle && existingArticle.id !== id) {
    throw new Error('An article with this slug already exists');
  }

  return await updateArticleAction({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      content: data.content,
      status: data.status,
    },
  });
}

export async function deleteArticle(id: string) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  return await deleteArticleAction({ where: { id } });
}

export async function duplicateArticle(id: string) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  // First get the original article using the action
  const originalArticle = await findUniqueArticleAction({ where: { id } });

  if (!originalArticle) throw new Error('Article not found');

  const baseSlug = `${originalArticle.slug}-copy`;
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await getArticleBySlugAction(slug);
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return await createArticleAction({
    data: {
      content: originalArticle.content as any,
      slug,
      status: 'DRAFT' as ContentStatus,
      title: `${originalArticle.title} (Copy)`,
      user: { connect: { id: session.user.id } },
    },
  });
}
