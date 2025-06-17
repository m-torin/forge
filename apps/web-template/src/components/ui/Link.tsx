'use client';

import NextLink, { type LinkProps } from 'next/link';
import React, { forwardRef } from 'react';

export const Link = forwardRef(function Link(
  props: LinkProps<string> & React.ComponentPropsWithoutRef<'a'> & { 'data-testid'?: string },
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  const { 'data-testid': testId = 'link', ...linkProps } = props;

  // Fail silently if no href
  if (!props.href) {
    return null;
  }

  return <NextLink {...linkProps} data-testid={testId} href={props.href} ref={ref} />;
});
