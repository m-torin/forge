import { beforeEach, describe, expect, it, vi } from "vitest";

import languine from "../languine.json";
import { type Dictionary, getDictionary, locales } from "../test-utils";

// Import the mocked modules
vi.mock("../languine.json", () => ({
  default: {
    locale: {
      source: "en",
      targets: ["es", "de", "zh", "fr", "pt"],
    },
  },
}));

describe("Internationalization", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("locales", () => {
    it("exports the correct locales array", () => {
      expect(locales).toEqual(["en", "es", "de", "zh", "fr", "pt"]);
    });

    it("includes the source locale from languine.json", () => {
      expect(locales).toContain(languine.locale.source);
    });

    it("includes all target locales from languine.json", () => {
      languine.locale.targets.forEach((locale) => {
        expect(locales).toContain(locale);
      });
    });
  });

  describe("getDictionary", () => {
    it('returns the English dictionary when "en" locale is provided', async () => {
      const dictionary = await getDictionary("en");

      expect(dictionary).toBeDefined();
      expect(dictionary.web.global.primaryCta).toBe("Book a call");
      expect(dictionary.web.header.home).toBe("Home");
    });

    it('returns the Spanish dictionary when "es" locale is provided', async () => {
      const dictionary = await getDictionary("es");

      expect(dictionary).toBeDefined();
      expect(dictionary.web.global.primaryCta).toBe("Reservar una llamada");
      expect(dictionary.web.header.home).toBe("Inicio");
    });

    it('returns the German dictionary when "de" locale is provided', async () => {
      const dictionary = await getDictionary("de");

      expect(dictionary).toBeDefined();
      expect(dictionary.web.global.primaryCta).toBe("Anruf buchen");
      expect(dictionary.web.header.home).toBe("Startseite");
    });

    it('returns the French dictionary when "fr" locale is provided', async () => {
      const dictionary = await getDictionary("fr");

      expect(dictionary).toBeDefined();
      expect(dictionary.web.global.primaryCta).toBe("Réserver un appel");
      expect(dictionary.web.header.home).toBe("Accueil");
    });

    it('returns the Portuguese dictionary when "pt" locale is provided', async () => {
      const dictionary = await getDictionary("pt");

      expect(dictionary).toBeDefined();
      expect(dictionary.web.global.primaryCta).toBe("Agendar uma chamada");
      expect(dictionary.web.header.home).toBe("Início");
    });

    it('returns the Chinese dictionary when "zh" locale is provided', async () => {
      const dictionary = await getDictionary("zh");

      expect(dictionary).toBeDefined();
      expect(dictionary.web.global.primaryCta).toBe("预约通话");
      expect(dictionary.web.header.home).toBe("首页");
    });

    it("throws an error when an invalid locale is provided", async () => {
      await expect(getDictionary("invalid-locale")).rejects.toThrow();
    });
  });

  describe("Dictionary type", () => {
    it("has the correct structure", async () => {
      const dictionary = await getDictionary("en");

      // Check that the dictionary matches the Dictionary type
      const typedDictionary: Dictionary = dictionary;

      expect(typedDictionary).toHaveProperty("web");
      expect(typedDictionary.web).toHaveProperty("global");
      expect(typedDictionary.web).toHaveProperty("header");
    });
  });
});
