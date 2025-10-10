import { LanguageSwitcher } from "#/components/language-switcher";
import { MantineProvider, createTheme } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

const theme = createTheme({});

function renderWithMantine(ui: React.ReactElement) {
  return render(<MantineProvider theme={theme}>{ui}</MantineProvider>);
}

// Mock internationalization hooks
vi.mock("@repo/internationalization/client/next", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/en",
  useLocale: () => "en" as const,
  useChangeLocale: () => vi.fn(),
  useCurrentLocale: () => "en" as const,
}));

describe("languageSwitcher", () => {
  test("renders language switcher menu", () => {
    renderWithMantine(<LanguageSwitcher />);

    expect(screen.getByTestId("mantine-menu")).toBeInTheDocument();
  });

  test("displays available languages", () => {
    renderWithMantine(<LanguageSwitcher />);

    expect(screen.getByText("🇺🇸 English")).toBeInTheDocument();
    expect(screen.getByText("🇪🇸 Español")).toBeInTheDocument();
    expect(screen.getByText("🇩🇪 Deutsch")).toBeInTheDocument();
    expect(screen.getByText("🇫🇷 Français")).toBeInTheDocument();
    expect(screen.getByText("🇵🇹 Português")).toBeInTheDocument();
  });

  test("has menu label", () => {
    renderWithMantine(<LanguageSwitcher />);

    expect(screen.getByText("Select Language")).toBeInTheDocument();
  });
});
