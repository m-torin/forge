'use client'

import * as Headless from '@headlessui/react'
import NextLink, { type LinkProps } from 'next/link'
import React, { forwardRef } from 'react'

export const Link = forwardRef(function Link(
  props: LinkProps & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  const closeHeadless = Headless.useClose()

  return (
    <Headless.DataInteractive>
      <NextLink
        {...props}
        ref={ref}
        onClick={(e) => {
          if (props.onClick) {
            props.onClick(e)
          }
          // Prevent default if the link is not a valid URL
          if (e.defaultPrevented) {
            return
          }
          // Prevent default if the link is a hash link
          if (props.href && typeof props.href === 'string' && props.href.startsWith('#')) {
            return
          }

          // Close the headlessui menu and aside
          closeHeadless()
        }}
        href={props.href ?? '#'}
      />
    </Headless.DataInteractive>
  )
})
