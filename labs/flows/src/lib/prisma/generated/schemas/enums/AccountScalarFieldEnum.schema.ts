import { z } from 'zod';

export const AccountScalarFieldEnumSchema = z.enum([
  'access_token',
  'expires_at',
  'id',
  'id_token',
  'oauth_token',
  'oauth_token_secret',
  'provider',
  'providerAccountId',
  'refresh_token',
  'refresh_token_expires_in',
  'scope',
  'session_state',
  'token_type',
  'type',
  'userId',
]);
