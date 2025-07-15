import { PasswordResetTemplate } from '@repo/email/templates/password-reset';

const ExamplePasswordResetEmail = () => (
  <PasswordResetTemplate
    email="jane@example.com"
    name="Jane Smith"
    resetLink="https://example.com/reset-password?token=abc123"
  />
);

export default ExamplePasswordResetEmail;
