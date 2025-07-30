import { ModelValidationRules } from './types';

export const validationRules: ModelValidationRules = {
  // User validations
  user: {
    create: [
      {
        field: 'email',
        validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: (value: string) => `Invalid email format: ${value}`,
      },
      {
        field: 'role',
        validate: (value: string) => ['user', 'admin', 'super-admin'].includes(value),
        message: (value: string) =>
          `Invalid role: ${value}. Must be one of: user, admin, super-admin`,
      },
    ],
    update: [
      {
        field: 'email',
        validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: (value: string) => `Invalid email format: ${value}`,
      },
      {
        field: 'role',
        validate: (value: string) => ['user', 'admin', 'super-admin'].includes(value),
        message: (value: string) =>
          `Invalid role: ${value}. Must be one of: user, admin, super-admin`,
      },
    ],
  },

  // Session validations
  session: {
    create: [
      {
        field: 'expiresAt',
        validate: (value: Date) => value > new Date(),
        message: (value: Date) => `Session expiration must be in the future, got ${value}`,
      },
      {
        field: 'token',
        validate: (value: string) => value.length >= 32,
        message: (value: string) => `Token must be at least 32 characters, got ${value.length}`,
      },
    ],
    update: [
      {
        field: 'expiresAt',
        validate: (value: Date) => value > new Date(),
        message: (value: Date) => `Session expiration must be in the future, got ${value}`,
      },
    ],
  },

  // Account validations (OAuth/SSO)
  account: {
    create: [
      {
        field: 'providerId',
        validate: (value: string) => ['google', 'github', 'discord', 'credential'].includes(value),
        message: (value: string) => `Invalid provider: ${value}`,
      },
    ],
    update: [
      {
        field: 'providerId',
        validate: (value: string) => ['google', 'github', 'discord', 'credential'].includes(value),
        message: (value: string) => `Invalid provider: ${value}`,
      },
    ],
  },

  // Verification validations
  verification: {
    create: [
      {
        field: 'expiresAt',
        validate: (value: Date) => value > new Date(),
        message: (value: Date) => `Verification expiration must be in the future, got ${value}`,
      },
    ],
  },

  // Organization validations
  organization: {
    create: [
      {
        field: 'slug',
        validate: (value: string) => /^[a-z0-9-]+$/.test(value),
        message: (value: string) =>
          `Slug must contain only lowercase letters, numbers, and hyphens: ${value}`,
      },
    ],
    update: [
      {
        field: 'slug',
        validate: (value: string) => /^[a-z0-9-]+$/.test(value),
        message: (value: string) =>
          `Slug must contain only lowercase letters, numbers, and hyphens: ${value}`,
      },
    ],
  },

  // Member validations
  member: {
    create: [
      {
        field: 'role',
        validate: (value: string) => ['member', 'admin', 'owner'].includes(value),
        message: (value: string) =>
          `Invalid member role: ${value}. Must be one of: member, admin, owner`,
      },
    ],
    update: [
      {
        field: 'role',
        validate: (value: string) => ['member', 'admin', 'owner'].includes(value),
        message: (value: string) =>
          `Invalid member role: ${value}. Must be one of: member, admin, owner`,
      },
    ],
  },

  // Team validations
  team: {
    create: [
      {
        field: 'name',
        validate: (value: string) => value.length >= 1 && value.length <= 100,
        message: (value: string) =>
          `Team name must be between 1 and 100 characters, got ${value.length}`,
      },
    ],
    update: [
      {
        field: 'name',
        validate: (value: string) => value.length >= 1 && value.length <= 100,
        message: (value: string) =>
          `Team name must be between 1 and 100 characters, got ${value.length}`,
      },
    ],
  },

  // TeamMember validations
  teamMember: {
    create: [
      {
        field: 'role',
        validate: (value: string) => ['member', 'admin', 'owner'].includes(value),
        message: (value: string) =>
          `Invalid team member role: ${value}. Must be one of: member, admin, owner`,
      },
    ],
    update: [
      {
        field: 'role',
        validate: (value: string) => ['member', 'admin', 'owner'].includes(value),
        message: (value: string) =>
          `Invalid team member role: ${value}. Must be one of: member, admin, owner`,
      },
    ],
  },

  // Invitation validations
  invitation: {
    create: [
      {
        field: 'email',
        validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: (value: string) => `Invalid email format: ${value}`,
      },
      {
        field: 'role',
        validate: (value: string) => ['member', 'admin', 'owner'].includes(value),
        message: (value: string) =>
          `Invalid invitation role: ${value}. Must be one of: member, admin, owner`,
      },
      {
        field: 'status',
        validate: (value: string) => ['pending', 'accepted', 'declined', 'expired'].includes(value),
        message: (value: string) =>
          `Invalid invitation status: ${value}. Must be one of: pending, accepted, declined, expired`,
      },
      {
        field: 'expiresAt',
        validate: (value: Date) => value > new Date(),
        message: (value: Date) => `Invitation expiration must be in the future, got ${value}`,
      },
    ],
    update: [
      {
        field: 'email',
        validate: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: (value: string) => `Invalid email format: ${value}`,
      },
      {
        field: 'role',
        validate: (value: string) => ['member', 'admin', 'owner'].includes(value),
        message: (value: string) =>
          `Invalid invitation role: ${value}. Must be one of: member, admin, owner`,
      },
      {
        field: 'status',
        validate: (value: string) => ['pending', 'accepted', 'declined', 'expired'].includes(value),
        message: (value: string) =>
          `Invalid invitation status: ${value}. Must be one of: pending, accepted, declined, expired`,
      },
    ],
  },

  // ApiKey validations
  apiKey: {
    create: [
      {
        field: 'name',
        validate: (value: string) => value.length >= 1 && value.length <= 100,
        message: (value: string) =>
          `API key name must be between 1 and 100 characters, got ${value.length}`,
      },
      {
        field: 'key',
        validate: (value: string) => value.length >= 32,
        message: (value: string) => `API key must be at least 32 characters, got ${value.length}`,
      },
      {
        field: 'rateLimitMax',
        validate: (value: number | null) => value === null || value > 0,
        message: (value: number) => `Rate limit max must be positive, got ${value}`,
      },
    ],
    update: [
      {
        field: 'name',
        validate: (value: string) => value.length >= 1 && value.length <= 100,
        message: (value: string) =>
          `API key name must be between 1 and 100 characters, got ${value.length}`,
      },
      {
        field: 'rateLimitMax',
        validate: (value: number | null) => value === null || value > 0,
        message: (value: number) => `Rate limit max must be positive, got ${value}`,
      },
    ],
  },

  // TwoFactor validations
  twoFactor: {
    create: [
      {
        field: 'secret',
        validate: (value: string) => value.length >= 32,
        message: (value: string) =>
          `Two-factor secret must be at least 32 characters, got ${value.length}`,
      },
    ],
    update: [
      {
        field: 'secret',
        validate: (value: string) => value.length >= 32,
        message: (value: string) =>
          `Two-factor secret must be at least 32 characters, got ${value.length}`,
      },
    ],
  },

  // BackupCode validations
  backupCode: {
    create: [
      {
        field: 'code',
        validate: (value: string) => value.length >= 8,
        message: (value: string) =>
          `Backup code must be at least 8 characters, got ${value.length}`,
      },
      {
        field: 'codeHash',
        validate: (value: string) => value.length >= 32,
        message: (value: string) =>
          `Backup code hash must be at least 32 characters, got ${value.length}`,
      },
    ],
  },

  // Passkey validations
  passkey: {
    create: [
      {
        field: 'credentialId',
        validate: (value: string) => value.length >= 16,
        message: (value: string) =>
          `Credential ID must be at least 16 characters, got ${value.length}`,
      },
      {
        field: 'publicKey',
        validate: (value: string) => value.length >= 64,
        message: (value: string) =>
          `Public key must be at least 64 characters, got ${value.length}`,
      },
      {
        field: 'counter',
        validate: (value: number) => value >= 0,
        message: (value: number) => `Counter must be non-negative, got ${value}`,
      },
    ],
    update: [
      {
        field: 'counter',
        validate: (value: number) => value >= 0,
        message: (value: number) => `Counter must be non-negative, got ${value}`,
      },
    ],
  },

  // AuditLog validations
  auditLog: {
    create: [
      {
        field: 'type',
        validate: (value: string) => value.length >= 1 && value.length <= 100,
        message: (value: string) =>
          `Audit log type must be between 1 and 100 characters, got ${value.length}`,
      },
      {
        field: 'action',
        validate: (value: string) => value.length >= 1 && value.length <= 100,
        message: (value: string) =>
          `Audit log action must be between 1 and 100 characters, got ${value.length}`,
      },
    ],
  },
};
