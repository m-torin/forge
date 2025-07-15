/**
 * Better Auth Type Inference
 * This file ensures we're using Better Auth's types correctly
 */

import { authClient } from '../client/client';
import { auth } from './auth';

// Infer types from the server auth instance
export type ServerSession = typeof auth.$Infer.Session;
export type ServerUser = ServerSession['user'];

// Infer types from the client auth instance
export type ClientSession = typeof authClient.$Infer.Session;
export type ClientUser = ClientSession['user'];

// Use server types as source of truth
export type Session = ServerSession;
export type User = ServerUser;

// Extended session type with organization context
export interface AuthSession {
  user: User;
  session: Session['session'];
  activeOrganizationId?: string;
}

// Response type for auth actions
export interface AuthResponse<T = any> {
  data: T | null;
  error?: string;
  success: boolean;
}
