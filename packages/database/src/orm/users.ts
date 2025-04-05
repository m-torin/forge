import { prisma } from "../clients/node.js";
import { Prisma } from "@prisma/client";
import {
  UserCreateInputSchema,
  UserUpdateInputSchema,
  UserWhereUniqueInputSchema,
} from "../zod/index.js";
import type { User } from "../../generated/interfaces/prisma-interfaces.js";
import {
  calculatePagination,
  handleOperationError,
  validateUpsertInputs,
  withErrorHandling,
} from "./utils.js";
import type { ORMOptions, PaginationOptions, Result } from "./utils.js";
import { z } from "zod";

export interface FetchUsersArgs extends Prisma.UserFindManyArgs {
  pagination?: PaginationOptions;
}

/**
 * Fetches multiple User records based on Prisma arguments.
 * Handles pagination via `limit` and `offset`.
 * Uses `withErrorHandling` for standardized error management.
 *
 * @param args - Prisma UserFindManyArgs extended with pagination.
 * @param options - Optional ORM settings like transaction client.
 * @returns A Result object containing an array of User objects or an error.
 */
export const fetchUsers = withErrorHandling(
  async (args?: FetchUsersArgs, options?: ORMOptions): Promise<User[]> => {
    const client = options?.tx ?? prisma;
    const { pagination, ...restArgs } = args || {};
    const { skip, take } = calculatePagination(pagination);

    const queryArgs: Prisma.UserFindManyArgs = {
      ...(restArgs as Omit<Prisma.UserFindManyArgs, "skip" | "take">),
      skip,
      take,
    };

    const users = await client.user.findMany(queryArgs);
    return users;
  },
);

export interface UpsertUserArgs {
  where: Prisma.UserWhereUniqueInput;
  create: Prisma.UserCreateInput;
  update: Prisma.UserUpdateInput;
  select?: Prisma.UserSelect;
  include?: Prisma.UserInclude;
}

type UserUpsertPayload<Args extends UpsertUserArgs> = Prisma.UserGetPayload<{
  select: Args["select"];
  include: Args["include"];
}>;

/**
 * Creates or updates a User record based on provided data.
 *
 * @param args - Arguments with where, create, update data, and optional select/include.
 * @param options - Optional ORM settings like transaction client.
 * @returns A Result object containing the upserted User or an error.
 */
export const upsertUser = async <Args extends UpsertUserArgs>(
  args: Args,
  options?: ORMOptions,
): Promise<Result<User>> => {
  const whereValidation = UserWhereUniqueInputSchema.safeParse(args.where);
  if (!whereValidation.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid where clause for User upsert.",
        details: whereValidation.error.format(),
      },
      success: false,
    };
  }

  if (args.select && args.include) {
    return {
      error: {
        code: "INVALID_ARGUMENTS",
        message:
          "Cannot provide both `select` and `include` options simultaneously.",
      },
      success: false,
    };
  }

  const validationResult = validateUpsertInputs(
    args.create,
    args.update,
    UserCreateInputSchema,
    UserUpdateInputSchema,
    "User",
  );

  if (!validationResult.success) {
    return validationResult;
  }

  const createData: z.infer<typeof UserCreateInputSchema> =
    validationResult.data.createData;
  const updateData: z.infer<typeof UserUpdateInputSchema> =
    validationResult.data.updateData;

  const client = options?.tx ?? prisma;

  try {
    const prismaCreateData = createData as Prisma.UserCreateInput;
    const prismaUpdateData = updateData as Prisma.UserUpdateInput;

    const user = await client.user.upsert({
      where: args.where,
      create: prismaCreateData,
      update: prismaUpdateData,
      ...(args.select && { select: args.select }),
      ...(args.include && { include: args.include }),
    });
    return { data: user as UserUpsertPayload<Args>, success: true };
  } catch (error) {
    return handleOperationError(error);
  }
};

interface DeleteUserArgs {
  where: Prisma.UserWhereUniqueInput;
  select?: Prisma.UserSelect;
  include?: Prisma.UserInclude;
}

/**
 * Deletes a single User record based on a unique identifier.
 *
 * @param args - Arguments for the delete operation. Must include `where`.
 * @param options - Optional ORM options, including a transaction client.
 * @returns A Result object containing the deleted User object or an error.
 */
export const deleteUser = async (
  args: DeleteUserArgs,
  options?: ORMOptions,
): Promise<Result<User>> => {
  const client = options?.tx ?? prisma;

  const whereValidation = UserWhereUniqueInputSchema.safeParse(args.where);
  if (!whereValidation.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid where clause for User delete.",
        details: whereValidation.error.format(),
      },
      success: false,
    };
  }

  if (args.select && args.include) {
    return handleOperationError(
      new Error("Cannot provide both select and include"),
    );
  }

  try {
    const deletedUser = await client.user.delete({
      where: args.where,
      ...(args.select && { select: args.select }),
      ...(args.include && { include: args.include }),
    });
    return { data: deletedUser, success: true };
  } catch (error) {
    return handleOperationError(error);
  }
};
