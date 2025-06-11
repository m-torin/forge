import { ColorSchemesSwitcher } from "@/components/color-schemes-switcher";
import { getDictionary } from "@/i18n";
import {
  Group,
  Text,
  Title,
  Button,
} from "@mantine/core";
import Link from "next/link";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  
  return (
    <>
      <Title className="text-center mt-20">
        {dict.app.welcome}
      </Title>
      <Text
        className="text-center text-gray-700 dark:text-gray-300 max-w-[500px] mx-auto mt-xl"
        ta="center"
        size="lg"
        maw={580}
        mx="auto"
        mt="xl"
      >
        {dict.app.description}
      </Text>

      <Group justify="center" mt="xl" gap="md">
        <ColorSchemesSwitcher />
        <Button component={Link} href={`/${locale}/search`} variant="light">
          {dict.navigation.search}
        </Button>
      </Group>
    </>
  );
}
