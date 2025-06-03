import { VerificationTemplate } from '@repo/email/templates/verification';

const ExampleVerificationEmail = () => (
  <VerificationTemplate
    verificationLink="https://example.com/verify-email?token=abc123"
    email="jane@example.com"
    name="Jane Smith"
  />
);

export default ExampleVerificationEmail;
