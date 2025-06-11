import {
  Container,
  Title,
} from "@mantine/core";
import { getDictionary } from "@/i18n";
import SearchPageUi from "./SearchPageUi";

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q } = await searchParams;
  const dict = await getDictionary(locale);

  return (
    <Container size="md" mt="xl">
      <Title order={1} mb="xl">
        {dict.search.title}
      </Title>
      
      <SearchPageUi
        initialQuery={q}
        translations={dict.search}
      />
    </Container>
  );
}