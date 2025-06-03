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

interface PasswordResetTemplateProps {
  readonly email: string;
  readonly name?: string | null;
  readonly resetLink: string;
}

export const PasswordResetTemplate = ({ name, email, resetLink }: PasswordResetTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mt-0 mb-4 font-semibold text-2xl text-zinc-950">
                Reset your password
              </Text>

              <Text className="m-0 mb-4 text-zinc-500">Hi {name || email}!</Text>

              <Text className="m-0 mb-6 text-zinc-500">
                You requested to reset your password. Click the button below to create a new
                password.
              </Text>

              <Section className="mb-6">
                <Button
                  href={resetLink}
                  className="rounded-md bg-zinc-950 px-6 py-3 text-center text-white no-underline"
                >
                  Reset Password
                </Button>
              </Section>

              <Hr className="my-4" />

              <Text className="m-0 mb-2 text-sm text-zinc-500">
                This link will expire in 1 hour for your security.
              </Text>

              <Text className="m-0 text-sm text-zinc-500">
                If you didn't request this password reset, you can safely ignore this email. Your
                password will not be changed.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

const ExamplePasswordResetEmail = () => (
  <PasswordResetTemplate
    email="jane@example.com"
    name="Jane Smith"
    resetLink="https://example.com/reset-password?token=abc123"
  />
);

export default ExamplePasswordResetEmail;
