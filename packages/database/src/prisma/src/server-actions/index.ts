// Barrel exports for database actions

// Auth & User Management Actions
export * from './userActions';

//==============================================================================
// AUTH TYPES
//==============================================================================

// User with auth context
export interface UserWithAuthContext {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  phoneNumber?: string;
  role: string;
  banned: boolean;
  banReason?: string;
  banExpires?: Date;
  deletedAt?: Date;
  bio?: string;
  expertise: string[];
  isVerifiedAuthor: boolean;
  authorSince?: Date;
  preferences?: any;
  isSuspended: boolean;
  suspensionDetails?: any;
  createdAt: Date;
  updatedAt: Date;
  // Auth relationships
  accounts: any[];
  sessions: any[];
  apiKeys: any[];
  twoFactor?: {
    id: string;
    enabled: boolean;
    verified: boolean;
    backupCodes: any[];
  };
  passkeys: any[];
}

// Organization with members
export interface OrganizationWithMembers {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt?: Date;
  members: Array<{
    id: string;
    role: string;
    createdAt: Date;
    updatedAt?: Date;
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
  }>;
  teams: Array<{
    id: string;
    name: string;
    description?: string;
    teamMembers: Array<{
      id: string;
      role: string;
      createdAt: Date;
      updatedAt: Date;
      user: {
        id: string;
        name: string;
        email: string;
        image?: string;
      };
    }>;
  }>;
  invitations: any[];
}
