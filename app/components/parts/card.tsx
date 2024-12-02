import { Link } from 'react-router'
import { cn } from '#app/utils/misc.ts'
import { Icon } from './icon.tsx'

function CardRoot({ children }: { children: React.ReactNode }) {
  return <div className='relative flex min-h-14 flex-col py-2'>{children}</div>
}

type CardTitleProps = {
  title: string
}
function CardTitle({ title }: CardTitleProps) {
  return <h3 className='text-sm font-bold'>{title}</h3>
}

const linkClassname =
  'inline-flex items-start gap-1 anchor before:absolute before:inset-0'

type CardTitleWithLinkProps = Omit<
  React.ComponentPropsWithoutRef<typeof Link>,
  'children'
> &
  CardTitleProps

function CardTitleWithLink({
  title,
  className,
  ...props
}: CardTitleWithLinkProps) {
  return (
    <Link
      className={cn(linkClassname, className)}
      {...props}
    >
      <CardTitle title={title} />
    </Link>
  )
}

type CardTitleWithAnchorProps = Omit<
  React.ComponentPropsWithoutRef<'a'>,
  'href' | 'children'
> & {
  href: string
} & CardTitleProps

function CardTitleWithAnchor({
  title,
  className,
  target = '_blank',
  rel = 'noreferrer noopener',
  ...props
}: CardTitleWithAnchorProps) {
  return (
    <a
      target={target}
      rel={rel}
      className={cn(linkClassname, className)}
      {...props}
    >
      <CardTitle title={title} />
      <Icon
        name='open-in-new'
        size={16}
      />
    </a>
  )
}

type CardDescriptionProps = {
  description: string
}
function CardDescription({ description }: CardDescriptionProps) {
  return <p className='text-sm text-brand-11'>{description}</p>
}

export { CardRoot, CardTitleWithLink, CardTitleWithAnchor, CardDescription }

export type {
  CardTitleWithLinkProps,
  CardTitleWithAnchorProps,
  CardDescriptionProps,
}
