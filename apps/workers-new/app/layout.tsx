import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import theme from './theme'
import './globals.css'
import cx from '../utils/cx'
import { AppLayout } from '../components/AppLayout'
import { WorkflowsProvider } from '../contexts/WorkflowsContext'
import { getWorkflows } from '../lib/workflows'

export const metadata: Metadata = {
  title: 'Workers New - Upstash Workflow',
  description: 'Clean Upstash Workflow implementation with Mantine + Tailwind',
  icons: {
    icon: '/favicon-32x32.png',
  },
}

const defaultFont = Inter({
  variable: '--font-inter',
  display: 'swap',
  style: 'normal',
  subsets: ['latin-ext'],
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Server component - get workflows at build/request time
  const workflows = await getWorkflows()

  return (
    <html lang="en" {...mantineHtmlProps} className={cx('scroll-smooth', defaultFont.variable)}>
      <head>
        <ColorSchemeScript />
      </head>
      <body className="antialiased text-sm sm:text-base">
        <MantineProvider theme={theme}>
          <Notifications />
          <WorkflowsProvider workflows={workflows}>
            <AppLayout workflows={workflows}>
              {children}
            </AppLayout>
          </WorkflowsProvider>
        </MantineProvider>
      </body>
    </html>
  )
}
