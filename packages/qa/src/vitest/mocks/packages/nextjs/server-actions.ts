// Next.js Server Actions mocks
import { vi } from 'vitest';

// Mock the "use server" directive
// This is a no-op in tests but helps maintain compatibility
// Note: "use server" is a directive, not a function, so we don't need to mock it

// Server Action utilities
export const createServerActionId = vi.fn((action: Function) => {
  return `__server_action_${action.name || 'anonymous'}_${Math.random().toString(36).substring(2, 15)}`;
});

export const createServerActionWrapper = vi.fn((action: Function, actionId: string) => {
  const wrappedAction = async (...args: any[]) => {
    // Simulate server action execution
    return await action(...args);
  };

  // Attach the action ID for testing
  (wrappedAction as any).__actionId = actionId;
  return wrappedAction;
});

// Mock form action handling
export const mockFormAction = vi.fn((action: Function) => {
  return async (formData: FormData) => {
    // Convert FormData to object for easier testing
    const data = Object.fromEntries(formData.entries());
    return await action(data);
  };
});

// Mock server action binding
export const mockServerActionBinding = vi.fn((action: Function, ...boundArgs: any[]) => {
  return async (...args: any[]) => {
    return await action(...boundArgs, ...args);
  };
});

// Mock Next.js internal server action handling
vi.mock('next/server', async importOriginal => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    // Server actions are handled internally by Next.js
    __serverActionHandler: vi.fn(async (actionId: string, formData: FormData) => {
      // Simulate server action execution
      return { success: true, data: Object.fromEntries(formData.entries()) };
    }),
  };
});

// Mock server action error handling
export const mockServerActionError = vi.fn((error: Error) => {
  return {
    error: error.message,
    stack: error.stack,
    digest: `server-action-error-${Math.random().toString(36).substring(2, 15)}`,
  };
});

// Mock progressive enhancement
export const mockProgressiveEnhancement = vi.fn((fallbackUrl: string) => {
  return {
    action: fallbackUrl,
    method: 'POST',
    encType: 'application/x-www-form-urlencoded',
  };
});

// Mock server action middleware
export const mockServerActionMiddleware = vi.fn((action: Function) => {
  return async (request: any, context: any) => {
    // Simulate middleware execution
    return await action(request, context);
  };
});

// Mock server action validation
export const mockServerActionValidation = vi.fn((schema: any) => {
  return (action: Function) => {
    return async (data: any) => {
      // Simulate validation
      if (schema.validate) {
        const result = schema.validate(data);
        if (result.error) {
          throw new Error(result.error.message);
        }
      }
      return await action(data);
    };
  };
});

// Mock server action with redirect
export const mockServerActionWithRedirect = vi.fn((action: Function, redirectUrl: string) => {
  return async (...args: any[]) => {
    const result = await action(...args);
    // Simulate redirect after action
    throw new Error(`NEXT_REDIRECT: ${redirectUrl}`);
  };
});

// Mock server action with revalidation
export const mockServerActionWithRevalidation = vi.fn((action: Function, paths: string[]) => {
  return async (...args: any[]) => {
    const result = await action(...args);
    // Simulate revalidation
    paths.forEach(path => {
      console.log(`Revalidating path: ${path}`);
    });
    return result;
  };
});

// Mock server action hooks for testing
export const mockServerActionHooks = {
  onStart: vi.fn(),
  onSuccess: vi.fn(),
  onError: vi.fn(),
  onComplete: vi.fn(),
};

// Mock server action state
export const mockServerActionState = vi.fn(() => ({
  pending: false,
  error: null,
  data: null,
  formData: null,
  formAction: null,
}));

// Mock useFormStatus for server actions
vi.mock('react-dom', async importOriginal => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    useFormStatus: vi.fn(() => ({
      pending: false,
      data: null,
      method: null,
      action: null,
    })),
    useFormState: vi.fn((action: Function, initialState: any) => {
      return [initialState, action];
    }),
  };
});

// Mock server action security
export const mockServerActionSecurity = {
  generateCSRFToken: vi.fn(() => `csrf-token-${Math.random().toString(36).substring(2, 15)}`),
  validateCSRFToken: vi.fn((token: string) => token.startsWith('csrf-token-')),
  encryptPayload: vi.fn((payload: any) => `encrypted-${JSON.stringify(payload)}`),
  decryptPayload: vi.fn((encrypted: string) => JSON.parse(encrypted.replace('encrypted-', ''))),
};

// Mock server action performance
export const mockServerActionPerformance = {
  measureExecution: vi.fn(async (action: Function, ...args: any[]) => {
    const start = performance.now();
    const result = await action(...args);
    const duration = performance.now() - start;
    return { result, duration };
  }),
  trackMemoryUsage: vi.fn(() => ({
    used: Math.random() * 1000000,
    total: 1000000,
  })),
};

// Mock server action debugging
export const mockServerActionDebug = {
  logExecution: vi.fn((actionName: string, args: any[]) => {
    console.log(`[Server Action] ${actionName}`, args);
  }),
  captureError: vi.fn((error: Error, context: any) => {
    console.error(`[Server Action Error]`, error, context);
  }),
};

// Export server action test utilities
export const serverActionTestUtils = {
  createMockFormData: (data: Record<string, string | File>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  },

  createMockServerAction: (implementation: Function) => {
    const actionId = createServerActionId(implementation);
    const wrappedAction = createServerActionWrapper(implementation, actionId);
    return wrappedAction;
  },

  simulateFormSubmission: async (action: Function, data: Record<string, string>) => {
    const formData = serverActionTestUtils.createMockFormData(data);
    return await action(formData);
  },

  expectServerActionCalled: (action: Function, expectedArgs?: any[]) => {
    expect(action).toHaveBeenCalledWith();
    if (expectedArgs) {
      expect(action).toHaveBeenCalledWith(...expectedArgs);
    }
  },
};
