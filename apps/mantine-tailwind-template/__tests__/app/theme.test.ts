import { describe, expect, test } from "vitest";

describe("theme", () => {
  test("exports theme object", async () => {
    const theme = (await import("#/app/theme")).default;
    expect(theme).toBeDefined();
    expect(typeof theme).toBe("object");
  });

  test("theme has custom colors", async () => {
    const theme = (await import("#/app/theme")).default;

    expect(theme.colors).toBeDefined();
    expect(typeof theme.colors).toBe("object");
  });

  test("theme has custom breakpoints", async () => {
    const theme = (await import("#/app/theme")).default;

    expect(theme.breakpoints).toBeDefined();
    expect(theme.breakpoints?.xs).toBe("30em");
    expect(theme.breakpoints?.sm).toBe("48em");
  });

  test("theme structure is valid", async () => {
    const theme = (await import("#/app/theme")).default;
    expect(theme).toBeTruthy();
    expect(typeof theme).toBe("object");
  });

  test("theme is a Mantine theme object", async () => {
    const theme = (await import("#/app/theme")).default;
    expect(theme).toHaveProperty("colors");
    expect(theme).toHaveProperty("breakpoints");
  });
});
