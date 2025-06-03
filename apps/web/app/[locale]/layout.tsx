import { AuthNavigation } from "@/components/auth/auth-navigation";
import { getDictionary } from "@/lib/dictionary";

import { HeaderSearch } from "@repo/design-system/components/search";
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
          <nav className="flex gap-4 items-center">
            <Link
              href="/"
              locale={locale}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {dictionary.template?.navigation?.home || "Home"}
            </Link>
            <Link
              href="/showcase"
              locale={locale}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Showcase
            </Link>
            <Link
              href="/registries"
              locale={locale}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Registries
            </Link>
            <Link
              href="/favorites"
              locale={locale}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Favorites
            </Link>
            <HeaderSearch
              onSelect={(item) => {
                if (item.url) {
                  window.location.href = item.url;
                }
              }}
              placeholder="Search products, users, pages..."
            />
            <AuthNavigation />
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
