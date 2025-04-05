import { Prisma } from "@prisma/client";
import { z, ZodError, ZodSchema } from "zod";

export type Result<T> =
  | { data: T; success: true }
  | { error: ErrorResponse; success: false };

export interface ErrorResponse {
  code?: string;
  details?: unknown;
  message: string;
}

export interface BaseQueryOptions {
  cursor?: Record<string, any>;
  distinct?: string | string[];
  include?: Record<string, any>;
  orderBy?: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];
  select?: Record<string, boolean>;
  where?: Record<string, any>;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export type ORMOptions = {
  tx?: Prisma.TransactionClient;
};

/**
 * Creates a successful Result object from data
 */
export function createOrmResult<T>(data: T): Result<T> {
  return {
    data,
    success: true,
  };
}

/**
 * Handles ORM errors and converts them to Result objects
 */
export function handleOrmError(error: unknown): Result<never> {
  return handleOperationError(error);
}

/**
 * Wraps an operation function with standardized error handling.
 * Catches errors, formats them into a Result<never>, and returns.
 * If the operation succeeds, returns { data: result, success: true }.
 */
export const withErrorHandling = <TArgs extends any[], TResult>(
  operation: (...args: TArgs) => Promise<TResult>,
) => {
  return async (...args: TArgs): Promise<Result<TResult>> => {
    try {
      const result = await operation(...args);
      return { data: result, success: true };
    } catch (error) {
      return handleOperationError(error);
    }
  };
};

/**
 * Centralized error handling for Prisma and other errors.
 * Identifies common Prisma errors and formats them into a standard ErrorResponse.
 */
export const handleOperationError = (error: unknown): Result<never> => {
  if (error instanceof ZodError) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Input validation failed.",
        details: error.format(),
      },
      success: false,
    };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = error;
    let code = "DATABASE_ERROR";
    let message = "An unexpected database error occurred";

    switch (prismaError.code) {
      case "P2002": // Unique constraint violation
        code = "DUPLICATE_ENTRY";
        message = `A record with this unique constraint already exists${prismaError.meta?.target ? ` on field(s): ${(prismaError.meta.target as string[]).join(", ")}` : ""}`;
        break;
      case "P2025": // Record not found
        code = "NOT_FOUND";
        message = (prismaError.meta?.cause as string) ?? "Record not found";
        break;
      case "P2003": // Foreign key constraint violation
        code = "FOREIGN_KEY_CONSTRAINT";
        message = `Foreign key constraint violation on field: ${prismaError.meta?.field_name ?? "unknown"}`;
        break;
    }

    return {
      error: {
        code,
        details: { meta: prismaError.meta, prismaCode: prismaError.code },
        message,
      },
      success: false,
    };
  }

  if (error instanceof Error) {
    return {
      error: {
        code: "APPLICATION_ERROR",
        details: error.stack,
        message: error.message,
      },
      success: false,
    };
  }

  return {
    error: {
      code: "UNKNOWN_ERROR",
      details: error,
      message: "An unexpected error occurred",
    },
    success: false,
  };
};

/**
 * Validates create and update inputs for an upsert operation using Zod schemas.
 *
 * @param createInput - The raw create data.
 * @param updateInput - The raw update data.
 * @param createSchema - The Zod schema for the create input.
 * @param updateSchema - The Zod schema for the update input.
 * @param modelName - The name of the model (for error messages).
 * @returns Either a Result object containing a validation error, or a success object
 *          containing the validated create and update data.
 */
export function validateUpsertInputs<
  CreateInputType extends z.ZodTypeAny,
  UpdateInputType extends z.ZodTypeAny,
>(
  createInput: unknown,
  updateInput: unknown,
  createSchema: CreateInputType,
  updateSchema: UpdateInputType,
  modelName: string,
): Result<{
  createData: z.infer<CreateInputType>;
  updateData: z.infer<UpdateInputType>;
}> {
  const createValidation = createSchema.safeParse(createInput);
  const updateValidation = updateSchema.safeParse(updateInput);

  if (!updateValidation.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: `Invalid update data for ${modelName}.`,
        details: updateValidation.error.format(),
      },
      success: false,
    };
  }

  if (!createValidation.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: `Invalid create data for ${modelName}.`,
        details: createValidation.error.format(),
      },
      success: false,
    };
  }

  return {
    data: {
      createData: createValidation.data,
      updateData: updateValidation.data,
    },
    success: true,
  };
}

/**
 * Calculate skip/take values from pagination options
 */
export function calculatePagination(pagination?: {
  limit?: number;
  offset?: number;
}) {
  const limit = pagination?.limit ?? 10;
  const offset = pagination?.offset ?? 0;
  return {
    skip: offset,
    take: limit,
  };
}
