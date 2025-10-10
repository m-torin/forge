import { getDictionary, type Locale } from "#/lib/i18n";
import { Button, Container, Group, Text, Title } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import Link from "next/link";

interface NotFoundProps {
  params: Promise<{ locale: Locale }>;
}

export default async function LocalizedNotFound({ params }: NotFoundProps) {
  const { locale } = await params;
  const _dict = await getDictionary(locale);

  return (
    <Container size="md" style={{ textAlign: "center", paddingTop: "10rem" }}>
      <Title size="h1" mb="md">
        404
      </Title>
      <Title order={2} mb="md">
        Page Not Found
      </Title>
      <Text mb="xl" c="dimmed">
        The page you are looking for does not exist.
      </Text>
      <Group justify="center">
        <Button
          component={Link}
          href={(locale === "en" ? "/" : `/${locale}`) as any}
          leftSection={<IconHome size={16} />}
          variant="filled"
        >
          Back to Home
        </Button>
      </Group>
    </Container>
  );
}
