import { ConnectionString } from 'connection-string';
import { z } from 'zod';

// Type Definitions
export interface UriRequirementProps {
  meets: boolean;
  label: string;
  tooltip: string;
  show: boolean;
}

export interface ValidationResult {
  protocol: boolean;
  hostname: boolean;
  port: boolean;
  path: boolean;
  user: boolean;
  password: boolean;
}

// Constants
export const allowedProtocols = [
  'mysql',
  'postgres',
  'mongodb',
  'redis',
  'sqlite',
  'mssql',
] as const;

export const protocolConfig: Record<
  (typeof allowedProtocols)[number],
  { placeholder: string; tooltip: string }
> = {
  mysql: {
    placeholder: 'mysql://user:password@hostname:port/database',
    tooltip: 'Format: mysql://user:password@hostname:port/database',
  },
  postgres: {
    placeholder: 'postgres://user:password@hostname:port/database',
    tooltip: 'Format: postgres://user:password@hostname:port/database',
  },
  mongodb: {
    placeholder: 'mongodb://user:password@hostname:port',
    tooltip: 'Format: mongodb://user:password@hostname:port',
  },
  redis: {
    placeholder: 'redis://user:password@hostname:port',
    tooltip: 'Format: redis://user:password@hostname:port',
  },
  sqlite: {
    placeholder: 'sqlite:///path/to/database',
    tooltip: 'Format: sqlite:///path/to/database',
  },
  mssql: {
    placeholder: 'mssql://user:password@hostname:port/database',
    tooltip: 'Format: mssql://user:password@hostname:port/database',
  },
};

// Utility Functions
export const getProtocolConfig = (protocol?: string) =>
  protocolConfig[protocol as (typeof allowedProtocols)[number]] || {
    placeholder: 'protocol://user:password@hostname:port/path',
    tooltip: 'Format: protocol://user:password@hostname:port/path',
  };

export const validateUriComponents = (
  cs: ConnectionString,
): ValidationResult => ({
  protocol:
    !!cs.protocol &&
    allowedProtocols.includes(cs.protocol as (typeof allowedProtocols)[number]),
  hostname: !!cs.hostname,
  port: cs.protocol === 'sqlite' || !!cs.port,
  path: !!cs.path && cs.path.length > 0,
  user: !!cs.user,
  password: !!cs.password,
});

export const getStrength = (details: ValidationResult): number => {
  const totalChecks = Object.keys(details).length;
  const passedChecks = Object.values(details).filter(Boolean).length;
  return (passedChecks / totalChecks) * 100;
};

export const generateErrorSummary = (
  validationResults: ValidationResult,
  cs: ConnectionString,
): string => {
  const errors: string[] = [];
  if (!validationResults.protocol)
    errors.push(
      `Invalid protocol. Allowed protocols are ${allowedProtocols.join(', ')}.`,
    );
  if (!validationResults.hostname)
    errors.push('Hostname is missing or invalid.');
  if (!validationResults.port && cs.protocol !== 'sqlite')
    errors.push('Port is missing or invalid.');
  if (!validationResults.path) errors.push('Path is missing or invalid.');
  if (!validationResults.user) errors.push('User is missing.');
  if (!validationResults.password) errors.push('Password is missing.');
  return errors.join(' ');
};

// Validation Schema using Zod
export const uriSchema = z.string().refine(
  (value) => {
    try {
      const cs = new ConnectionString(value);
      const validationResults = validateUriComponents(cs);
      const errorSummary = generateErrorSummary(validationResults, cs);
      return !errorSummary;
    } catch {
      return false;
    }
  },
  {
    message: 'Invalid URI format.',
  },
);

export const formSchema = z.object({
  uri: uriSchema,
});
