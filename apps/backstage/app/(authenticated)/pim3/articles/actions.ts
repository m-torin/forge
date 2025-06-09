'use server';

import { auth } from '@repo/auth/server';
import { prisma } from '@repo/database/prisma';

import type { ContentStatus } from '@repo/database/prisma';

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

  return await prisma.article.findMany({
    include: {
      media: { select: { id: true, url: true, altText: true } },
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { updatedAt: 'desc' },
    where: { deletedAt: null },
  });
}

export async function createArticle(data: ArticleData) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const existingArticle = await prisma.article.findFirst({
    where: { deletedAt: null, slug: data.slug },
  });

  if (existingArticle) {
    throw new Error('An article with this slug already exists');
  }

  return await prisma.article.create({
    data: { ...data, userId: data.userId || session.user.id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}

export async function updateArticle(id: string, data: ArticleData) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const existingArticle = await prisma.article.findFirst({
    where: { deletedAt: null, NOT: { id }, slug: data.slug },
  });

  if (existingArticle) {
    throw new Error('An article with this slug already exists');
  }

  return await prisma.article.update({
    data,
    include: { user: { select: { id: true, name: true, email: true } } },
    where: { id },
  });
}

export async function deleteArticle(id: string) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  await prisma.article.update({
    data: { deletedAt: new Date(), deletedById: session.user.id },
    where: { id },
  });
}

export async function duplicateArticle(id: string) {
  const session = await auth.api.getSession();
  if (!session) throw new Error('Unauthorized');

  const originalArticle = await prisma.article.findUnique({ where: { id } });
  if (!originalArticle) throw new Error('Article not found');

  const baseSlug = `${originalArticle.slug}-copy`;
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.article.findFirst({
      where: { deletedAt: null, slug },
    });
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return await prisma.article.create({
    data: {
      content: originalArticle.content,
      slug,
      status: 'DRAFT' as ContentStatus,
      title: `${originalArticle.title} (Copy)`,
      userId: session.user.id,
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
}
