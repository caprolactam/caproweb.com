import * as Avatar from '@radix-ui/react-avatar'
import { useTheme } from 'next-themes'
import { BreadCrumbs } from '#app/utils/breadcrumb.tsx'
import { cn } from '#app/utils/misc.ts'
import { IconAnchor } from './icon-button.tsx'

export function Footer({ className }: { className?: string }) {
  const year = new Date().getFullYear()
  const { resolvedTheme } = useTheme()

  return (
    <footer
      className={cn(
        'mx-auto w-full max-w-3xl px-4 text-sm text-brand-12 md:px-6',
        className,
      )}
    >
      <BreadCrumbs />
      <div className='flex h-14 min-w-0 flex-nowrap items-center justify-between gap-2 border-t border-brand-6'>
        <div className='grow text-sm'>{`© ${year} caprolactam`}</div>
        <IconAnchor
          href='https://github.com/caprolactam'
          label='GitHubアカウント'
          variant='ghost'
          size='md'
          className='shrink-0'
        >
          <Avatar.Root>
            <Avatar.Image
              className='size-6'
              src={
                resolvedTheme === 'light'
                  ? '/github-for-light.svg'
                  : '/github-for-dark.svg'
              }
              alt='GitHubのロゴ'
            />
            <Avatar.Fallback className='size-6 text-sm'>GH</Avatar.Fallback>
          </Avatar.Root>
        </IconAnchor>
        <IconAnchor
          href='https://x.com/derivesfrom'
          label='Xアカウント'
          variant='ghost'
          size='md'
          className='shrink-0'
        >
          <Avatar.Root>
            <Avatar.Image
              className='size-[18px] translate-y-0.5'
              src={
                resolvedTheme === 'light'
                  ? '/x-for-light.png'
                  : '/x-for-dark.png'
              }
              alt='Xのロゴ'
            />
            <Avatar.Fallback className='size-6 text-sm'>X</Avatar.Fallback>
          </Avatar.Root>
        </IconAnchor>
      </div>
    </footer>
  )
}
