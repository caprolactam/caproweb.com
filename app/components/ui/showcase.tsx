import { cn } from '@/lib/utils.ts'

export function Showcase({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      className={cn(
        'not-prose bg-brand-2 my-[1.25em] rounded-md p-2 md:p-4',
        className,
      )}
    >
      {children}
    </div>
  )
}
