'use client';

import React from 'react';

import type { ReactNode } from 'react';

interface GuestsLayoutProperties {
  readonly children: ReactNode;
  readonly modal: ReactNode;
}

export default function GuestsLayout({
  children,
  modal,
}: GuestsLayoutProperties): React.ReactElement {
  return (
    <>
      {children}
      {/* Modal slot for intercepting routes */}
      {modal}
    </>
  );
}
