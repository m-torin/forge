import { AppLayoutControls } from "@/components/AppLayout";
import { getDictionary } from "@/i18n";
import { Container, Stack, Text, Title } from "@mantine/core";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <Container size="lg">
      <Stack gap="xl" py="xl">
        <Title className="text-center mt-20">
          {dict.app?.welcome || "Welcome to"}{" "}
          <Text
            component="span"
            gradient={{ from: "pink", to: "yellow" }}
            inherit
            variant="gradient"
          >
            {dict.app?.mantine || "Mantine"}
          </Text>{" "}
          +
          <Text
            component="span"
            gradient={{ from: "blue", to: "green" }}
            inherit
            variant="gradient"
          >
            {dict.app?.tailwindcss || "TailwindCSS"}
          </Text>
        </Title>
        <Text
          className="text-center text-gray-700 dark:text-gray-300 max-w-[500px] mx-auto mt-xl"
          maw={580}
          mt="xl"
          mx="auto"
          size="lg"
          ta="center"
        >
          {dict.app?.description ||
            "This starter Next.js project includes a minimal setup for Mantine with TailwindCSS. To get started edit page.tsx file."}
        </Text>

        <div className="flex justify-center mt-10 gap-4">
          <Text c="dimmed" size="sm">
            {dict.app?.currentLanguage || "Current language"}:{" "}
            {locale === "en"
              ? dict.app?.l?.en || "English"
              : locale === "fr-CA"
                ? dict.app?.l?.frCA || "Français (Canada)"
                : locale === "es-MX"
                  ? dict.app?.l?.esMX || "Spanish (Mexico)"
                  : locale === "pt-BR"
                    ? dict.app?.l?.ptBR || "Portuguese (Brazil)"
                    : locale === "de"
                      ? dict.app?.l?.de || "German"
                      : locale === "fr"
                        ? dict.app?.l?.fr || "Français"
                        : locale === "es"
                          ? dict.app?.l?.es || "Español"
                          : locale === "pt"
                            ? dict.app?.l?.ptBR || "Português"
                            : locale.toUpperCase()}
          </Text>
        </div>

        <AppLayoutControls locale={locale} dict={dict} />
      </Stack>
    </Container>
  );
}
