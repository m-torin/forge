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

interface VerificationTemplateProps extends Record<string, any> {
  readonly email: string;
  readonly name?: null | string;
  readonly verificationLink: string;
}

export const VerificationTemplate = ({
  email,
  name,
  verificationLink,
}: VerificationTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Verify your email address</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mb-4 mt-0 text-2xl font-semibold text-zinc-950">
                Verify your email address
              </Text>

              <Text className="m-0 mb-4 text-zinc-500">Hi {name ?? email}!</Text>

              <Text className="m-0 mb-6 text-zinc-500">
                Thanks for creating an account! Please click the button below to verify your email
                address and complete your registration.
              </Text>

              <Section className="mb-6">
                <Button
                  className="rounded-md bg-zinc-950 px-6 py-3 text-center text-white no-underline"
                  href={verificationLink}
                >
                  Verify Email Address
                </Button>
              </Section>

              <Hr className="my-4" />

              <Text className="m-0 mb-2 text-sm text-zinc-500">
                This link will expire in 24 hours for your security.
              </Text>

              <Text className="m-0 text-sm text-zinc-500">
                If you didn&apos;t create an account, you can safely ignore this email.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

const ExampleVerificationEmail = () => (
  <VerificationTemplate
    email="jane@example.com"
    name="Jane Smith"
    verificationLink="https://example.com/verify-email?token=abc123"
  />
);

export default ExampleVerificationEmail;
