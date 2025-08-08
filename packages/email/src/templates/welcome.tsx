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

interface WelcomeTemplateProps extends Record<string, any> {
  readonly dashboardUrl?: string;
  readonly email: string;
  readonly name: string;
  readonly organizationName: string;
}

export const WelcomeTemplate = ({
  name,
  email: email,
  dashboardUrl = 'https://example.com/dashboard',
  organizationName,
}: WelcomeTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Welcome to {organizationName}!</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mb-4 mt-0 text-2xl font-semibold text-zinc-950">
                Welcome to {organizationName}! 🎉
              </Text>

              <Text className="m-0 mb-4 text-zinc-500">Hi {name}!</Text>

              <Text className="m-0 mb-4 text-zinc-500">
                Congratulations! You've successfully created your organization{' '}
                <strong>{organizationName}</strong>. You're all set to start collaborating with your
                team.
              </Text>

              <Text className="m-0 mb-6 text-zinc-500">
                Here are some things you can do to get started:
              </Text>

              <Section className="mb-6 ml-4">
                <Text className="m-0 mb-2 text-sm text-zinc-600">
                  • Invite team members to join your organization
                </Text>
                <Text className="m-0 mb-2 text-sm text-zinc-600">
                  • Set up your workflows and integrations
                </Text>
                <Text className="m-0 mb-2 text-sm text-zinc-600">
                  • Configure your organization settings
                </Text>
                <Text className="m-0 mb-4 text-sm text-zinc-600">
                  • Explore the dashboard and features
                </Text>
              </Section>

              <Section className="mb-6">
                <Button
                  className="rounded-md bg-zinc-950 px-6 py-3 text-center text-white no-underline"
                  href={dashboardUrl}
                >
                  Go to Dashboard
                </Button>
              </Section>

              <Hr className="my-4" />

              <Text className="m-0 mb-2 text-sm text-zinc-500">
                If you have any questions or need help getting started, don't hesitate to reach out
                to our support team.
              </Text>

              <Text className="m-0 text-sm text-zinc-500">
                Thanks for choosing us!
                <br />
                The Team
              </Text>
              <Section className="mt-8 rounded-md bg-gray-100 p-4">
                <Text className="m-0 mb-2 text-xs font-bold text-gray-500">
                  [Debug Info: All Fields]
                </Text>
                <Text className="m-0 text-xs text-gray-500">dashboardUrl: {dashboardUrl}</Text>
                <Text className="m-0 text-xs text-gray-500">email: {email}</Text>
                <Text className="m-0 text-xs text-gray-500">name: {name}</Text>
                <Text className="m-0 text-xs text-gray-500">
                  organizationName: {organizationName}
                </Text>
              </Section>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

const ExampleWelcomeEmail = () => (
  <WelcomeTemplate
    dashboardUrl="https://example.com/dashboard"
    email="jane@example.com"
    name="Jane Smith"
    organizationName="Acme Corp"
  />
);

export default ExampleWelcomeEmail;
