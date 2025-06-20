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

interface RegistryItemAddedTemplateProps extends Record<string, any> {
  readonly email: string;
  readonly recipientName: string;
  readonly adderName: string;
  readonly registryTitle: string;
  readonly itemName: string;
  readonly itemQuantity: number;
  readonly itemPriority: number;
  readonly itemNotes?: string;
  readonly registryUrl: string;
}

export const RegistryItemAddedTemplate = ({
  email: _email,
  recipientName,
  adderName,
  registryTitle,
  itemName,
  itemQuantity,
  itemPriority,
  itemNotes,
  registryUrl,
}: RegistryItemAddedTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>New item added to {registryTitle}</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mt-0 mb-4 font-semibold text-2xl text-zinc-950">
                New Item Added to Registry 📝
              </Text>

              <Text className="m-0 mb-4 text-zinc-500">Hi {recipientName}!</Text>

              <Text className="m-0 mb-6 text-zinc-500">
                <strong>{adderName}</strong> has added a new item to the registry &ldquo;
                {registryTitle}&rdquo;.
              </Text>

              <Section className="mb-6 p-4 bg-zinc-50 rounded-md">
                <Text className="m-0 mb-3 font-semibold text-zinc-950">Item Details:</Text>
                <Text className="m-0 mb-2 text-lg font-medium text-zinc-800">{itemName}</Text>
                <Text className="m-0 mb-1 text-sm text-zinc-600">
                  <strong>Quantity Needed:</strong> {itemQuantity}
                </Text>
                <Text className="m-0 mb-1 text-sm text-zinc-600">
                  <strong>Priority:</strong> {itemPriority}/10{' '}
                  {itemPriority >= 8 ? '(High)' : itemPriority >= 5 ? '(Medium)' : '(Low)'}
                </Text>
                {itemNotes && (
                  <Text className="m-0 mt-2 text-sm text-zinc-600">
                    <strong>Notes:</strong> {itemNotes}
                  </Text>
                )}
              </Section>

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
                You&apos;re receiving this email because you have edit access to this registry. You
                can manage your notification preferences in your account settings.
              </Text>

              <Text className="m-0 mt-4 text-sm text-zinc-500">
                Happy collaborating!
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

const ExampleRegistryItemAddedEmail = () => (
  <RegistryItemAddedTemplate
    email="editor@example.com"
    recipientName="Sarah Jones"
    adderName="Jane Smith"
    registryTitle="Our Dream Wedding"
    itemName="Instant Pot Duo 7-in-1 Electric Pressure Cooker"
    itemQuantity={1}
    itemPriority={8}
    itemNotes="Would love the 8-quart size for hosting dinner parties!"
    registryUrl="https://example.com/registries/123"
  />
);

export default ExampleRegistryItemAddedEmail;
