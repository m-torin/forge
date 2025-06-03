import { MagicLinkTemplate } from '@repo/email/templates/magic-link';

const ExampleMagicLinkEmail = () => (
  <MagicLinkTemplate
    email="jane@example.com"
    expiresIn="20 minutes"
    magicLink="https://example.com/auth/verify-magic-link?token=abc123"
    name="Jane Smith"
  />
);

export default ExampleMagicLinkEmail;
