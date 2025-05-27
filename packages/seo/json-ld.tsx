import React from 'react';

import type { Thing, WithContext } from 'schema-dts';

interface JsonLdProps {
  code: WithContext<Thing>;
}

export const JsonLd = ({ code }: JsonLdProps) => (
  <script dangerouslySetInnerHTML={{ __html: JSON.stringify(code) }} type="application/ld+json" />
);

export * from 'schema-dts';
