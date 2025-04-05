"use server";

import { Prisma } from "@prisma/client";
import type { Result } from "../orm/utils.js";
import { prisma } from "../clients/node.js";

type TransactionPrismaClient = Prisma.TransactionClient;

interface ActionError {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Type guard to check if an error is a Prisma known request error
 */
function isPrismaKnownRequestError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

/**
 * Validates that a required parameter is not null, undefined, or empty.
 * Returns a Result object if validation fails, or null if it passes.
 *
 * @param value The value to validate
 * @param paramName The name of the parameter (for error messages)
 * @returns A Result object with error if validation fails, or the original value if successful
 */
export async function validateRequiredParam<T>(
  value: T | null | undefined,
  paramName: string,
): Promise<Result<T>> {
  if (value === null || value === undefined) {
    return {
      error: {
        code: "INVALID_ARGUMENTS",
        message: `${paramName} is required`,
      },
      success: false,
    };
  }

  // Check for empty string if it's a string
  if (typeof value === "string" && value.trim() === "") {
    return {
      error: {
        code: "INVALID_ARGUMENTS",
        message: `${paramName} cannot be empty`,
      },
      success: false,
    };
  }

  return {
    data: value,
    success: true,
  };
}

/**
 * Run operations in a transaction with proper error handling.
 * This helper simplifies working with Prisma transactions in server actions.
 *
 * @param fn Function that contains the transaction operations
 * @returns Result object with either data or error
 */
export async function runInTransaction<T>(
  fn: (tx: TransactionPrismaClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(fn);
}

/**
 * Measure execution time of an operation.
 * Useful for performance monitoring in server actions.
 */
export async function measureExecutionTime<T>(
  fn: () => Promise<T>,
  name: string,
): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const end = performance.now();
    console.log(`[${name}] Execution time: ${end - start}ms`);
  }
}

/**
 * Enhanced error handler for server actions.
 * Provides more context for debugging while keeping user-facing messages clean.
 */
export async function handleActionError(
  error: unknown,
): Promise<Result<never>> {
  console.error("Action error:", error);

  if (isPrismaKnownRequestError(error)) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.meta,
      },
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: error.message,
      },
    };
  }

  return {
    success: false,
    error: {
      code: "UNKNOWN_ERROR",
      message: "An unknown error occurred",
    },
  };
}

/**
 * Handles transaction-specific errors with appropriate error codes and messages.
 */
export async function handleTransactionError(
  error: unknown,
): Promise<Result<never>> {
  console.error("Transaction error:", error);

  if (isPrismaKnownRequestError(error)) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.meta,
      },
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: {
        code: "TRANSACTION_ERROR",
        message: error.message,
      },
    };
  }

  return {
    success: false,
    error: {
      code: "TRANSACTION_ERROR",
      message: "An unknown transaction error occurred",
    },
  };
}

/**
 * Executes a function within a database transaction.
 * Ensures that either all operations succeed or none are applied.
 * Automatically handles potential errors and returns a standardized Result object.
 *
 * @template T The expected return type of the transaction function.
 * @param fn The asynchronous function to execute within the transaction.
 *           This function receives the transaction-specific Prisma client instance.
 * @returns A Promise resolving to a Result object containing either the successful result or an error.
 */
export async function withTransaction<T>(
  fn: (tx: TransactionPrismaClient) => Promise<T>,
): Promise<Result<T>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      return await fn(tx);
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return await handleTransactionError(error);
  }
}

// All functions in this file are server actions with "use server" directive
// and can be called directly from client components
