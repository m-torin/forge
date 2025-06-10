"use server";

import { unstable_cache } from "next/cache";
import {
  findFirstUser,
  findManyUsers,
  updateUser,
  createUser,
} from "../orm";

// Server action to get user by ID
export async function getUserById(userId: string) {
  "use server";

  const cached = unstable_cache(
    async () => {
      const user = await findFirstUser({
        where: {
          id: userId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    },
    [`user-${userId}`],
    {
      revalidate: 3600,
      tags: [`user-${userId}`, "users"],
    },
  );

  return cached();
}

// Server action to update user profile
export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    image?: string;
  },
) {
  "use server";

  const updatedUser = await updateUser({
    where: { id: userId },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  return updatedUser;
}