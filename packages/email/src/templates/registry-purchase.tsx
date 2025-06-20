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

interface RegistryPurchaseTemplateProps extends Record<string, any> {
  readonly email: string;
  readonly ownerName: string;
  readonly purchaserName: string;
  readonly purchaserEmail: string;
  readonly registryTitle: string;
  readonly itemName: string;
  readonly quantity: number;
  readonly giftMessage?: string;
  readonly registryUrl: string;
}

export const RegistryPurchaseTemplate = ({
  email: _email,
  ownerName,
  purchaserName,
  purchaserEmail: _purchaserEmail,
  registryTitle,
  itemName,
  quantity,
  giftMessage,
  registryUrl,
}: RegistryPurchaseTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Someone purchased an item from your registry!</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mt-0 mb-4 font-semibold text-2xl text-zinc-950">
                Great News! Someone Purchased from Your Registry 🎁
              </Text>

              <Text className="m-0 mb-4 text-zinc-500">Hi {ownerName}!</Text>

              <Text className="m-0 mb-6 text-zinc-500">
                We&apos;re excited to let you know that <strong>{purchaserName}</strong> has
                purchased an item from your registry &ldquo;{registryTitle}&rdquo;!
              </Text>

              <Section className="mb-6 p-4 bg-zinc-50 rounded-md">
                <Text className="m-0 mb-2 text-sm text-zinc-600">
                  <strong>Item Purchased:</strong>
                </Text>
                <Text className="m-0 mb-1 text-lg font-semibold text-zinc-950">{itemName}</Text>
                <Text className="m-0 text-sm text-zinc-600">Quantity: {quantity}</Text>
              </Section>

              {giftMessage && (
                <Section className="mb-6 p-4 bg-green-50 rounded-md border-l-4 border-green-500">
                  <Text className="m-0 mb-1 text-sm font-semibold text-zinc-700">
                    Gift Message:
                  </Text>
                  <Text className="m-0 text-sm text-zinc-600 italic">
                    &ldquo;{giftMessage}&rdquo;
                  </Text>
                </Section>
              )}

              <Text className="m-0 mb-6 text-zinc-500">
                Don&apos;t forget to send a thank you note! You can do this directly from your
                registry dashboard.
              </Text>

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
                We&apos;ll keep you updated as more gifts are purchased from your registry.
              </Text>

              <Text className="m-0 mt-4 text-sm text-zinc-500">
                Happy celebrating!
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

const ExampleRegistryPurchaseEmail = () => (
  <RegistryPurchaseTemplate
    email="jane@example.com"
    ownerName="Jane Smith"
    purchaserName="John Doe"
    purchaserEmail="john@example.com"
    registryTitle="Our Dream Wedding"
    itemName="KitchenAid Stand Mixer - Empire Red"
    quantity={1}
    giftMessage="Can't wait to see all the amazing things you'll bake! Congratulations!"
    registryUrl="https://example.com/registries/123"
  />
);

export default ExampleRegistryPurchaseEmail;
