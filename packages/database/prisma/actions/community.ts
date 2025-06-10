"use server";

import { unstable_cache } from "next/cache";
import {
  findManyPosts,
  findFirstPost,
  createPost,
  updatePost,
  findManyComments,
  createComment,
} from "../orm";

// TODO: Implement community actions for posts, comments, etc.
// This is a placeholder until community features are needed

export async function getLatestPosts(limit = 10) {
  "use server";
  
  const cached = unstable_cache(
    async () => {
      return findManyPosts({
        take: limit,
        orderBy: { createdAt: "desc" },
        where: { deletedAt: null },
      });
    },
    ["latest-posts"],
    {
      revalidate: 3600,
      tags: ["posts"],
    }
  );
  
  return cached();
}