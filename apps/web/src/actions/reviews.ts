'use server';

import {
  getReviewsAction,
  getReviewAction,
  createReviewAction,
  updateReviewAction,
  deleteReviewAction,
} from '@repo/database/prisma/server/next';

// Wrapper functions for review management
export async function getReviews(args?: any) {
  'use server';
  const result = await getReviewsAction(args);
  return result;
}

export async function getProductReviews(productId: string, args?: any) {
  'use server';
  const result = await getReviewsAction({
    productId,
    ...args,
  });
  return result;
}

export async function getReview(id: string) {
  'use server';
  const review = await getReviewAction(id);
  return review;
}

export async function createReview(data: any) {
  'use server';
  try {
    const review = await createReviewAction(data);
    return { data: review, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function updateReview(id: string, data: any) {
  'use server';
  try {
    const review = await updateReviewAction(id, data);
    return { data: review, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}

export async function deleteReview(id: string) {
  'use server';
  try {
    const result = await deleteReviewAction(id);
    return { data: result, success: true };
  } catch (error: any) {
    return { data: null, success: false, error: error.message };
  }
}
