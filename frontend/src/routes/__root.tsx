import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { getThemeServerFn } from '@/lib/theme'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Nibbly',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  loader: () => getThemeServerFn(),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const theme = Route.useLoaderData()
  return (
    <html lang="en" className={theme}>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>

        <Toaster />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
