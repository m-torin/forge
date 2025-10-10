'use client';

import { useAside } from '@/components/aside';
import * as Headless from '@headlessui/react';
import NextLink, { type LinkProps } from 'next/link';
import React, { forwardRef } from 'react';

export const Link = forwardRef(function Link(
  props: LinkProps<any> & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  const closeHeadless = Headless.useClose();
  const aside = useAside();

  return (
    <Headless.DataInteractive>
      <NextLink
        {...props}
        ref={ref}
        onClick={e => {
          if (props.onClick) {
            props.onClick(e);
          }
          // Close the headlessui menu
          closeHeadless();
          // Close all the aside if it's open
          aside.close();
        }}
      />
    </Headless.DataInteractive>
  );
});
