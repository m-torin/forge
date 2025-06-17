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

interface RegistryPurchaseConfirmationTemplateProps extends Record<string, any> {
  readonly email: string;
  readonly purchaserName: string;
  readonly registryOwnerName: string;
  readonly registryTitle: string;
  readonly itemName: string;
  readonly quantity: number;
  readonly orderNumber?: string;
  readonly registryUrl: string;
  readonly isGift: boolean;
  readonly giftWrapped?: boolean;
}

export const RegistryPurchaseConfirmationTemplate = ({
  email: _email,
  purchaserName,
  registryOwnerName,
  registryTitle,
  itemName,
  quantity,
  orderNumber,
  registryUrl,
  isGift,
  giftWrapped,
}: RegistryPurchaseConfirmationTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Your registry purchase has been recorded</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mt-0 mb-4 font-semibold text-2xl text-zinc-950">
                Thank You for Your Purchase! 🎁
              </Text>

              <Text className="m-0 mb-4 text-zinc-500">Hi {purchaserName}!</Text>

              <Text className="m-0 mb-6 text-zinc-500">
                We've successfully recorded your purchase from{' '}
                <strong>{registryOwnerName}'s</strong> registry. Thank you for your thoughtful{' '}
                {isGift ? 'gift' : 'purchase'}!
              </Text>

              <Section className="mb-6 p-4 bg-zinc-50 rounded-md">
                <Text className="m-0 mb-3 font-semibold text-zinc-950">Purchase Details:</Text>
                <Text className="m-0 mb-1 text-sm text-zinc-600">
                  <strong>Registry:</strong> {registryTitle}
                </Text>
                <Text className="m-0 mb-1 text-sm text-zinc-600">
                  <strong>Item:</strong> {itemName}
                </Text>
                <Text className="m-0 mb-1 text-sm text-zinc-600">
                  <strong>Quantity:</strong> {quantity}
                </Text>
                {orderNumber && (
                  <Text className="m-0 mb-1 text-sm text-zinc-600">
                    <strong>Order Number:</strong> {orderNumber}
                  </Text>
                )}
                {isGift && giftWrapped && (
                  <Text className="m-0 mt-2 text-sm text-green-600">✓ Gift wrapped</Text>
                )}
              </Section>

              <Text className="m-0 mb-6 text-zinc-500">
                The registry owner has been notified about your purchase. This item has been marked
                as purchased to prevent duplicate gifts.
              </Text>

              <Section className="mb-6">
                <Button
                  className="rounded-md bg-zinc-950 px-6 py-3 text-center text-white no-underline"
                  href={registryUrl}
                >
                  View Registry
                </Button>
              </Section>

              <Hr className="my-4" />

              <Section className="p-4 bg-blue-50 rounded-md">
                <Text className="m-0 mb-2 text-sm font-semibold text-blue-900">
                  What happens next?
                </Text>
                <Text className="m-0 mb-1 text-sm text-blue-800">
                  • Complete your purchase with the retailer if you haven't already
                </Text>
                <Text className="m-0 mb-1 text-sm text-blue-800">
                  • The registry owner may send you a thank you message
                </Text>
                <Text className="m-0 text-sm text-blue-800">
                  • You can always view the registry to see other available items
                </Text>
              </Section>

              <Text className="m-0 mt-6 text-sm text-zinc-500">
                Thank you for your generosity!
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

const ExampleRegistryPurchaseConfirmationEmail = () => (
  <RegistryPurchaseConfirmationTemplate
    email="john@example.com"
    purchaserName="John Doe"
    registryOwnerName="Jane Smith"
    registryTitle="Our Dream Wedding"
    itemName="KitchenAid Stand Mixer - Empire Red"
    quantity={1}
    orderNumber="ORD-12345"
    registryUrl="https://example.com/registries/123"
    isGift={true}
    giftWrapped={true}
  />
);

export default ExampleRegistryPurchaseConfirmationEmail;
