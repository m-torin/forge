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

interface RegistryInvitationTemplateProps extends Record<string, any> {
  readonly email: string;
  readonly inviterName: string;
  readonly inviterEmail: string;
  readonly registryTitle: string;
  readonly registryType: string;
  readonly registryUrl: string;
  readonly role: 'VIEWER' | 'EDITOR';
  readonly message?: string;
  readonly eventDate?: string;
}

export const RegistryInvitationTemplate = ({
  email: email,
  inviterName,
  inviterEmail: inviterEmail,
  registryTitle,
  registryType,
  registryUrl,
  role,
  message,
  eventDate,
}: RegistryInvitationTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>{inviterName} invited you to view their registry</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mt-0 mb-4 font-semibold text-2xl text-zinc-950">
                You&apos;re Invited to View a Registry! 🎉
              </Text>

              <Text className="m-0 mb-4 text-zinc-500">
                <strong>{inviterName}</strong> has invited you to{' '}
                {role === 'EDITOR' ? 'collaborate on' : 'view'} their {registryType.toLowerCase()}{' '}
                registry:
              </Text>

              <Section className="mb-6 p-4 bg-zinc-50 rounded-md">
                <Text className="m-0 mb-2 font-semibold text-zinc-950">{registryTitle}</Text>
                {eventDate && (
                  <Text className="m-0 text-sm text-zinc-600">Event Date: {eventDate}</Text>
                )}
              </Section>

              {message && (
                <Section className="mb-6 p-4 bg-blue-50 rounded-md border-l-4 border-blue-500">
                  <Text className="m-0 mb-1 text-sm font-semibold text-zinc-700">
                    Personal Message:
                  </Text>
                  <Text className="m-0 text-sm text-zinc-600 italic">&ldquo;{message}&rdquo;</Text>
                </Section>
              )}

              {role === 'EDITOR' && (
                <Section className="mb-6">
                  <Text className="m-0 mb-2 text-zinc-500">
                    As an <strong>Editor</strong>, you&apos;ll be able to:
                  </Text>
                  <Section className="ml-4">
                    <Text className="m-0 mb-1 text-sm text-zinc-600">
                      • Add and remove items from the registry
                    </Text>
                    <Text className="m-0 mb-1 text-sm text-zinc-600">
                      • Update item priorities and notes
                    </Text>
                    <Text className="m-0 mb-1 text-sm text-zinc-600">• View purchase history</Text>
                  </Section>
                </Section>
              )}

              <Section className="mb-6">
                <Button
                  className="rounded-md bg-zinc-950 px-6 py-3 text-center text-white no-underline"
                  href={registryUrl}
                >
                  View Registry
                </Button>
              </Section>

              <Hr className="my-4" />

              <Text className="m-0 text-sm text-zinc-500">
                If you have any questions, you can reply to this email to contact {inviterName}.
              </Text>

              <Text className="m-0 mt-4 text-sm text-zinc-500">
                Happy gifting!
                <br />
                The Registry Team
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

const ExampleRegistryInvitationEmail = () => (
  <RegistryInvitationTemplate
    email="friend@example.com"
    inviterName="Jane Smith"
    inviterEmail="jane@example.com"
    registryTitle="Our Dream Wedding"
    registryType="Wedding"
    registryUrl="https://example.com/registries/123"
    role="VIEWER"
    message="We'd love for you to be part of our special day!"
    eventDate="June 15, 2024"
  />
);

export default ExampleRegistryInvitationEmail;
