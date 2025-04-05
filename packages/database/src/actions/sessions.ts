"use server";

import { handleActionError } from "./utils.js";
import * as sessionORM from "../orm/sessions.js";
import { prisma } from "../clients/node.js";
import type { Result } from "../orm/utils.js";
import type { Prisma } from "@prisma/client";
import type { Session } from "../../generated/interfaces/prisma-interfaces.js";

/**
 * Fetch sessions with optional filtering, pagination, and sorting.
 * Server Action: Can be called directly from client components.
 *
 * @param args - Query arguments including pagination, where, orderBy, etc.
 * @returns A Result object containing sessions array or error
 */
export async function fetchSessions<
  Args extends Parameters<typeof sessionORM.fetchSessions>[0],
>(args?: Args): Promise<Result<Session[]>> {
  try {
    return await sessionORM.fetchSessions(args);
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Create or update a session record.
 * Server Action: Can be called directly from client components.
 * Automatically revalidates session-related cache entries.
 *
 * @param args - The upsert arguments (where, create, update, etc.)
 * @returns A Result object containing the upserted session or error
 */
export async function upsertSession<
  Args extends Parameters<typeof sessionORM.upsertSession>[0],
>(args: Args): Promise<Result<Session>> {
  try {
    const result = await sessionORM.upsertSession(args);

    if (result.success && result.data) {
      // Post-upsert logic can be implemented here if needed
    }

    return result;
  } catch (error) {
    return await handleActionError(error);
  }
}

/**
 * Delete a session record.
 * Server Action: Can be called directly from client components.
 * Automatically revalidates session-related cache entries.
 *
 * @param args - The delete arguments (where, select, include)
 * @returns A Result object containing the deleted session or error
 */
export async function deleteSession<
  Args extends Parameters<typeof sessionORM.deleteSession>[0],
>(args: Args): Promise<Result<Session>> {
  try {
    // Fetch session details before deletion if needed for post-delete operations
    let sessionToDelete;
    if ("id" in args.where) {
      sessionToDelete = await prisma.session.findUnique({
        where: { id: args.where.id as string },
        select: { id: true, sessionToken: true, userId: true },
      });
    }

    const result = await sessionORM.deleteSession(args);

    if (result.success) {
      // Post-delete logic can be implemented here if needed
    }

    return result;
  } catch (error) {
    return await handleActionError(error);
  }
}

/**
 * Get a session by its token.
 * Server Action: Can be called directly from client components.
 *
 * @param sessionToken - The token of the session to fetch
 * @param include - Optional related data to include
 * @returns A Result object containing the session or error
 */
export async function getSessionByToken(
  sessionToken: string,
  include?: Prisma.SessionInclude,
): Promise<Result<Session>> {
  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      ...(include && { include }),
    });

    if (!session) {
      return {
        error: {
          code: "NOT_FOUND",
          message: `Session with token "${sessionToken}" not found`,
        },
        success: false,
      };
    }

    return { data: session, success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Get sessions by user ID.
 * Server Action: Can be called directly from client components.
 *
 * @param userId - The ID of the user to fetch sessions for
 * @param include - Optional related data to include
 * @returns A Result object containing the sessions or error
 */
export async function getSessionsByUser(
  userId: string,
  include?: Prisma.SessionInclude,
): Promise<Result<Session[]>> {
  try {
    const sessions = await prisma.session.findMany({
      where: { userId },
      ...(include && { include }),
      orderBy: { expires: "desc" },
    });

    return { data: sessions, success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Update a session's expiry time.
 * Server Action: Can be called directly from client components.
 *
 * @param sessionToken - The token of the session to update
 * @param expiryDate - The new expiry date
 * @returns A Result object containing the updated session or error
 */
export async function updateSessionExpiry(
  sessionToken: string,
  expiryDate: Date,
): Promise<Result<Session>> {
  try {
    const session = await prisma.session.update({
      where: { sessionToken },
      data: { expires: expiryDate },
    });

    return { data: session, success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Check if a session is valid (exists and not expired).
 * Server Action: Can be called directly from client components.
 *
 * @param sessionToken - The token of the session to check
 * @returns A Result object containing a boolean indicating if the session is valid
 */
export async function isSessionValid(
  sessionToken: string,
): Promise<Result<boolean>> {
  try {
    const now = new Date();
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      select: { expires: true },
    });

    const isValid = session !== null && session.expires > now;
    return { data: isValid, success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Update a session.
 * Server Action: Can be called directly from client components.
 *
 * @param session - The session to update
 * @returns A Result object containing the updated session or error
 */
export async function updateSession(
  session: Session,
): Promise<Result<Session>> {
  try {
    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: session,
    });

    return { data: updatedSession, success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
