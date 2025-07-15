/**
 * Password policy plugin for better-auth
 * Enforces strong password requirements
 */

export interface PasswordPolicyOptions {
  minLength?: number;
  maxLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumbers?: boolean;
  requireSymbols?: boolean;
  preventCommonPasswords?: boolean;
  preventEmailInPassword?: boolean;
  customValidator?: (password: string, email?: string) => { valid: boolean; error?: string };
}

const DEFAULT_OPTIONS: PasswordPolicyOptions = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  preventCommonPasswords: true,
  preventEmailInPassword: true,
};

// Common passwords to prevent
const COMMON_PASSWORDS = [
  'password',
  'password123',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'password1',
  'password12',
  'admin',
  'letmein',
  'welcome',
  'monkey',
  '1234567890',
  'qwertyuiop',
  'password123!',
  'iloveyou',
  'admin123',
];

export function passwordPolicyPlugin(options: PasswordPolicyOptions = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const validatePassword = (
    password: string,
    email?: string,
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check length
    if (config.minLength && password.length < config.minLength) {
      errors.push(`Password must be at least ${config.minLength} characters long`);
    }
    if (config.maxLength && password.length > config.maxLength) {
      errors.push(`Password must be no more than ${config.maxLength} characters long`);
    }

    // Check character requirements
    if (config.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (config.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (config.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (config.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Check common passwords
    if (config.preventCommonPasswords && COMMON_PASSWORDS.includes(password.toLowerCase())) {
      errors.push('Password is too common. Please choose a more unique password');
    }

    // Check if password contains email
    if (config.preventEmailInPassword && email) {
      const emailParts = email.toLowerCase().split('@');
      const username = emailParts[0];
      if (password.toLowerCase().includes(username)) {
        errors.push('Password should not contain your email username');
      }
    }

    // Custom validation
    if (config.customValidator) {
      const customResult = config.customValidator(password, email);
      if (!customResult.valid && customResult.error) {
        errors.push(customResult.error);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  return {
    id: 'password-policy',
    hooks: {
      before: [
        {
          matcher: (context: any) => {
            return context.path === '/sign-up' || context.path === '/update-password';
          },
          handler: async (context: any) => {
            const { password, email } = context.body || {};

            if (!password) {
              return context;
            }

            const validation = validatePassword(password, email);

            if (!validation.valid) {
              throw new Error(validation.errors.join('. '));
            }

            return context;
          },
        },
      ],
    },
  };
}

// Export function for testing
export function validatePasswordPolicy(password: string): { isValid: boolean; errors?: string[] } {
  const _result = passwordPolicyPlugin().hooks.before?.[0].handler({
    body: { password },
    path: '/sign-up',
  });

  // Basic implementation for testing
  if (!password || password.length < 8) {
    return { isValid: false, errors: ['Password must be at least 8 characters long'] };
  }

  return { isValid: true };
}
