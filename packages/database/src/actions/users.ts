"use server";

import { handleActionError } from "./utils.js";
import * as userORM from "../orm/users.js";
import { prisma } from "../clients/node.js";
import type { Result } from "../orm/utils.js";
import type { Prisma } from "@prisma/client";
import type { User } from "../../generated/interfaces/prisma-interfaces.js";

/**
 * Fetch users with optional filtering, pagination, and sorting.
 * Server Action: Can be called directly from client components.
 *
 * @param args - Query arguments including pagination, where, orderBy, etc.
 * @returns A Result object containing users array or error
 */
export async function fetchUsers(
  args?: userORM.FetchUsersArgs,
): Promise<Result<User[]>> {
  try {
    return await userORM.fetchUsers(args);
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Create or update a user record.
 * Server Action: Can be called directly from client components.
 * Automatically revalidates user-related cache entries.
 *
 * @param args - The upsert arguments (where, create, update, etc.)
 * @returns A Result object containing the upserted user or error
 */
export async function upsertUser<Args extends userORM.UpsertUserArgs>(
  args: Args,
): Promise<Result<User>> {
  try {
    const result = await userORM.upsertUser(args);

    // Revalidation logic removed
    if (result.success && result.data) {
      // Post-upsert logic (if any) can go here
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Delete a user record.
 * Server Action: Can be called directly from client components.
 * Automatically revalidates user-related cache entries.
 *
 * @param args - The delete arguments (where, select, include)
 * @returns A Result object containing the deleted user or error
 */
export async function deleteUser<
  Args extends Parameters<typeof userORM.deleteUser>[0],
>(args: Args): Promise<Result<User>> {
  try {
    const result = await userORM.deleteUser(args);

    // Revalidation logic removed
    if (result.success && result.data) {
      // Post-delete logic (if any) can go here
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Get a user by their ID.
 * Server Action: Can be called directly from client components.
 *
 * @param userId - The ID of the user to fetch
 * @param include - Optional related data to include
 * @returns A Result object containing the user or error
 */
export async function getUserById(
  userId: string,
  include?: { [key: string]: boolean },
): Promise<Result<User>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      ...(include && { include }),
    });

    if (!user) {
      return {
        error: {
          code: "NOT_FOUND",
          message: `User with ID ${userId} not found`,
        },
        success: false,
      };
    }

    return { data: user, success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
