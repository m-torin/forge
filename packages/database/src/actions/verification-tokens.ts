"use server";

import { handleActionError } from "./utils.js";
import * as verificationTokenORM from "../orm/verification-tokens.js";
import { prisma } from "../clients/node.js";
import type { Result } from "../orm/utils.js";
import type { Prisma } from "@prisma/client";
import type { VerificationToken } from "../../generated/interfaces/prisma-interfaces.js";

/**
 * Fetch verification tokens with optional filtering, pagination, and sorting.
 * Server Action: Can be called directly from client components.
 *
 * @param args - Query arguments including pagination, where, orderBy, etc.
 * @returns A Result object containing verification tokens array or error
 */
export async function fetchVerificationTokens<
  Args extends Parameters<
    typeof verificationTokenORM.fetchVerificationTokens
  >[0],
>(args?: Args): Promise<Result<VerificationToken[]>> {
  try {
    return await verificationTokenORM.fetchVerificationTokens(args);
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Create or update a verification token record.
 * Server Action: Can be called directly from client components.
 * Automatically revalidates verification token-related cache entries.
 *
 * @param args - The upsert arguments (where, create, update, etc.)
 * @returns A Result object containing the upserted verification token or error
 */
export async function upsertVerificationToken(
  args: verificationTokenORM.UpsertVerificationTokenArgs,
): Promise<Result<VerificationToken>> {
  try {
    const result = await verificationTokenORM.upsertVerificationToken(args);

    if (result.success && result.data) {
      // Post-upsert logic (if any) can go here
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Delete a verification token record.
 * Server Action: Can be called directly from client components.
 * Automatically revalidates verification token-related cache entries.
 *
 * @param args - The delete arguments (where, select)
 * @returns A Result object containing the deleted verification token or error
 */
export async function deleteVerificationToken<
  Args extends Parameters<
    typeof verificationTokenORM.deleteVerificationToken
  >[0],
>(args: Args): Promise<Result<VerificationToken>> {
  try {
    // Now delete the verification token
    const result = await verificationTokenORM.deleteVerificationToken(args);

    if (result.success) {
      // Post-delete logic (if any) can go here
    }

    return result;
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Get a verification token by identifier and token.
 * Server Action: Can be called directly from client components.
 *
 * @param identifier - The identifier (usually email or user ID)
 * @param token - The token string
 * @returns A Result object containing the verification token or error
 */
export async function getVerificationToken(
  identifier: string,
  token: string,
): Promise<Result<VerificationToken>> {
  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier,
          token,
        },
      },
    });

    if (!verificationToken) {
      return {
        error: {
          code: "NOT_FOUND",
          message: `Verification token not found for "${identifier}"`,
        },
        success: false,
      };
    }

    return { data: verificationToken, success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Find all verification tokens for a specific identifier.
 * Server Action: Can be called directly from client components.
 *
 * @param identifier - The identifier to fetch tokens for (email or user ID)
 * @returns A Result object containing verification tokens or error
 */
export async function getVerificationTokensByIdentifier(
  identifier: string,
): Promise<Result<VerificationToken[]>> {
  try {
    const tokens = await prisma.verificationToken.findMany({
      where: { identifier },
    });

    return { data: tokens, success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Check if a verification token is valid (exists and not expired).
 * Server Action: Can be called directly from client components.
 *
 * @param identifier - The identifier (usually email or user ID)
 * @param token - The token string
 * @returns A Result object containing a boolean indicating if the token is valid
 */
export async function isVerificationTokenValid(
  identifier: string,
  token: string,
): Promise<Result<boolean>> {
  try {
    const now = new Date();
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        identifier_token: { identifier, token },
      },
    });

    // Token is valid if it exists and has not expired
    const isValid =
      verificationToken !== null && verificationToken.expires > now;

    return { data: isValid, success: true };
  } catch (error) {
    return handleActionError(error);
  }
}

/**
 * Create a new verification token with the given expiry time.
 * Server Action: Can be called directly from client components.
 *
 * @param identifier - The identifier (usually email or user ID)
 * @param expiryMinutes - Number of minutes until token expires (default: 24 hours)
 * @returns A Result object containing the created token or error
 */
export async function createVerificationToken(
  identifier: string,
  expiryMinutes: number = 1440, // 24 hours default
): Promise<Result<VerificationToken>> {
  try {
    // Generate a random token
    const token = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 36).toString(36),
    ).join("");

    // Calculate expiry date
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + expiryMinutes);

    // Create the token
    const verificationToken = await prisma.verificationToken.create({
      data: {
        identifier,
        token,
        expires,
      },
    });

    return { data: verificationToken, success: true };
  } catch (error) {
    return handleActionError(error);
  }
}
