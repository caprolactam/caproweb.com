import styles from './tag-list.module.css'

function Root({ children }: { children: React.ReactNode }) {
  return <ul className={styles.list}>{children}</ul>
}

type ItemProps = {
  label: string
  href: string
}

function Item({ label, href }: ItemProps) {
  return (
    <li>
      <a href={href} className={styles.link} data-astro-prefetch='hover'>
        {label}
      </a>
    </li>
  )
}

export const TagList = {
  Root,
  Item,
}
