import { prisma } from "../clients/node.js";
import { Prisma } from "@prisma/client";
import { withErrorHandling, calculatePagination } from "./utils.js";
import type { Result, PaginationOptions, ORMOptions } from "./utils.js";
import {
  VerificationTokenCreateInputSchema,
  VerificationTokenUpdateInputSchema,
  VerificationTokenWhereUniqueInputSchema,
} from "../zod/index.js";
import { handleOperationError, validateUpsertInputs } from "./utils.js";
import type { VerificationToken } from "../../generated/interfaces/prisma-interfaces.js";

interface FetchVerificationTokensArgs {
  pagination?: PaginationOptions;
  select?: Prisma.VerificationTokenSelect;
  // include is typically not needed for verification tokens
  where?: Prisma.VerificationTokenWhereInput;
  orderBy?:
    | Prisma.VerificationTokenOrderByWithRelationInput
    | Prisma.VerificationTokenOrderByWithRelationInput[];
  cursor?: Prisma.VerificationTokenWhereUniqueInput;
  distinct?:
    | Prisma.VerificationTokenScalarFieldEnum
    | Prisma.VerificationTokenScalarFieldEnum[];
}

export const fetchVerificationTokens = withErrorHandling(
  async (
    args?: FetchVerificationTokensArgs,
    options?: ORMOptions,
  ): Promise<VerificationToken[]> => {
    const client = options?.tx ?? prisma;
    const { pagination, ...restArgs } = args || {};
    const { skip, take } = calculatePagination(pagination);

    const queryArgs: Prisma.VerificationTokenFindManyArgs = {
      ...(restArgs as Omit<
        Prisma.VerificationTokenFindManyArgs,
        "skip" | "take"
      >),
      skip,
      take,
    };

    const tokens = await client.verificationToken.findMany(queryArgs);
    return tokens;
  },
);

// Define specific arguments for upsertVerificationToken
export interface UpsertVerificationTokenArgs {
  where: Prisma.VerificationTokenIdentifierTokenCompoundUniqueInput; // Compound key object
  create: Prisma.VerificationTokenCreateInput;
  update: Prisma.VerificationTokenUpdateInput;
  select?: Prisma.VerificationTokenSelect;
  // VerificationToken has no relations, so include is not applicable
}

/**
 * Creates or updates a VerificationToken record.
 * Uses the identifier + token compound key for uniqueness.
 * Validates input against Zod schemas.
 * Uses `withErrorHandling` for standardized error management.
 *
 * @param args - Arguments including where (compound key object), create, update data, and optional select.
 * @param options - Optional ORM settings like transaction client.
 * @returns A Result object containing the upserted VerificationToken object or an error.
 */
export const upsertVerificationToken = async (
  args: UpsertVerificationTokenArgs,
  options?: ORMOptions,
): Promise<Result<VerificationToken>> => {
  // Validate where clause first (compound key)
  const whereValidation = VerificationTokenWhereUniqueInputSchema.safeParse({
    identifier_token: args.where, // Prisma expects the key nested, Zod schema likely matches this structure
  });
  if (!whereValidation.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid where clause for VerificationToken upsert.",
        details: whereValidation.error.format(),
      },
      success: false,
    };
  }

  // Prevent providing both select and include (though include isn't useful here)
  if (args.select && (args as any).include) {
    return handleOperationError(
      new Error("Cannot provide both select and include"),
    );
  }

  // Validate create and update inputs
  const validationResult = validateUpsertInputs(
    args.create,
    args.update,
    VerificationTokenCreateInputSchema,
    VerificationTokenUpdateInputSchema,
    "VerificationToken",
  );

  if (!validationResult.success) {
    return validationResult;
  }

  const { createData, updateData } = validationResult.data;
  const client = options?.tx ?? prisma;

  try {
    // Construct the correct where clause for upsert using the compound key
    const upsertArgs: Prisma.VerificationTokenUpsertArgs = {
      where: {
        identifier_token: args.where, // Nest the compound key object
      },
      create: createData,
      update: updateData,
      ...(args.select && { select: args.select }),
      // No include needed here
    };
    const token = await client.verificationToken.upsert(upsertArgs);
    return { data: token, success: true };
  } catch (error) {
    return handleOperationError(error);
  }
};

interface DeleteVerificationTokenArgs {
  where: Prisma.VerificationTokenIdentifierTokenCompoundUniqueInput; // Compound unique identifier
  select?: Prisma.VerificationTokenSelect;
  // VerificationToken has no relations, so include is not applicable
}

/**
 * Deletes a single VerificationToken record based on the identifier and token.
 *
 * @param args - Arguments for the delete operation. Must include `where` (identifier_token).
 * @param options - Optional ORM options, including a transaction client.
 * @returns A Result object containing the deleted VerificationToken object or an error.
 */
export const deleteVerificationToken = async (
  args: DeleteVerificationTokenArgs,
  options?: ORMOptions,
): Promise<Result<VerificationToken>> => {
  const client = options?.tx ?? prisma;

  // Validate where clause first (compound key)
  const whereValidation = VerificationTokenWhereUniqueInputSchema.safeParse({
    identifier_token: args.where, // Validate the structure containing the compound key
  });
  if (!whereValidation.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid where clause for VerificationToken delete.",
        details: whereValidation.error.format(),
      },
      success: false,
    };
  }

  if (args.select && (args as any).include) {
    return handleOperationError(
      new Error("Cannot provide both select and include"),
    );
  }

  try {
    const deletedToken = await client.verificationToken.delete({
      where: {
        identifier_token: args.where,
      },
      ...(args.select && { select: args.select }),
      // No include needed here
    });
    return { data: deletedToken, success: true };
  } catch (error) {
    return handleOperationError(error);
  }
};
