"use client";

import { Select } from "@mantine/core";
import { usePathname, useRouter } from "next/navigation";

interface LocaleSwitcherProps {
  currentLocale: string;
  languages: {
    en: string;
    frCA: string;
    esMX: string;
    ptBR: string;
    de: string;
  };
  selectLanguagePlaceholder: string;
}

export default function LocaleSwitcher({
  currentLocale,
  languages,
  selectLanguagePlaceholder,
}: LocaleSwitcherProps) {
  const languageOptions = [
    { label: languages.en, value: "en" },
    { label: languages.frCA, value: "fr-CA" },
    { label: languages.esMX, value: "es-MX" },
    { label: languages.ptBR, value: "pt-BR" },
    { label: languages.de, value: "de" },
  ];
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (value: string | null) => {
    if (!value) return;

    // Get the current path without the locale
    const segments = pathname.split("/");
    segments[1] = value; // Replace the locale segment
    const newPath = segments.join("/") || `/${value}`;

    router.push(newPath as any);
  };

  return (
    <Select
      onChange={handleLocaleChange}
      placeholder={selectLanguagePlaceholder}
      data={languageOptions}
      size="sm"
      value={currentLocale}
      w={180}
    />
  );
}
