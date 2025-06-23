'use client';

import React, { PropsWithChildren } from 'react';

interface GuestsLayoutProperties extends PropsWithChildren {
  readonly modal: React.ReactNode;
}

export default function GuestsLayout({ children, modal }: GuestsLayoutProperties) {
  return (
    <>
      {children}
      {/* Modal slot for intercepting routes */}
      {modal}
    </>
  );
}
