/**
 * Example type testing for Vitest
 * This demonstrates how to use the type testing utilities
 */

import { describe } from 'vitest';
import {
  commonTypePatterns,
  typeTestHelpers,
  typeTestingHelpers,
  typeTestPatterns,
  typeTestUtils,
} from '../setup/type-testing';
import { expectTypeOf } from '../utils/type-testing';

// Example types to test
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  isActive: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

type UserResponse = ApiResponse<User>;

interface ServerAction<T = any> {
  (data: FormData): Promise<{ success: boolean; data: T; error?: string }>;
}

// Example React component props
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  className?: string;
  'data-testid'?: string;
}

// Example database model
interface DatabaseUser {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

describe('type Testing Examples', () => {
  describe('basic Type Testing', () => {
    test('should verify user type structure', () => {
      const user = typeTestingHelpers.mockInterface<User>();

      // Test required properties
      expectTypeOf(user).toHaveProperty('id');
      expectTypeOf(user).toHaveProperty('name');
      expectTypeOf(user).toHaveProperty('email');
      expectTypeOf(user).toHaveProperty('isActive');

      // Test optional properties
      expectTypeOf(user).toHaveProperty('age');
      expectTypeOf(user.age).toEqualTypeOf<number | undefined>();

      // Test property types
      expectTypeOf(user.id).toBeString();
      expectTypeOf(user.name).toBeString();
      expectTypeOf(user.email).toBeString();
      expectTypeOf(user.isActive).toBeBoolean();
    });

    test('should verify API response type structure', () => {
      const response = typeTestingHelpers.mockInterface<UserResponse>();

      // Test API response pattern
      const apiTest = typeTestPatterns.apiResponse(response);
      apiTest.hasSuccess();
      apiTest.hasData();
      apiTest.hasError();

      // Test data type
      expectTypeOf(response.data).toEqualTypeOf<User>();

      // Test error type
      expectTypeOf(response.error).toEqualTypeOf<string | null>();
    });

    test('should verify server action type', () => {
      const action = typeTestingHelpers.mockFunction<ServerAction<User>>();

      // Test server action pattern
      const actionTest = typeTestPatterns.serverAction(action);
      actionTest.isAsync();
      actionTest.acceptsFormData();
      actionTest.returnsActionResult<{ success: boolean; data: User; error?: string }>();
    });

    test('should verify React component props', () => {
      const Button = typeTestingHelpers.mockFunction<React.FC<ButtonProps>>();

      // Test React component pattern
      const componentTest = typeTestPatterns.reactComponent(Button);
      componentTest.acceptsProps<ButtonProps>();
      componentTest.hasChildren();
      componentTest.hasClassName();
      componentTest.hasTestId();
    });

    test('should verify database model structure', () => {
      const model = typeTestingHelpers.mockInterface<DatabaseUser>();

      // Test database model pattern
      const modelTest = typeTestPatterns.databaseModel(model);
      modelTest.hasId();
      modelTest.hasCreatedAt();
      modelTest.hasUpdatedAt();
      modelTest.hasTimestamps();
      modelTest.hasSoftDelete();
    });
  });

  describe('advanced Type Testing', () => {
    test('should test utility types', () => {
      // Test Partial utility type
      const partialUser = typeTestingHelpers.mockPartial<Partial<User>>({
        name: 'John',
      });

      expectTypeOf(partialUser).toMatchTypeOf<Partial<User>>();
      expectTypeOf(partialUser.name).toEqualTypeOf<string | undefined>();

      // Test Required utility type
      const requiredUser = typeTestingHelpers.mockRequired<Required<User>>({
        id: '1',
        name: 'John',
        email: 'john@example.com',
        age: 25,
        isActive: true,
      });

      expectTypeOf(requiredUser).toMatchTypeOf<Required<User>>();
      expectTypeOf(requiredUser.age).toEqualTypeOf<number>();

      // Test Pick utility type
      const pickedUser = typeTestingHelpers.mockPick<User, 'id' | 'name'>({
        id: '1',
        name: 'John',
      });

      expectTypeOf(pickedUser).toMatchTypeOf<Pick<User, 'id' | 'name'>>();
      expectTypeOf(pickedUser).not.toHaveProperty('email');

      // Test Omit utility type
      const omittedUser = typeTestingHelpers.mockOmit<User, 'id'>({
        name: 'John',
        email: 'john@example.com',
        isActive: true,
      });

      expectTypeOf(omittedUser).toMatchTypeOf<Omit<User, 'id'>>();
      expectTypeOf(omittedUser).not.toHaveProperty('id');
    });

    test('should test generic types', () => {
      // Test generic API response
      type StringResponse = ApiResponse<string>;
      type NumberResponse = ApiResponse<number>;
      type UserArrayResponse = ApiResponse<User[]>;

      const stringResponse = typeTestingHelpers.mockInterface<StringResponse>();
      const numberResponse = typeTestingHelpers.mockInterface<NumberResponse>();
      const userArrayResponse = typeTestingHelpers.mockInterface<UserArrayResponse>();

      expectTypeOf(stringResponse.data).toBeString();
      expectTypeOf(numberResponse.data).toBeNumber();
      expectTypeOf(userArrayResponse.data).toEqualTypeOf<User[]>();
    });

    test('should test conditional types', () => {
      // Example conditional type
      type IsArray<T> = T extends any[] ? true : false;

      type StringIsArray = IsArray<string>;
      type NumberArrayIsArray = IsArray<number[]>;

      expectTypeOf<StringIsArray>().toEqualTypeOf<false>();
      expectTypeOf<NumberArrayIsArray>().toEqualTypeOf<true>();
    });

    test('should test mapped types', () => {
      // Example mapped type
      type Readonly<T> = {
        readonly [P in keyof T]: T[P];
      };

      type ReadonlyUser = Readonly<User>;

      const readonlyUser = typeTestingHelpers.mockReadonly<ReadonlyUser>({
        id: '1',
        name: 'John',
        email: 'john@example.com',
        isActive: true,
      });

      expectTypeOf(readonlyUser).toMatchTypeOf<ReadonlyUser>();
      expectTypeOf(readonlyUser.name).toBeString();
    });

    test('should test union and intersection types', () => {
      // Union type
      type StringOrNumber = string | number;

      const unionValue = typeTestingHelpers.mockUnion<StringOrNumber>();
      expectTypeOf(unionValue).toEqualTypeOf<string | number>();

      // Intersection type
      type UserWithTimestamps = User & {
        createdAt: Date;
        updatedAt: Date;
      };

      const intersectionValue = typeTestingHelpers.mockIntersection<UserWithTimestamps>();
      expectTypeOf(intersectionValue).toMatchTypeOf<UserWithTimestamps>();
      expectTypeOf(intersectionValue).toHaveProperty('id');
      expectTypeOf(intersectionValue).toHaveProperty('createdAt');
    });

    test('should test template literal types', () => {
      // Template literal type
      type EventName = `on${Capitalize<string>}`;

      const eventName = typeTestingHelpers.mockTemplateLiteral<EventName>();
      expectTypeOf(eventName).toEqualTypeOf<EventName>();

      // Specific template literal
      type ButtonEvent = `onClick` | `onHover` | `onFocus`;

      const buttonEvent = typeTestingHelpers.mockTemplateLiteral<ButtonEvent>();
      expectTypeOf(buttonEvent).toEqualTypeOf<ButtonEvent>();
    });
  });

  describe('type Test Helpers', () => {
    test('should use type test suite helper', () => {
      const userSuite = typeTestHelpers.createTypeTestSuite('User', () =>
        typeTestingHelpers.mockInterface<User>(),
      );

      userSuite.matches<User>();
      userSuite.hasProperty('id');
      userSuite.hasProperty('name');
      userSuite.hasProperty('email');
      userSuite.isObject();
    });

    test('should perform quick type tests', () => {
      typeTestHelpers.quickTest('User ID', '123' as User['id']);
      typeTestHelpers.quickTest('User Active', true as User['isActive']);
      typeTestHelpers.quickTest('User Age', 25 as User['age']);
    });

    test('should test type compatibility', () => {
      const user1 = typeTestingHelpers.mockInterface<User>();
      const user2 = typeTestingHelpers.mockInterface<User>();

      typeTestHelpers.compatibilityTest('User instances', user1, user2);
    });

    test('should test type regression', () => {
      const currentUser = typeTestingHelpers.mockInterface<User>();
      const expectedUser = typeTestingHelpers.mockInterface<User>();

      typeTestHelpers.regressionTest('User type', currentUser, expectedUser);
    });
  });

  describe('common Type Patterns', () => {
    test('should test API response pattern', () => {
      const response = {
        ...commonTypePatterns.ApiResponse,
        data: typeTestingHelpers.mockInterface<User>(),
      };

      expectTypeOf(response).toMatchTypeOf<ApiResponse<User>>();
    });

    test('should test database model pattern', () => {
      const model = {
        ...commonTypePatterns.DatabaseModel,
        email: 'test@example.com',
        name: 'Test User',
      };

      expectTypeOf(model).toMatchTypeOf<DatabaseUser>();
    });

    test('should test React props pattern', () => {
      const props = {
        ...commonTypePatterns.ReactProps,
        onClick: () => {},
        variant: 'primary' as const,
      };

      expectTypeOf(props).toMatchTypeOf<ButtonProps>();
    });
  });

  describe('error Cases', () => {
    test('should handle type errors gracefully', () => {
      // Test that we can expect type errors
      const { expectTypeError } = typeTestUtils;

      expectTypeError(() => {
        // This should cause a type error
        const user: User = {
          id: '1',
          name: 'John',
          // Missing required properties
        } as User;

        return user;
      });
    });

    test('should handle successful type checks', () => {
      const { expectNoTypeError } = typeTestUtils;

      expectNoTypeError(() => {
        // This should not cause a type error
        const user: User = {
          id: '1',
          name: 'John',
          email: 'john@example.com',
          isActive: true,
        };

        return user;
      });
    });
  });
});

// Additional type-only tests (these don't run at runtime)
describe('type-Only Tests', () => {
  test('should verify type-only constructs', () => {
    // These tests only check types, not runtime behavior
    type UserKeys = keyof User;
    type UserValues = User[keyof User];

    expectTypeOf<UserKeys>().toEqualTypeOf<'id' | 'name' | 'email' | 'age' | 'isActive'>();
    expectTypeOf<UserValues>().toEqualTypeOf<string | number | boolean | undefined>();
  });

  test('should verify complex type relationships', () => {
    // Test type relationships that only exist at compile time
    type UserEmail = User['email'];
    type UserOptionalAge = User['age'];

    expectTypeOf<UserEmail>().toBeString();
    expectTypeOf<UserOptionalAge>().toEqualTypeOf<number | undefined>();
  });
});
