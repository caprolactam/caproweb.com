import { useLocation } from 'react-router'
import { cn } from '#app/utils/misc.ts'
import { AppBar } from './app-bar.tsx'

export function Main({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { pathname } = useLocation()

  return (
    <>
      <AppBar key={pathname} />
      <main
        className={cn(
          'mx-auto mt-8 w-full max-w-3xl grow px-4 md:mt-12 md:px-6',
          // 'mb-8 md:mb-36',
          className,
        )}
      >
        {children}
      </main>
    </>
  )
}
