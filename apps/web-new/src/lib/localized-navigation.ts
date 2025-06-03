import {
  getNavigation,
  type TNavigationItem,
} from "@repo/design-system/ciseco/data/navigation";

// Helper function to add locale prefix to navigation items recursively
function localizeNavigationItems(
  items: TNavigationItem[],
  locale: string,
): TNavigationItem[] {
  return items.map((item) => ({
    ...item,
    children: item.children
      ? localizeNavigationItems(item.children, locale)
      : undefined,
    href:
      item.href && item.href !== "#" && item.href !== "/#"
        ? `/${locale}${item.href}`
        : item.href,
  }));
}

// Create a localized version of getNavigation
export async function getLocalizedNavigation(
  locale = "en",
): Promise<TNavigationItem[]> {
  const navigation = await getNavigation();
  return localizeNavigationItems(navigation, locale);
}

// Create a localized version of getNavMegaMenu
export async function getLocalizedNavMegaMenu(
  locale = "en",
): Promise<TNavigationItem> {
  const navigation = await getLocalizedNavigation(locale);

  // Find the mega menu item in the navigation array
  return navigation[4];
}
