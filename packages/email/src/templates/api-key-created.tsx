import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface ApiKeyCreatedTemplateProps extends Record<string, any> {
  readonly apiKeyId: string;
  readonly apiKeyName: string;
  readonly dashboardUrl?: string;
  readonly email: string;
  readonly name: string;
}

export const ApiKeyCreatedTemplate = ({
  apiKeyId,
  apiKeyName,
  dashboardUrl = 'https://example.com/api-keys',
  email: email,
  name,
}: ApiKeyCreatedTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>API Key &ldquo;{apiKeyName}&rdquo; has been created</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mt-0 mb-4 font-semibold text-2xl text-zinc-950">
                API Key Created 🔑
              </Text>

              <Text className="m-0 mb-4 text-zinc-500">Hi {name}!</Text>

              <Text className="m-0 mb-4 text-zinc-500">
                A new API key has been created for your account.
              </Text>

              <Section className="mb-6 p-4 bg-zinc-50 rounded-md">
                <Text className="m-0 mb-2 text-sm font-medium text-zinc-700">API Key Details:</Text>
                <Text className="m-0 mb-1 text-sm text-zinc-600">
                  <strong>Name:</strong> {apiKeyName}
                </Text>
                <Text className="m-0 mb-1 text-sm text-zinc-600">
                  <strong>Key ID:</strong>{' '}
                  <code className="text-xs bg-zinc-200 px-1 py-0.5 rounded">{apiKeyId}</code>
                </Text>
                <Text className="m-0 text-sm text-zinc-600">
                  <strong>Created:</strong> {new Date().toLocaleDateString()}
                </Text>
              </Section>

              <Text className="m-0 mb-6 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                ⚠️ <strong>Important:</strong> For security reasons, we don&apos;t include the
                actual API key in this email. You can find it in your dashboard immediately after
                creation.
              </Text>

              <Section className="mb-6">
                <Button
                  className="rounded-md bg-zinc-950 px-6 py-3 text-center text-white no-underline"
                  href={dashboardUrl}
                >
                  Manage API Keys
                </Button>
              </Section>

              <Hr className="my-4" />

              <Text className="m-0 mb-2 text-sm text-zinc-500">
                <strong>Security reminder:</strong> Keep your API keys secure and don&apos;t share
                them in public repositories or client-side code.
              </Text>

              <Text className="m-0 mb-4 text-sm text-zinc-500">
                If you didn&apos;t create this API key, please contact our support team immediately
                and revoke any unauthorized keys.
              </Text>

              <Text className="m-0 text-sm text-zinc-500">
                Best regards,
                <br />
                The Security Team
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

const ExampleApiKeyCreatedEmail = () => (
  <ApiKeyCreatedTemplate
    apiKeyId="forge_abc123def456"
    apiKeyName="Production API Key"
    dashboardUrl="https://example.com/api-keys"
    email="jane@example.com"
    name="Jane Smith"
  />
);

export default ExampleApiKeyCreatedEmail;
