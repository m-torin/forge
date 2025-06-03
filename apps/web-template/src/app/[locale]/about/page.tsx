import { getDictionary } from "@/i18n";
import { Container, Paper, Stack, Text, Title } from "@mantine/core";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <Container py="xl" size="lg">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md" size="h1">
            {dict.app?.about || "About Us"}
          </Title>
          <Text c="dimmed" size="lg">
            {dict.app?.appDescription ||
              "Learn more about our mission and values"}
          </Text>
        </div>

        <Paper shadow="sm" p="xl" radius="md">
          <Title order={2} mb="md" size="h3">
            {dict.app?.mission || "Our Mission"}
          </Title>
          <Text>
            {dict.app?.description ||
              "We are dedicated to building modern web applications with the best developer experience and user interface."}
          </Text>
        </Paper>

        <Paper shadow="sm" p="xl" radius="md">
          <Title order={2} mb="md" size="h3">
            {dict.app?.contact || "Contact"}
          </Title>
          <Text>
            {dict.app?.contactInfo ||
              "Get in touch with us for more information about our services and solutions."}
          </Text>
        </Paper>
      </Stack>
    </Container>
  );
}
