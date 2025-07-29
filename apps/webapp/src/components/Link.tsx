'use client';

import { Link as SharedLink } from '@/shared/link';
import { type LinkProps } from 'next/link';
import React, { forwardRef } from 'react';

export const Link = forwardRef(function Link(
  props: LinkProps<any> & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>,
) {
  return <SharedLink ref={ref} {...props} />;
});
