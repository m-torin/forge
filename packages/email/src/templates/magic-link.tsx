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

interface MagicLinkTemplateProps extends Record<string, any> {
  readonly email: string;
  readonly expiresIn?: string;
  readonly magicLink: string;
  readonly name?: null | string;
}

export const MagicLinkTemplate = ({
  email,
  expiresIn = '20 minutes',
  magicLink,
  name,
}: MagicLinkTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Your magic link to sign in</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mb-4 mt-0 text-2xl font-semibold text-zinc-950">
                Sign in to your account
              </Text>

              <Text className="m-0 mb-4 text-zinc-500">Hi {name ?? email}!</Text>

              <Text className="m-0 mb-6 text-zinc-500">
                Click the button below to securely sign in to your account. No password required!
              </Text>

              <Section className="mb-6">
                <Button
                  className="rounded-md bg-zinc-950 px-6 py-3 text-center text-white no-underline"
                  href={magicLink}
                >
                  Sign in with Magic Link
                </Button>
              </Section>

              <Hr className="my-4" />

              <Text className="m-0 mb-2 text-sm text-zinc-500">
                This link will expire in {expiresIn} and can only be used once.
              </Text>

              <Text className="m-0 mb-2 text-sm text-zinc-500">
                If you didn&apos;t request this link, you can safely ignore this email.
              </Text>

              <Text className="m-0 text-xs text-zinc-400">
                For your security, this link will only work from the same device and browser where
                you requested it.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

const ExampleMagicLinkEmail = () => (
  <MagicLinkTemplate
    email="jane@example.com"
    expiresIn="20 minutes"
    magicLink="https://example.com/auth/verify-magic-link?token=abc123"
    name="Jane Smith"
  />
);

export default ExampleMagicLinkEmail;
