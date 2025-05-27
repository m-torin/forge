import { getDictionary } from "@/lib/dictionary";
import { Button, Container, Paper, Stack, Text, Title } from "@mantine/core";

import { Link } from "@repo/internationalization/client";

interface AboutPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <Container className="py-10" size="sm">
      <Paper shadow="sm" p="xl" radius="md">
        <Stack>
          <Title order={1}>
            {dictionary.template?.about?.title || "About Page"}
          </Title>

          <Text size="lg">
            {dictionary.template?.about?.description ||
              "This is the about page demonstrating internationalization."}
          </Text>

          <Text c="dimmed">
            {dictionary.template?.about?.currentLocale || "Current locale"}:{" "}
            <strong>{locale}</strong>
          </Text>

          <Text>
            {dictionary.template?.about?.languageFromDictionary ||
              "Language from dictionary"}
            : <strong>{dictionary.common?.locale || locale}</strong>
          </Text>

          <div className="mt-6">
            <Title order={3}>
              {dictionary.template?.about?.tryLanguages ||
                "Try different languages"}
              :
            </Title>
            <Stack className="mt-3" gap="xs">
              <Link href="/about" locale="en">
                <Button
                  fullWidth
                  variant={locale === "en" ? "filled" : "light"}
                >
                  English
                </Button>
              </Link>
              <Link href="/about" locale="es">
                <Button
                  fullWidth
                  variant={locale === "es" ? "filled" : "light"}
                >
                  Español
                </Button>
              </Link>
              <Link href="/about" locale="fr">
                <Button
                  fullWidth
                  variant={locale === "fr" ? "filled" : "light"}
                >
                  Français
                </Button>
              </Link>
              <Link href="/about" locale="de">
                <Button
                  fullWidth
                  variant={locale === "de" ? "filled" : "light"}
                >
                  Deutsch
                </Button>
              </Link>
              <Link href="/about" locale="ja">
                <Button
                  fullWidth
                  variant={locale === "ja" ? "filled" : "light"}
                >
                  日本語
                </Button>
              </Link>
              <Link href="/about" locale="zh">
                <Button
                  fullWidth
                  variant={locale === "zh" ? "filled" : "light"}
                >
                  中文
                </Button>
              </Link>
            </Stack>
          </div>

          <Link href="/" locale={locale}>
            <Button className="mt-4" variant="subtle">
              {dictionary.template?.about?.backToHome || "Back to Home"}
            </Button>
          </Link>
        </Stack>
      </Paper>
    </Container>
  );
}
