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

interface RegistryCreatedTemplateProps extends Record<string, any> {
  readonly email: string;
  readonly name: string;
  readonly registryTitle: string;
  readonly registryType: string;
  readonly registryUrl: string;
  readonly eventDate?: string;
}

export const RegistryCreatedTemplate = ({
  email: email,
  name,
  registryTitle,
  registryType,
  registryUrl,
  eventDate,
}: RegistryCreatedTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Your {registryType} registry has been created!</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mt-0 mb-4 font-semibold text-2xl text-zinc-950">
                Your Registry is Ready! 🎁
              </Text>

              <Text className="m-0 mb-4 text-zinc-500">Hi {name}!</Text>

              <Text className="m-0 mb-4 text-zinc-500">
                Great news! Your <strong>{registryTitle}</strong> ({registryType.toLowerCase()}) has
                been successfully created.
              </Text>

              {eventDate && (
                <Text className="m-0 mb-6 text-zinc-500">
                  Event Date: <strong>{eventDate}</strong>
                </Text>
              )}

              <Text className="m-0 mb-6 text-zinc-500">
                Now you can start adding items and sharing your registry with friends and family.
              </Text>

              <Section className="mb-6 ml-4">
                <Text className="m-0 mb-2 text-sm text-zinc-600">
                  • Add products or collections to your registry
                </Text>
                <Text className="m-0 mb-2 text-sm text-zinc-600">
                  • Set priorities for items (1-10 scale)
                </Text>
                <Text className="m-0 mb-2 text-sm text-zinc-600">
                  • Share your registry with others
                </Text>
                <Text className="m-0 mb-4 text-sm text-zinc-600">
                  • Track purchases and send thank you notes
                </Text>
              </Section>

              <Section className="mb-6">
                <Button
                  className="rounded-md bg-zinc-950 px-6 py-3 text-center text-white no-underline"
                  href={registryUrl}
                >
                  View Your Registry
                </Button>
              </Section>

              <Hr className="my-4" />

              <Text className="m-0 text-sm text-zinc-500">
                Happy registering!
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

const ExampleRegistryCreatedEmail = () => (
  <RegistryCreatedTemplate
    email="jane@example.com"
    name="Jane Smith"
    registryTitle="Our Dream Wedding"
    registryType="Wedding"
    registryUrl="https://example.com/registries/123"
    eventDate="June 15, 2024"
  />
);

export default ExampleRegistryCreatedEmail;
