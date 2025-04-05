import { prisma } from "../clients/node.js";
import { type Prisma } from "@prisma/client";
import {
  withErrorHandling,
  calculatePagination,
  handleOperationError,
} from "./utils.js";
import type { Result, PaginationOptions, ORMOptions } from "./utils.js";
import {
  SessionCreateInputSchema,
  SessionUpdateInputSchema,
  SessionWhereUniqueInputSchema,
} from "../zod/index.js";
import type { Session } from "../../generated/interfaces/prisma-interfaces.js";

interface FetchSessionsArgs {
  pagination?: PaginationOptions;
  select?: Prisma.SessionSelect;
  include?: Prisma.SessionInclude;
  where?: Prisma.SessionWhereInput;
  orderBy?:
    | Prisma.SessionOrderByWithRelationInput
    | Prisma.SessionOrderByWithRelationInput[];
  cursor?: Prisma.SessionWhereUniqueInput;
  distinct?: Prisma.SessionScalarFieldEnum | Prisma.SessionScalarFieldEnum[];
}

export const fetchSessions = withErrorHandling(
  async (
    args?: FetchSessionsArgs,
    options?: ORMOptions,
  ): Promise<Session[]> => {
    const client = options?.tx ?? prisma;
    const { pagination, ...restArgs } = args || {};
    const { skip, take } = calculatePagination(pagination);

    const queryArgs: Prisma.SessionFindManyArgs = {
      ...(restArgs as Omit<Prisma.SessionFindManyArgs, "skip" | "take">),
      skip,
      take,
    };

    const sessions = await client.session.findMany(queryArgs);
    return sessions;
  },
);

export interface UpsertSessionArgs {
  where: Prisma.SessionWhereUniqueInput;
  create: Prisma.SessionCreateInput;
  update: Prisma.SessionUpdateInput;
  select?: Prisma.SessionSelect;
  include?: Prisma.SessionInclude;
}

/**
 * Creates or updates a Session record.
 * Uses the unique sessionToken for the where clause.
 * Validates input against Zod schemas.
 * Uses `withErrorHandling` for standardized error management.
 *
 * @param args - Arguments including where ({ sessionToken }), create, update data, and optional select/include.
 * @param options - Optional ORM settings like transaction client.
 * @returns A Result object containing the upserted Session object or an error.
 */
export const upsertSession = async (
  args: UpsertSessionArgs,
  options?: ORMOptions,
): Promise<Result<Session>> => {
  const whereValidation = SessionWhereUniqueInputSchema.safeParse(args.where);
  if (!whereValidation.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid where clause for Session upsert.",
        details: whereValidation.error.format(),
      },
      success: false,
    };
  }

  if (args.select && args.include) {
    return handleOperationError(
      new Error(
        "Cannot provide both select and include. Code: INVALID_ARGUMENTS",
      ),
    );
  }

  const createValidation = SessionCreateInputSchema.safeParse(args.create);
  if (!createValidation.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid create data for Session.",
        details: createValidation.error.format(),
      },
      success: false,
    };
  }
  const updateValidation = SessionUpdateInputSchema.safeParse(args.update);
  if (!updateValidation.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid update data for Session.",
        details: updateValidation.error.format(),
      },
      success: false,
    };
  }

  const client = options?.tx ?? prisma;

  try {
    const upsertArgs: Prisma.SessionUpsertArgs = {
      where: args.where,
      create: args.create,
      update: args.update,
      ...(args.select && { select: args.select }),
      ...(args.include && { include: args.include }),
    };
    const session = await client.session.upsert(upsertArgs);
    return { data: session, success: true };
  } catch (error) {
    return handleOperationError(error);
  }
};

interface DeleteSessionArgs {
  where: Prisma.SessionWhereUniqueInput; // Unique identifier (e.g., { id } or { sessionToken })
  select?: Prisma.SessionSelect;
  include?: Prisma.SessionInclude;
}

/**
 * Deletes a single Session record based on a unique identifier.
 *
 * @param args - Arguments for the delete operation. Must include `where`.
 * @param options - Optional ORM options, including a transaction client.
 * @returns A Result object containing the deleted Session object or an error.
 */
export const deleteSession = async (
  args: DeleteSessionArgs,
  options?: ORMOptions,
): Promise<Result<Session>> => {
  const client = options?.tx ?? prisma;

  const whereValidation = SessionWhereUniqueInputSchema.safeParse(args.where);
  if (!whereValidation.success) {
    return {
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid where clause for Session delete.",
        details: whereValidation.error.format(),
      },
      success: false,
    };
  }

  if (args.select && args.include) {
    return handleOperationError(
      new Error(
        "Cannot provide both select and include. Code: INVALID_ARGUMENTS",
      ),
    );
  }

  try {
    const deletedSession = await client.session.delete({
      where: args.where,
      ...(args.select && { select: args.select }),
      ...(args.include && { include: args.include }),
    });
    return { data: deletedSession, success: true };
  } catch (error) {
    return handleOperationError(error);
  }
};
