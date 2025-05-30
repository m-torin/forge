'use client';

import * as Headless from '@headlessui/react';
import NextLink from 'next/link';
import React, { forwardRef } from 'react';

export const Link = forwardRef(function Link(
  props: Omit<React.ComponentProps<typeof NextLink>, 'href'> & { href: string },
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  const closeHeadless = Headless.useClose();

  return (
    <Headless.DataInteractive>
      <NextLink
        {...props}
        href={(props.href as any) ?? '#'}
        ref={ref}
        onClick={(e) => {
          if (props.onClick) {
            props.onClick(e);
          }
          // Prevent default if the link is not a valid URL
          if (e.defaultPrevented) {
            return;
          }
          // Prevent default if the link is a hash link
          if (props.href && typeof props.href === 'string' && props.href.startsWith('#')) {
            return;
          }

          // Close the headlessui menu and aside
          closeHeadless();
        }}
      />
    </Headless.DataInteractive>
  );
});
