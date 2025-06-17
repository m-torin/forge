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

interface OrganizationInvitationTemplateProps extends Record<string, any> {
  readonly email: string;
  readonly expiresIn?: string;
  readonly inviteLink: string;
  readonly inviterEmail: string;
  readonly inviterName?: null | string;
  readonly organizationName: string;
}

export const OrganizationInvitationTemplate = ({
  email: _email,
  expiresIn = '48 hours',
  inviteLink,
  inviterEmail,
  inviterName,
  organizationName,
}: OrganizationInvitationTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>You've been invited to join {organizationName}</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mt-0 mb-4 font-semibold text-2xl text-zinc-950">
                Join {organizationName}
              </Text>

              <Text className="m-0 mb-4 text-zinc-500">Hi there!</Text>

              <Text className="m-0 mb-4 text-zinc-500">
                {inviterName ?? 'Someone'} ({inviterEmail}) has invited you to join their
                organization
                <strong>{organizationName}</strong>.
              </Text>

              <Text className="m-0 mb-6 text-zinc-500">
                Click the button below to accept the invitation and get started.
              </Text>

              <Section className="mb-6">
                <Button
                  className="rounded-md bg-zinc-950 px-6 py-3 text-center text-white no-underline"
                  href={inviteLink}
                >
                  Accept Invitation
                </Button>
              </Section>

              <Hr className="my-4" />

              <Text className="m-0 mb-2 text-sm text-zinc-500">
                This invitation will expire in {expiresIn}.
              </Text>

              <Text className="m-0 mb-2 text-sm text-zinc-500">
                If you don't want to join this organization, you can safely ignore this email.
              </Text>

              <Text className="m-0 text-xs text-zinc-400">
                If you're having trouble clicking the button, copy and paste this URL into your
                browser: {inviteLink}
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

const ExampleOrganizationInvitationEmail = () => (
  <OrganizationInvitationTemplate
    email="jane@example.com"
    expiresIn="48 hours"
    inviteLink="https://example.com/accept-invitation/abc123"
    inviterEmail="john@acmecorp.com"
    inviterName="John Doe"
    organizationName="Acme Corp"
  />
);

export default ExampleOrganizationInvitationEmail;
