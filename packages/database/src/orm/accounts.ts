import { prisma } from "../clients/node.js";
import type { Prisma } from "@prisma/client";
import type { Result, PaginationOptions, ORMOptions } from "./utils.js";
import {
  withErrorHandling,
  calculatePagination,
  handleOperationError,
} from "./utils.js";
import {
  AccountCreateInputSchema,
  AccountUpdateInputSchema,
  AccountWhereUniqueInputSchema,
} from "../zod/index.js";
import { z } from "zod";
import type { Account } from "../../generated/interfaces/prisma-interfaces.js";

// Define specific arguments
export interface FetchAccountsArgs extends Prisma.AccountFindManyArgs {
  pagination?: PaginationOptions;
}

export const fetchAccounts = withErrorHandling(
  async (
    args?: FetchAccountsArgs,
    options?: ORMOptions,
  ): Promise<Account[]> => {
    const client = options?.tx ?? prisma;
    const { pagination, ...restArgs } = args || {};
    const { skip, take } = calculatePagination(pagination);

    const queryArgs: Prisma.AccountFindManyArgs = {
      ...(restArgs as Omit<Prisma.AccountFindManyArgs, "skip" | "take">),
      skip,
      take,
    };

    const accounts = await client.account.findMany(queryArgs);
    return accounts;
  },
);

// Define specific arguments for upsertAccount using Prisma namespace types
// Use the compound unique input type for the *value* of where
export interface UpsertAccountArgs {
  where: Prisma.AccountProviderProviderAccountIdCompoundUniqueInput; // Use Prisma namespace type
  create: Prisma.AccountCreateInput; // Use Prisma namespace type
  update: Prisma.AccountUpdateInput; // Use Prisma namespace type
  select?: Prisma.AccountSelect;
  include?: Prisma.AccountInclude;
}

// Define a specific Zod schema for the structure expected by args.where
const AccountProviderProviderAccountIdSchema = z.object({
  provider: z.string(),
  providerAccountId: z.string(),
});

/**
 * Creates or updates an Account record.
 * Uses the provider + providerAccountId compound key for uniqueness.
 * Validates input against Zod schemas.
 * Uses `withErrorHandling` for standardized error management.
 *
 * @param args - Arguments including where (compound key object), create, update data, and optional select/include.
 * @param options - Optional ORM settings like transaction client.
 * @returns A Result object containing the upserted Account object or an error.
 */
export const upsertAccount = async (
  args: UpsertAccountArgs,
  options?: ORMOptions,
): Promise<Result<Account>> => {
  // Prevent providing both select and include
  if (args.select && args.include) {
    // Pass only the error object to handleOperationError
    return handleOperationError(
      new Error(
        "Cannot provide both select and include. Code: INVALID_ARGUMENTS",
      ),
    );
  }

  // 1. Validate Where Clause Value
  const whereValidation = AccountProviderProviderAccountIdSchema.safeParse(
    args.where,
  );
  if (!whereValidation.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message:
          "Invalid where clause value (provider/providerAccountId) for Account upsert.",
        details: whereValidation.error.format(),
      },
      success: false,
    };
  }
  // whereValidation.data now holds the validated { provider, providerAccountId } object

  // 2. Validate Create Data (Scalar fields)
  const createValidation = AccountCreateInputSchema.safeParse(args.create);
  if (!createValidation.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid create data for Account.",
        details: createValidation.error.format(),
      },
      success: false,
    };
  }
  // Don't use validatedCreateData for the actual upsert call's create field
  // We pass the original args.create which includes potential relations

  // 3. Validate Update Data (Scalar fields)
  const updateValidation = AccountUpdateInputSchema.safeParse(args.update);
  if (!updateValidation.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid update data for Account.",
        details: updateValidation.error.format(),
      },
      success: false,
    };
  }
  // Don't use validatedUpdateData for the actual upsert call's update field

  const client = options?.tx ?? prisma;

  try {
    const upsertArgs: Prisma.AccountUpsertArgs = {
      where: {
        // Use the validated where value structure required by Prisma
        provider_providerAccountId: whereValidation.data,
      },
      // Pass the original args, relying on TS/Prisma for full type correctness including relations
      create: args.create,
      update: args.update,
      ...(args.select && { select: args.select }),
      ...(args.include && { include: args.include }),
    };
    const account = await client.account.upsert(upsertArgs);
    return { data: account, success: true };
  } catch (error) {
    return handleOperationError(error);
  }
};

interface DeleteAccountArgs {
  where: Prisma.AccountProviderProviderAccountIdCompoundUniqueInput; // Unique identifier
  select?: Prisma.AccountSelect;
  include?: Prisma.AccountInclude;
}

/**
 * Deletes a single Account record based on the provider and providerAccountId.
 *
 * @param args - Arguments for the delete operation. Must include `where` (provider_providerAccountId).
 * @param options - Optional ORM options, including a transaction client.
 * @returns A Result object containing the deleted Account object or an error.
 */
export const deleteAccount = async (
  args: DeleteAccountArgs,
  options?: ORMOptions,
): Promise<Result<Account>> => {
  const client = options?.tx ?? prisma;

  // 1. Validate Select/Include
  if (args.select && args.include) {
    // Pass only the error object
    return handleOperationError(
      new Error(
        "Cannot provide both select and include. Code: INVALID_ARGUMENTS",
      ),
    );
  }

  // 2. Validate Where Clause value
  const whereValidation = AccountProviderProviderAccountIdSchema.safeParse(
    args.where,
  );
  if (!whereValidation.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message:
          "Invalid where clause value (provider/providerAccountId) for Account delete.",
        details: whereValidation.error.format(),
      },
      success: false,
    };
  }

  try {
    const deletedAccount = await client.account.delete({
      where: {
        // Use the validated where value structure required by Prisma
        provider_providerAccountId: whereValidation.data,
      },
      ...(args.select && { select: args.select }),
      ...(args.include && { include: args.include }),
    });
    return { data: deletedAccount, success: true };
  } catch (error) {
    return handleOperationError(error);
  }
};
