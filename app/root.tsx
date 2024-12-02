import { ThemeProvider } from 'next-themes'
import {
  type LinksFunction,
  type MetaFunction,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'
import markdownStyles from '#app/styles/markdown.css?url'
import { AppBarProvider } from './components/parts/app-bar.tsx'
import { Footer } from './components/parts/footer.tsx'
import { Main } from './components/parts/misc.tsx'
import { Spinner } from './components/parts/spinner.tsx'
import { GeneralErrorBoundary } from './components/templates/error-boundary.tsx'
import styles from './styles/tailwind.css?url'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  { rel: 'stylesheet', href: markdownStyles },
  { rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png' },
  {
    rel: 'preload',
    as: 'font',
    href: '/fonts/inter.woff2',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'preload',
    as: 'font',
    href: '/fonts/commit-mono.woff2',
    crossOrigin: 'anonymous',
  },
  { rel: 'icon', type: 'image/svg+xml', href: '/favicons/favicon.svg' },
]

export const meta: MetaFunction = () => {
  return [
    { title: 'Capro Web' },
    { name: 'description', content: 'Something about the Web' },
  ]
}

export const handle = {
  breadcrumb: 'ホーム',
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang='ja'
      className='scroll-pt-14'
      suppressHydrationWarning
    >
      <head>
        <meta charSet='utf-8' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1'
        />
        <meta
          name='referrer'
          content='no-referrer'
        />
        <Meta />
        <Links />
      </head>
      <body className='flex min-h-screen flex-col bg-brand-1 text-brand-12 antialiased'>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <AppBarProvider>
            <Main>{children}</Main>
            <Footer className='shrink-0' />
            <Spinner />
            <ScrollRestoration />
          </AppBarProvider>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />
}
