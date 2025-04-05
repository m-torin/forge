// Generator functions related to the User schema (User, Account, Session, VerificationToken)
import type { Prisma, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { createManyRelated, buildIncludeObject } from "../testing.js";

/**
 * Generate fake user data
 */
export function fakeUser(): Prisma.UserCreateInput {
  return {
    name: `${faker.person.firstName()} ${faker.person.lastName()}`,
    email: faker.internet.email(),
    emailVerified: faker.date.recent(),
    image: faker.image.avatarGitHub(),
  };
}

/**
 * Generate fake account data
 */
export function fakeAccount(): Prisma.AccountUncheckedCreateInput {
  return {
    userId: faker.string.uuid(), // Will be overridden when creating related accounts
    type: "oauth",
    provider: faker.helpers.arrayElement(["github", "google", "discord"]),
    providerAccountId: faker.string.uuid(),
    refresh_token: faker.string.alphanumeric(40),
    access_token: faker.string.alphanumeric(40),
    expires_at: faker.number.int({ min: 1000, max: 9999 }),
    token_type: "bearer",
    scope: "user",
  };
}

/**
 * Generate fake session data
 */
export function fakeSession(): Prisma.SessionUncheckedCreateInput {
  return {
    userId: faker.string.uuid(), // Will be overridden when creating related sessions
    sessionToken: faker.string.uuid(),
    expires: faker.date.future(),
  };
}

/**
 * Generate fake verification token data
 */
export function fakeVerificationToken(): Prisma.VerificationTokenCreateInput {
  return {
    identifier: faker.internet.email(),
    token: faker.string.uuid(),
    expires: faker.date.future(),
  };
}

// Define Option Type locally
type CreateUserOptions = {
  createAccounts?: boolean;
  createSessions?: boolean;
  accountCount?: () => number;
  sessionCount?: () => number;
};

/**
 * Creates a user with optional related accounts and sessions.
 */
export async function createUserWithRelations(
  prisma: PrismaClient,
  overrides: Partial<Prisma.UserCreateInput> = {},
  options: CreateUserOptions = {},
) {
  const {
    createAccounts = true,
    createSessions = true,
    accountCount = () => faker.number.int({ min: 1, max: 2 }),
    sessionCount = () => faker.number.int({ min: 1, max: 3 }),
  } = options;

  const userData = { ...fakeUser(), ...overrides };
  // Ensure email is unique if provided in overrides, otherwise let faker generate
  if (!userData.email) {
    userData.email = faker.internet.email();
  }

  const user = await prisma.user.create({ data: userData });

  // Use helper to create accounts
  const accounts = createAccounts
    ? await createManyRelated(accountCount, () =>
        prisma.account.create({
          data: {
            ...fakeAccount(),
            userId: user.id, // Link to the user
            providerAccountId: faker.string.uuid(), // Ensure unique providerAccountId
          },
        }),
      )
    : [];

  // Use helper to create sessions
  const sessions = createSessions
    ? await createManyRelated(sessionCount, () =>
        prisma.session.create({
          data: {
            ...fakeSession(),
            userId: user.id, // Link to the user
            sessionToken: faker.string.uuid(), // Ensure unique session token
          },
        }),
      )
    : [];

  // Refetch user with relations
  const includeUser = buildIncludeObject({
    accounts: createAccounts,
    sessions: createSessions,
  });
  return prisma.user.findUnique({
    where: { id: user.id },
    include: includeUser,
  });
}

/**
 * Creates a VerificationToken entry.
 */
export async function createVerificationToken(
  prisma: PrismaClient,
  overrides: Partial<Prisma.VerificationTokenCreateInput> = {},
) {
  // Ensure identifier and token are unique if needed, or rely on DB constraints
  const data = { ...fakeVerificationToken(), ...overrides };
  if (!overrides.token) {
    data.token = faker.string.uuid(); // Ensure unique token if not provided
  }
  if (!overrides.identifier) {
    data.identifier = faker.internet.email(); // Ensure unique identifier if not provided
  }
  // Handle potential unique constraint violation if identifier+token combo exists
  try {
    return await prisma.verificationToken.create({ data });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      console.warn(
        `Verification token for ${data.identifier} might already exist. Retrying with new token/identifier might be needed.`,
      );
      // Optionally, implement retry logic or return null/throw specific error
    }
    throw e; // Re-throw other errors
  }
}
