import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { VercelToolbar } from '@vercel/toolbar/next'
import theme from './theme'
import './globals.css'
import cx from 'utils/cx'
import { AppLayout } from '../components/AppLayout'
import { getWorkflows } from '../lib/workflows'

export const metadata: Metadata = {
  title: 'Upstash Workflow Demo',
  description: 'Upstash Workflow demonstration with Mantine UI',
  icons: {
    icon: '/favicon-32x32.png',
  },
}

export const dynamic = 'force-dynamic'

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
    <html
      lang="en"
      {...mantineHtmlProps}
      className={cx('scroll-smooth', defaultFont.variable)}
    >
      <head>
        <ColorSchemeScript />
      </head>
      <body
        className="text-sm antialiased sm:text-base"
        suppressHydrationWarning={true}
      >
        <MantineProvider theme={theme}>
          <Notifications />
          <AppLayout workflows={workflows}>{children}</AppLayout>
          {process.env.NODE_ENV === 'development' && <VercelToolbar />}
        </MantineProvider>
      </body>
    </html>
  )
}
