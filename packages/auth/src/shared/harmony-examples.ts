/**
 * Examples and usage patterns for better-auth-harmony integration
 * This file demonstrates how to use the harmony utilities in various scenarios
 */

import { harmonyConfig, harmonyUtils } from './harmony';

// Example 1: Email normalization preview
export function exampleEmailValidation() {
  const email = 'user.test+tag@gmail.com';

  // Check if email will be normalized
  const willNormalize = harmonyUtils.willEmailBeNormalized(email);

  // Get expected normalized email
  const normalized = harmonyUtils.getExpectedNormalizedEmail(email);

  return { willNormalize, normalized };
}

// Example 2: Phone number normalization preview
export function examplePhoneValidation() {
  const phoneNumber = '+1 (555) 123-4567';

  // Check if phone will be normalized
  const willNormalize = harmonyUtils.willPhoneBeNormalized(phoneNumber);

  // Get expected normalized phone
  const normalized = harmonyUtils.getExpectedNormalizedPhone(phoneNumber, 'US');

  return { willNormalize, normalized };
}

// Example 3: Using harmony configuration
export function exampleHarmonyConfig() {
  // Email validation using config
  const email = 'test@example.com';
  const isValid = harmonyConfig.email.validator(email);

  // Email normalization using config
  const normalizedEmail = harmonyConfig.email.normalizer('  Test@Example.Com  ');

  // Phone normalization using config
  const normalizedPhone = harmonyConfig.phone.normalizer('+1 (555) 123-4567');

  return { isValid, normalizedEmail, normalizedPhone };
}

// Example 4: React form integration
export function exampleReactFormValidation() {
  return `
// In your React component
import { useHarmony } from '@repo/auth/harmony/hooks';

function SignUpForm() {
  const { email, phone } = useHarmony();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
  });

  const handleEmailChange = (value: string) => {
    setFormData(prev => ({ ...prev, email: value }));
    email.checkEmail(value);
  });

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }));
    phone.checkPhone(value, 'US');
  });

  return (
    <form>
      <input 
        type="email" 
        value={formData.email}
        onChange={(e: any) => handleEmailChange(e.target.value)}
      />
      {email.emailInfo.willBeNormalized && (
        <div className="hint">
          Will be normalized to: {email.emailInfo.expectedNormalized}
        </div>
      )}
      
      <input 
        type="tel" 
        value={formData.phone}
        onChange={(e: any) => handlePhoneChange(e.target.value)}
      />
      {phone.phoneInfo.willBeNormalized && (
        <div className="hint">
          Will be normalized to: {phone.phoneInfo.expectedNormalized}
        </div>
      )}
      
      <button type="submit">Sign Up</button>
    </form>
  );
}
`;
}

// Example 5: Server-side configuration
export function exampleServerConfiguration() {
  return `
// In your Better Auth configuration
import { betterAuth } from 'better-auth';
import { emailHarmony, phoneHarmony } from '@repo/auth/harmony';

export const auth = betterAuth({
  plugins: [
    emailHarmony({
      allowNormalizedSignin: true,
    }),
    phoneHarmony({
      defaultCountry: 'US',
      extract: true,
    }),
  ],
});
`;
}

// Example 6: Database migration
export function exampleDatabaseMigration() {
  return `
-- Run this command to add harmony fields to your database:
-- npx @better-auth/cli migrate

-- This will add the following fields to your user table:
-- normalizedEmail: string | null
-- phoneNumber: string | null  
-- normalizedPhoneNumber: string | null
`;
}

export default {
  exampleEmailValidation,
  examplePhoneValidation,
  exampleHarmonyConfig,
  exampleReactFormValidation,
  exampleServerConfiguration,
  exampleDatabaseMigration,
};
