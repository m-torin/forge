# Auth Package Migration Plan

**From**: `packages/auth` (monolithic) → **To**: `packages/auth-new` (registry-based architecture)

## Overview

This plan migrates all missing functionality from the old auth package into the new registry-based architecture while maintaining the clean client/server separation and plugin-based feature system.

## Architecture Framework

### Current Auth-New Structure
```
/src
├── client/           # Client-side only
├── server/           # Server-side only  
├── shared/           # Shared types, config, permissions
├── middleware/       # Auth middleware
└── components/       # React components
```

### Registry System
- **Feature Registry**: Enable/disable features via config
- **Plugin Registration**: Conditional Better Auth plugin registration
- **Entry Points**: Specific imports for client/server/middleware/components

## Migration Categories

## 1. MIDDLEWARE ENHANCEMENTS

### Missing Files to Migrate:
- `middleware-api.ts` → `/src/middleware/api.ts`
- `middleware.node.ts` → `/src/middleware/node.ts` 
- `middleware.ts` → `/src/middleware/web.ts`

### New Features to Add:
```typescript
// /src/shared/config.ts - Add middleware configuration
export interface AuthConfig {
  features: {
    // ... existing features
    advancedMiddleware: boolean;
    serviceToService: boolean;
    localeSupport: boolean;
  };
  middleware: {
    apiKeyHeaders?: string[];
    publicRoutes?: {
      web: string[];
      api: string[];
    };
    locales?: string[];
  };
}
```

### Implementation:
```typescript
// /src/middleware/factory.ts
export function createAdvancedMiddleware(config: AuthConfig) {
  if (config.features.advancedMiddleware) {
    return createCombinedMiddleware(config);
  }
  return createBasicMiddleware(config);
}
```

## 2. API KEY SYSTEM ENHANCEMENT

### Missing Functionality:
- Advanced API key validation with permissions
- Client-side API key helpers
- Service-to-service authentication

### Registry Integration:
```typescript
// /src/shared/config.ts - Enhance API key config
export interface AuthConfig {
  features: {
    apiKeys: boolean;
    apiKeyPermissions: boolean; // NEW
    serviceApiKeys: boolean;    // NEW
  };
  apiKeys: {
    permissionSystem: boolean;
    serviceAccounts: boolean;
    customValidation: boolean;
  };
}
```

### New Files Structure:
```
/src/server/api-keys/
├── validation.ts       # Advanced validation logic
├── permissions.ts      # Permission checking
└── service-auth.ts     # Service-to-service auth

/src/client/api-keys/
├── helpers.ts          # Client-side utilities
└── hooks.ts           # React hooks for API keys

/src/shared/api-keys/
├── types.ts           # API key types
└── permissions.ts     # Permission definitions
```

## 3. TEAM MANAGEMENT SYSTEM

### Missing Server Actions:
- `listOrganizationTeams()`
- `createOrganizationTeam()`
- `updateOrganizationTeam()`
- `removeOrganizationTeam()`
- `inviteOrganizationMember()` (with teams)
- `cancelOrganizationInvitation()`
- `removeOrganizationMember()`
- `updateOrganizationMemberRole()`

### Registry Integration:
```typescript
// /src/shared/config.ts
export interface AuthConfig {
  features: {
    organizations: boolean;
    teams: boolean;           // NEW
    advancedOrgManagement: boolean; // NEW
  };
}
```

### New Files Structure:
```
/src/server/teams/
├── actions.ts         # Team CRUD operations
├── invitations.ts     # Team invitation management
└── permissions.ts     # Team permission logic

/src/client/teams/
├── hooks.ts          # useTeams, useTeamMembers, etc.
└── methods.ts        # Client team operations

/src/shared/teams/
├── types.ts          # Team types and interfaces
└── permissions.ts    # Team permission definitions
```

## 4. ORGANIZATION HELPERS & UTILITIES

### Missing Server Utilities:
- `getCurrentOrganization()`
- `getOrganizationBySlug()`
- `checkPermission()`
- `addMember()`
- Enhanced organization management

### Registry Integration:
```typescript
// /src/server/organizations/
├── helpers.ts         # getCurrentOrganization, getBySlug
├── permissions.ts     # Advanced permission checking
├── management.ts      # Enhanced org management
└── service-accounts.ts # Service account support
```

## 5. TESTING & DEVELOPMENT INFRASTRUCTURE

### Missing Testing Tools:
- Storybook mocks and decorators
- Mock auth client
- Story integration utilities

### Registry Integration:
```typescript
// /src/shared/config.ts
export interface AuthConfig {
  features: {
    // ... existing
    developmentTools: boolean; // NEW
    storybookSupport: boolean; // NEW
  };
}
```

### New Files Structure:
```
/src/testing/
├── mocks/
│   ├── client.ts         # Mock auth client
│   ├── storybook.ts      # Storybook integration
│   └── decorators.tsx    # React decorators
├── utilities/
│   ├── test-helpers.ts   # Test utility functions
│   └── factories.ts      # Data factories
└── setup/
    ├── vitest.ts         # Vitest setup
    └── storybook.ts      # Storybook configuration
```

## 6. ENHANCED CONFIGURATION SYSTEM

### Current vs Enhanced:
```typescript
// Current: Basic feature toggles
features: {
  admin: boolean;
  apiKeys: boolean;
  // ...
}

// Enhanced: Granular feature control
features: {
  // Core features
  admin: boolean;
  apiKeys: boolean | ApiKeyConfig;
  organizations: boolean | OrganizationConfig;
  
  // Advanced features  
  teams: boolean;
  advancedMiddleware: boolean;
  serviceToService: boolean;
  developmentTools: boolean;
  
  // Feature-specific configs
  permissionSystem: boolean;
  localeSupport: boolean;
  storybookSupport: boolean;
}
```

## Implementation Phases

### Phase 1: Foundation (Week 1)
1. **Enhanced Configuration System**
   - Extend `AuthConfig` interface with new features
   - Add granular feature toggles
   - Create configuration validation

2. **Middleware Enhancement**  
   - Migrate 3 middleware implementations
   - Add API key header support
   - Implement service-to-service auth

### Phase 2: API Key System (Week 2)
1. **Advanced API Key Features**
   - Permission-based validation
   - Client-side helpers
   - Service account support

2. **Server Utilities**
   - Organization helpers
   - Permission checking
   - Enhanced server actions

### Phase 3: Team Management (Week 3)
1. **Team System Implementation**
   - Team CRUD operations
   - Team-based invitations
   - Team permission system

2. **Organization Enhancements**
   - Advanced org management
   - Slug-based lookups
   - Enhanced member management

### Phase 4: Testing & Polish (Week 4)
1. **Development Infrastructure**
   - Storybook integration
   - Testing utilities
   - Mock implementations

2. **Documentation & Migration**
   - Update documentation
   - Create migration guides
   - Performance optimization

## Plugin Architecture Integration

### Feature Plugin Pattern:
```typescript
// /src/server/plugins/teams.ts
export function createTeamsPlugin(config: AuthConfig) {
  if (!config.features.teams) return null;
  
  return {
    id: 'teams',
    actions: {
      listTeams: listOrganizationTeams,
      createTeam: createOrganizationTeam,
      // ...
    },
    middleware: createTeamsMiddleware(config),
    permissions: teamPermissions,
  };
}
```

### Client Plugin Pattern:
```typescript
// /src/client/plugins/teams.ts
export function createTeamsClientPlugin(config: AuthConfig) {
  if (!config.features.teams) return null;
  
  return {
    id: 'teams-client',
    hooks: {
      useTeams,
      useTeamMembers,
      // ...
    },
    methods: {
      createTeam,
      inviteToTeam,
      // ...
    },
  };
}
```

## Bundle Optimization Strategy

### Conditional Imports:
```typescript
// Ensure tree-shaking works properly
export const teamActions = config.features.teams 
  ? await import('./teams/actions.js')
  : null;

export const apiKeyHelpers = config.features.apiKeyPermissions
  ? await import('./api-keys/permissions.js') 
  : null;
```

### Entry Point Strategy:
```typescript
// package.json exports
"./teams": "./src/teams/index.ts",
"./api-keys": "./src/api-keys/index.ts", 
"./testing": "./src/testing/index.ts",
"./middleware/advanced": "./src/middleware/advanced.ts",
```

## Type Safety Enhancements

### Conditional Types:
```typescript
// Only expose methods when features are enabled
type AuthMethods<T extends AuthConfig> = 
  T['features']['teams'] extends true 
    ? TeamMethods & BaseMethods
    : BaseMethods;

type AuthHooks<T extends AuthConfig> =
  T['features']['teams'] extends true
    ? TeamHooks & BaseHooks  
    : BaseHooks;
```

## Migration Validation

### Pre-Migration Checklist:
- [ ] All old auth exports mapped to new structure
- [ ] Feature parity confirmed for critical functionality
- [ ] Bundle size impact measured
- [ ] Type safety validated
- [ ] Performance benchmarks run

### Post-Migration Validation:
- [ ] All apps successfully migrate
- [ ] No runtime errors in production
- [ ] Bundle sizes optimized
- [ ] Feature flags work correctly
- [ ] Development tools functional

## Success Metrics

1. **Bundle Size**: Maintain 50% reduction from old package
2. **Type Safety**: 100% TypeScript coverage, no `any` types
3. **Feature Parity**: All old functionality available in new architecture
4. **Performance**: No regression in authentication performance
5. **Developer Experience**: Improved DX with cleaner APIs

## Risk Mitigation

1. **Gradual Migration**: Implement feature by feature
2. **Feature Flags**: Use registry to enable/disable new features
3. **Rollback Plan**: Keep old package until migration complete
4. **Testing**: Comprehensive test coverage for all new features
5. **Documentation**: Clear migration guides for each feature

This plan ensures we maintain the benefits of the new architecture while restoring all functionality from the old package.