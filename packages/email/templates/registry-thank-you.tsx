import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface RegistryThankYouTemplateProps extends Record<string, any> {
  readonly email: string;
  readonly recipientName: string;
  readonly senderName: string;
  readonly registryTitle: string;
  readonly itemName: string;
  readonly message: string;
}

export const RegistryThankYouTemplate = ({
  email: _email,
  recipientName,
  senderName,
  registryTitle,
  itemName,
  message,
}: RegistryThankYouTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Thank you from {senderName}</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mt-0 mb-4 font-semibold text-2xl text-zinc-950">
                A Special Thank You! 💝
              </Text>

              <Text className="m-0 mb-4 text-zinc-500">Hi {recipientName}!</Text>

              <Text className="m-0 mb-6 text-zinc-500">
                <strong>{senderName}</strong> wanted to thank you for your thoughtful gift from
                their registry "{registryTitle}".
              </Text>

              <Section className="mb-6 p-4 bg-zinc-50 rounded-md">
                <Text className="m-0 mb-2 text-sm text-zinc-600">
                  <strong>Your Gift:</strong>
                </Text>
                <Text className="m-0 text-lg font-semibold text-zinc-950">{itemName}</Text>
              </Section>

              <Section className="mb-6 p-6 bg-gradient-to-r from-pink-50 to-purple-50 rounded-md">
                <Text className="m-0 mb-2 text-sm font-semibold text-zinc-700">
                  Personal Message from {senderName}:
                </Text>
                <Text className="m-0 text-zinc-700 italic leading-relaxed">"{message}"</Text>
              </Section>

              <Hr className="my-4" />

              <Text className="m-0 text-sm text-zinc-500">
                Your generosity and thoughtfulness mean the world to them. Thank you for being part
                of their special occasion!
              </Text>

              <Text className="m-0 mt-4 text-sm text-zinc-500">
                With gratitude,
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

const ExampleRegistryThankYouEmail = () => (
  <RegistryThankYouTemplate
    email="john@example.com"
    recipientName="John Doe"
    senderName="Jane Smith"
    registryTitle="Our Dream Wedding"
    itemName="KitchenAid Stand Mixer - Empire Red"
    message="Thank you so much for the beautiful KitchenAid mixer! We've already used it to make our first batch of cookies as a married couple. Your thoughtfulness and generosity mean so much to us. We're so grateful to have you in our lives!"
  />
);

export default ExampleRegistryThankYouEmail;
