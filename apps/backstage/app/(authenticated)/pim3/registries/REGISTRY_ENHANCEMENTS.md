# Registry Management Enhancements

## Overview

Enhanced the Registry management system in PIM3 to support comprehensive create and edit operations
with user assignment functionality. The system now provides full CRUD operations for Registry
management with proper validation, user assignment capabilities, and improved UX.

## What Was Enhanced

### ✅ Previously Implemented

- Basic registry creation and editing
- Registry form validation with Zod schema
- Privacy settings management (public/private)
- Registry type selection with validation
- Server actions for CRUD operations

### 🆕 New Enhancements

#### 1. User Search and Selection Component (`UserSelect.tsx`)

- **Multi-user selection** with search functionality
- **Debounced search** for performance (300ms delay)
- **Avatar integration** with fallback to user initials
- **Badge-based selection display** with remove capability
- **Accessible design** with proper ARIA labels
- **Loading states** and error handling
- **Reusable component** for any user selection needs

**Key Features:**

- Search users by name or email
- Select multiple users with visual badges
- Debounced API calls to prevent excessive requests
- Proper loading and error states
- Accessible keyboard navigation

#### 2. Registry User Assignments Component (`RegistryUserAssignments.tsx`)

- **Role-based access control** (OWNER, EDITOR, VIEWER)
- **User management interface** with add/remove capabilities
- **Role descriptions** and visual indicators
- **Inline role editing** for existing users
- **Confirmation dialogs** for destructive actions
- **Empty state handling** for registries without users

**User Roles:**

- **OWNER**: Can edit all aspects of the registry and delete it
- **EDITOR**: Can add/remove items and edit details
- **VIEWER**: Can only view the registry

#### 3. Enhanced Registry Form Modal (`RegistryFormModal.tsx`)

- **Tabbed interface** for registry details and user management
- **Conditional user assignment tab** (only shown when editing existing registries)
- **Improved modal size** (xl) to accommodate user management
- **Better UX flow** - new registries close modal after creation, existing registries allow
  immediate user management
- **Data-testid attributes** for reliable testing
- **Form validation** with proper error handling

**Tab Structure:**

- **Registry Details**: Basic registry information (title, description, type, etc.)
- **User Access**: User assignment and role management (only for existing registries)

#### 4. Server Action Enhancements (`actions.ts`)

- **getUsersForSelect()**: Optimized user lookup for selection components
- **Search functionality** with case-insensitive matching
- **Performance optimization** with result limiting (50 users max)
- **Proper error handling** and response formatting
- **Type safety** improvements

#### 5. Enhanced Registry Details Modal

- **Integrated user assignments** using the new RegistryUserAssignments component
- **Consistent UI/UX** across view and edit modes
- **Improved code reusability** by using shared components

## Technical Implementation

### Database Schema Support

The enhancements leverage the existing Prisma schema:

```prisma
model Registry {
  // Basic fields
  id          String       @id @default(cuid())
  title       String
  description String?
  type        RegistryType @default(WISHLIST)
  isPublic    Boolean      @default(false)
  eventDate   DateTime?

  // Relations
  users       RegistryUserJoin[]
  items       RegistryItem[]
  createdByUser User?
}

model RegistryUserJoin {
  id         String           @id @default(cuid())
  role       RegistryUserRole @default(VIEWER)
  userId     String
  registryId String

  user       User             @relation(fields: [userId], references: [id])
  registry   Registry         @relation(fields: [registryId], references: [id])
}

enum RegistryType {
  WISHLIST, GIFT, WEDDING, BABY, BIRTHDAY, HOLIDAY, OTHER
}

enum RegistryUserRole {
  OWNER, EDITOR, VIEWER
}
```

### Component Architecture

```
RegistryFormModal (Enhanced)
├── Tabs Navigation
├── Registry Details Tab
│   ├── Form fields (title, description, type, etc.)
│   └── Validation & submission
└── User Access Tab (Edit only)
    └── RegistryUserAssignments
        ├── User table with roles
        ├── Add user interface
        └── UserSelect component

RegistryUserAssignments (New)
├── User table display
├── Role management
├── Add users interface
│   ├── UserSelect component
│   └── Role selection
└── User removal with confirmation

UserSelect (New)
├── Multi-select combobox
├── Search with debouncing
├── User avatar display
└── Badge-based selection
```

### Form Validation

Enhanced form validation using Zod schema:

```typescript
export const registryFormSchema = z.object({
  type: z.enum(['WISHLIST', 'GIFT', 'WEDDING', 'BABY', 'BIRTHDAY', 'HOLIDAY', 'OTHER']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  eventDate: z.date().optional(),
  isPublic: z.boolean().default(false),
});

export const registryUserRoleSchema = z.object({
  registryId: z.string(),
  userId: z.string(),
  role: z.enum(['OWNER', 'EDITOR', 'VIEWER']),
});
```

## User Experience Improvements

### 1. Workflow for New Registries

1. User clicks "Create Registry"
2. Modal opens with registry details form
3. User fills in basic information
4. User submits form → Registry created and modal closes
5. User can then edit the registry to add user assignments

### 2. Workflow for Existing Registries

1. User clicks "Edit Registry"
2. Modal opens with tabbed interface
3. **Registry Details tab**: Edit basic information
4. **User Access tab**: Manage user assignments
   - View current users and their roles
   - Add new users with role selection
   - Modify existing user roles
   - Remove users with confirmation
5. Changes are saved in real-time

### 3. User Assignment Process

1. Click "Add Users" button
2. Search and select users from dropdown
3. Choose role for selected users
4. Click "Add Users" button
5. Users are immediately added with chosen roles
6. Interface updates to show new users

## Testing

Created comprehensive test suites for new components:

### UserSelect Component Tests

- Renders with placeholder text
- Handles label prop correctly
- Respects disabled state
- Uses correct test IDs
- Handles user selection and removal

### RegistryUserAssignments Component Tests

- Displays user information correctly
- Shows/hides add user interface based on editable prop
- Renders empty state appropriately
- Handles user role display and editing
- Uses correct test IDs

## Files Modified/Created

### New Files

- `UserSelect.tsx` - Multi-user selection component
- `RegistryUserAssignments.tsx` - User assignment management
- `__tests__/UserSelect.test.tsx` - Component tests
- `__tests__/RegistryUserAssignments.test.tsx` - Component tests

### Enhanced Files

- `RegistryFormModal.tsx` - Added tabbed interface and user management
- `RegistryDetailsModal.tsx` - Integrated new user assignment component
- `actions.ts` - Added getUsersForSelect action and type fixes

## Security Considerations

1. **Rate Limiting**: User search queries are debounced to prevent excessive API calls
2. **Data Validation**: All user assignments validated with Zod schemas
3. **Authorization**: User role changes require proper permissions
4. **Input Sanitization**: All user inputs are validated before database operations

## Performance Optimizations

1. **Debounced Search**: 300ms delay prevents excessive API calls during typing
2. **Limited Results**: User search limited to 50 results to prevent performance issues
3. **Efficient Queries**: Optimized database queries with proper includes
4. **Component Memoization**: Proper React patterns to prevent unnecessary re-renders

## Future Enhancements

Potential improvements for future iterations:

1. **Bulk User Operations**: Add/remove multiple users at once
2. **User Role Templates**: Predefined role configurations
3. **User Invitation System**: Invite users who don't exist in the system
4. **Audit Trail**: Track user assignment changes
5. **Advanced Permissions**: Granular permissions beyond the three basic roles
6. **User Groups**: Assign entire user groups to registries
7. **Role Inheritance**: Hierarchical role inheritance
8. **Notification System**: Notify users when added to registries

## Usage Examples

### Creating a New Registry

```typescript
// User fills form and submits
const newRegistry = {
  title: 'Wedding Registry',
  description: 'Our dream wedding items',
  type: 'WEDDING',
  isPublic: true,
  eventDate: new Date('2024-08-15'),
};

// Registry created, users can be assigned later via edit
```

### Adding Users to Registry

```typescript
// Select users and assign roles
const userAssignments = [
  { userId: 'user1', role: 'OWNER' },
  { userId: 'user2', role: 'EDITOR' },
  { userId: 'user3', role: 'VIEWER' },
];

// Users added with appropriate permissions
```

This enhancement provides a complete registry management solution with proper user access control,
intuitive user experience, and robust error handling.
