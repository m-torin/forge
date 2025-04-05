import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JsonLd } from "../json-ld";

import type { Person, WithContext } from "schema-dts";

describe("JsonLd Component", () => {
  it("renders a script tag with the correct type", () => {
    const personData: WithContext<Person> = {
      name: "John Doe",
      "@type": "Person",
      "@context": "https://schema.org",
      email: "john@example.com",
      jobTitle: "Software Developer",
    };

    const { container } = render(<JsonLd code={personData} />);

    // Get the script element
    const scriptElement = container.querySelector("script");

    // Check that the script element exists
    expect(scriptElement).not.toBeNull();

    // Check that the script element has the correct type
    expect(scriptElement?.getAttribute("type")).toBe("application/ld+json");
  });

  it("renders the JSON-LD data correctly", () => {
    const personData: WithContext<Person> = {
      name: "John Doe",
      "@type": "Person",
      "@context": "https://schema.org",
      email: "john@example.com",
      jobTitle: "Software Developer",
    };

    const { container } = render(<JsonLd code={personData} />);

    // Get the script element
    const scriptElement = container.querySelector("script");

    // Check that the script element has the correct content
    const scriptContent = scriptElement?.innerHTML;
    const parsedContent = JSON.parse(scriptContent || "{}");

    // Check that the parsed content matches the original data
    expect(parsedContent).toEqual(personData);
  });

  it("handles complex nested objects", () => {
    // @ts-ignore - This is a test case with a simplified schema
    const complexData = {
      name: "Example Organization",
      "@type": "Organization",
      url: "https://example.com",
      "@context": "https://schema.org",
      address: {
        "@type": "PostalAddress",
        addressCountry: "US",
        addressLocality: "Anytown",
        addressRegion: "ST",
        postalCode: "12345",
        streetAddress: "123 Main St",
      },
      contactPoint: {
        "@type": "ContactPoint",
        areaServed: ["US", "CA", "MX"],
        availableLanguage: ["en", "es", "fr"],
        contactType: "customer service",
        telephone: "+1-234-567-8901",
      },
      logo: "https://example.com/logo.png",
    };

    const { container } = render(<JsonLd code={complexData} />);

    // Get the script element
    const scriptElement = container.querySelector("script");

    // Check that the script element has the correct content
    const scriptContent = scriptElement?.innerHTML;
    const parsedContent = JSON.parse(scriptContent || "{}");

    // Check that the parsed content matches the original data
    expect(parsedContent).toEqual(complexData);

    // Check specific nested properties
    expect(parsedContent.contactPoint["@type"]).toBe("ContactPoint");
    expect(parsedContent.contactPoint.areaServed).toEqual(["US", "CA", "MX"]);
    expect(parsedContent.address.streetAddress).toBe("123 Main St");
  });

  it("handles arrays of objects", () => {
    // @ts-ignore - This is a test case with a simplified schema
    const arrayData = {
      "@type": "ItemList",
      "@context": "https://schema.org",
      itemListElement: [
        {
          name: "Item 1",
          "@type": "ListItem",
          url: "https://example.com/item1",
          position: 1,
        },
        {
          name: "Item 2",
          "@type": "ListItem",
          url: "https://example.com/item2",
          position: 2,
        },
        {
          name: "Item 3",
          "@type": "ListItem",
          url: "https://example.com/item3",
          position: 3,
        },
      ],
    };

    const { container } = render(<JsonLd code={arrayData} />);

    // Get the script element
    const scriptElement = container.querySelector("script");

    // Check that the script element has the correct content
    const scriptContent = scriptElement?.innerHTML;
    const parsedContent = JSON.parse(scriptContent || "{}");

    // Check that the parsed content matches the original data
    expect(parsedContent).toEqual(arrayData);

    // Check array length
    expect(parsedContent.itemListElement.length).toBe(3);

    // Check specific array items
    expect(parsedContent.itemListElement[0].position).toBe(1);
    expect(parsedContent.itemListElement[1].name).toBe("Item 2");
    expect(parsedContent.itemListElement[2].url).toBe(
      "https://example.com/item3",
    );
  });
});
