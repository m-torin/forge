import { getDictionary } from "@/lib/dictionary";

import { Link } from "@repo/internationalization/client";

import type { ReactNode } from "react";

interface LocaleLayoutProperties {
  readonly children: ReactNode;
  readonly params: Promise<{
    locale: string;
  }>;
}

const LocaleLayout = async ({ children, params }: LocaleLayoutProperties) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <>
      <header className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Template App</h1>
            <p className="text-sm text-gray-600">
              {dictionary.common?.language || "Language"}:{" "}
              {dictionary.common?.locale || locale}
            </p>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/"
              locale={locale}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {dictionary.template?.navigation?.home || "Home"}
            </Link>
            <Link
              href="/about"
              locale={locale}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {dictionary.template?.navigation?.about || "About"}
            </Link>
          </nav>
        </div>
      </header>
      <main className="min-h-screen">{children}</main>
      <footer className="p-4 border-t text-center text-sm text-gray-600">
        © 2024 Template App
      </footer>
    </>
  );
};

export default LocaleLayout;
