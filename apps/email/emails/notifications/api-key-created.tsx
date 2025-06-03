import { ApiKeyCreatedTemplate } from '@repo/email/templates/api-key-created';

const ExampleApiKeyCreatedEmail = () => (
  <ApiKeyCreatedTemplate
    dashboardUrl="https://example.com/api-keys"
    apiKeyId="forge_abc123def456"
    apiKeyName="Production API Key"
    email="jane@example.com"
    name="Jane Smith"
  />
);

export default ExampleApiKeyCreatedEmail;
