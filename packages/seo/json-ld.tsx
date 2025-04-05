import type { Thing, WithContext } from "schema-dts";

interface JsonLdProps {
  // Allow any JSON-LD data for testing purposes
  code: WithContext<Thing> | Record<string, any>;
}

export const JsonLd = ({ code }: JsonLdProps) => (
  <script
    // biome-ignore lint/security/noDangerouslySetInnerHtml: "This is a JSON-LD script, not user-generated content."
    dangerouslySetInnerHTML={{ __html: JSON.stringify(code) }}
    type="application/ld+json"
  />
);

export * from "schema-dts";
