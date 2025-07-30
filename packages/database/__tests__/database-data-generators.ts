/**
 * Database Test Data Generators - Auth Only
 *
 * Provides test data generation for authentication and user management entities.
 * Focused on the current schema which only includes auth models.
 */

import { faker } from '@faker-js/faker';

/**
 * User data generators
 * Replaces manual user creation across test files
 */
export const userGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    emailVerified: faker.datatype.boolean({ probability: 0.8 }),
    image: faker.helpers.maybe(() => faker.image.avatar(), { probability: 0.3 }),
    phoneNumber: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.5 }),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    role: 'user',
    banned: false,
    bio: faker.helpers.maybe(() => faker.person.bio(), { probability: 0.2 }),
    expertise: faker.helpers.arrayElements(['JavaScript', 'TypeScript', 'React', 'Node.js'], {
      min: 0,
      max: 3,
    }),
    isVerifiedAuthor: false,
    isSuspended: false,
    ...overrides,
  }),

  admin: (overrides = {}) =>
    userGenerators.basic({
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      ...overrides,
    }),

  testUser: (overrides = {}) =>
    userGenerators.basic({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      ...overrides,
    }),

  withProfile: (overrides = {}) =>
    userGenerators.basic({
      bio: faker.lorem.paragraph(),
      expertise: ['JavaScript', 'React'],
      isVerifiedAuthor: true,
      authorSince: faker.date.past(),
      ...overrides,
    }),

  unverified: (overrides = {}) =>
    userGenerators.basic({
      emailVerified: false,
      ...overrides,
    }),

  banned: (overrides = {}) =>
    userGenerators.basic({
      banned: true,
      banReason: 'Violation of terms of service',
      banExpires: faker.date.future(),
      ...overrides,
    }),

  suspended: (overrides = {}) =>
    userGenerators.basic({
      isSuspended: true,
      suspensionDetails: {
        reason: 'Temporary suspension',
        duration: '7 days',
        expiresAt: faker.date.future(),
      },
      ...overrides,
    }),
};

/**
 * Organization data generators
 * Standardizes organization test data creation
 */
export const organizationGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
    logo: faker.helpers.maybe(() => faker.image.url(), { probability: 0.3 }),
    description: faker.company.catchPhrase(),
    metadata: {},
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),

  testOrg: (overrides = {}) =>
    organizationGenerators.basic({
      id: 'test-org-id',
      name: 'Test Organization',
      slug: 'test-org',
      ...overrides,
    }),

  enterprise: (overrides = {}) =>
    organizationGenerators.basic({
      name: 'Enterprise Corp',
      description: 'Large enterprise organization',
      metadata: {
        industry: 'Technology',
        size: '1000+',
        founded: '2010',
      },
      ...overrides,
    }),
};

/**
 * Session data generators
 */
export const sessionGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    expiresAt: faker.date.future(),
    token: faker.string.alphanumeric(32),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    userId: faker.string.uuid(),
    activeOrganizationId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.5 }),
    ...overrides,
  }),
};

/**
 * Account data generators (OAuth/SSO)
 */
export const accountGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    accountId: faker.string.uuid(),
    providerId: faker.helpers.arrayElement(['google', 'github', 'discord']),
    userId: faker.string.uuid(),
    accessToken: faker.string.alphanumeric(64),
    refreshToken: faker.helpers.maybe(() => faker.string.alphanumeric(64), { probability: 0.7 }),
    idToken: faker.helpers.maybe(() => faker.string.alphanumeric(64), { probability: 0.5 }),
    accessTokenExpiresAt: faker.date.future(),
    refreshTokenExpiresAt: faker.helpers.maybe(() => faker.date.future(), { probability: 0.7 }),
    scope: 'read:user',
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),
};

/**
 * API Key data generators
 */
export const apiKeyGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(['Production API', 'Development API', 'Test API']),
    start: faker.string.alphanumeric(8),
    prefix: faker.string.alphanumeric(8),
    key: faker.string.alphanumeric(32),
    keyHash: faker.string.alphanumeric(64),
    userId: faker.string.uuid(),
    organizationId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.5 }),
    refillInterval: faker.helpers.maybe(() => faker.number.int({ min: 1000, max: 10000 }), {
      probability: 0.3,
    }),
    refillAmount: faker.helpers.maybe(() => faker.number.int({ min: 100, max: 1000 }), {
      probability: 0.3,
    }),
    lastRefillAt: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.3 }),
    lastUsedAt: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.5 }),
    enabled: true,
    rateLimitEnabled: true,
    rateLimitTimeWindow: faker.helpers.maybe(() => faker.number.int({ min: 60, max: 3600 }), {
      probability: 0.5,
    }),
    rateLimitMax: faker.helpers.maybe(() => faker.number.int({ min: 100, max: 10000 }), {
      probability: 0.5,
    }),
    requestCount: faker.number.int({ min: 0, max: 1000 }),
    remaining: faker.helpers.maybe(() => faker.number.int({ min: 0, max: 1000 }), {
      probability: 0.5,
    }),
    lastRequest: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.5 }),
    expiresAt: faker.helpers.maybe(() => faker.date.future(), { probability: 0.3 }),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    permissions: 'read:user,write:user',
    metadata: {},
    ...overrides,
  }),
};

/**
 * Two-Factor Authentication data generators
 */
export const twoFactorGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    secret: faker.string.alphanumeric(32),
    secretHash: faker.string.alphanumeric(64),
    enabled: faker.datatype.boolean({ probability: 0.3 }),
    verified: faker.datatype.boolean({ probability: 0.8 }),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),
};

/**
 * Backup Code data generators
 */
export const backupCodeGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    code: faker.string.alphanumeric(8).toUpperCase(),
    codeHash: faker.string.alphanumeric(64),
    userId: faker.string.uuid(),
    twoFactorId: faker.string.uuid(),
    used: false,
    usedAt: null,
    createdAt: faker.date.recent(),
    ...overrides,
  }),
};

/**
 * Passkey data generators
 */
export const passkeyGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(['iPhone', 'MacBook', 'Windows PC', 'Android']),
    userId: faker.string.uuid(),
    credentialId: faker.string.alphanumeric(32),
    publicKey: faker.string.alphanumeric(128),
    counter: faker.number.int({ min: 0, max: 1000 }),
    deviceType: faker.helpers.arrayElement(['phone', 'laptop', 'desktop', 'tablet']),
    backedUp: faker.datatype.boolean({ probability: 0.7 }),
    transports: faker.helpers.arrayElements(['usb', 'nfc', 'ble'], { min: 0, max: 3 }),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    lastUsedAt: faker.helpers.maybe(() => faker.date.recent(), { probability: 0.5 }),
    ...overrides,
  }),
};

/**
 * Audit Log data generators
 */
export const auditLogGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    type: faker.helpers.arrayElement([
      'auth.sign_in',
      'auth.sign_out',
      'user.update',
      'user.delete',
    ]),
    action: faker.helpers.arrayElement(['login', 'logout', 'profile_update', 'account_deletion']),
    userId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.8 }),
    email: faker.helpers.maybe(() => faker.internet.email(), { probability: 0.6 }),
    ipAddress: faker.internet.ip(),
    userAgent: faker.internet.userAgent(),
    metadata: {},
    success: faker.datatype.boolean({ probability: 0.9 }),
    errorMessage: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.1 }),
    timestamp: faker.date.recent(),
    ...overrides,
  }),
};

/**
 * Team data generators
 */
export const teamGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(['Engineering', 'Design', 'Marketing', 'Sales', 'Support']),
    description: faker.company.catchPhrase(),
    organizationId: faker.string.uuid(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),
};

/**
 * Team Member data generators
 */
export const teamMemberGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    teamId: faker.string.uuid(),
    role: faker.helpers.arrayElement(['member', 'admin', 'owner']),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),
};

/**
 * Invitation data generators
 */
export const invitationGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    invitedById: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.7 }),
    organizationId: faker.string.uuid(),
    role: faker.helpers.arrayElement(['member', 'admin', 'owner']),
    teamId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.3 }),
    status: faker.helpers.arrayElement(['pending', 'accepted', 'declined', 'expired']),
    expiresAt: faker.date.future(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),
};

/**
 * Verification data generators
 */
export const verificationGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    identifier: faker.internet.email(),
    value: faker.string.alphanumeric(6),
    expiresAt: faker.date.future(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),
};

/**
 * Member data generators (User-Organization relationship)
 */
export const memberGenerators = {
  basic: (overrides = {}) => ({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    organizationId: faker.string.uuid(),
    role: faker.helpers.arrayElement(['member', 'admin', 'owner']),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }),
};

/**
 * Centralized test data generator
 * Provides easy access to all generators
 */
export const testDataGenerators = {
  users: userGenerators,
  organizations: organizationGenerators,
  sessions: sessionGenerators,
  accounts: accountGenerators,
  apiKeys: apiKeyGenerators,
  twoFactor: twoFactorGenerators,
  backupCodes: backupCodeGenerators,
  passkeys: passkeyGenerators,
  auditLogs: auditLogGenerators,
  teams: teamGenerators,
  teamMembers: teamMemberGenerators,
  invitations: invitationGenerators,
  verifications: verificationGenerators,
  members: memberGenerators,
};
