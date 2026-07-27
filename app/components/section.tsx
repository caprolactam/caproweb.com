import styles from './section.module.css'

function Root({ children }: { children: React.ReactNode }) {
  return <section>{children}</section>
}

function Heading({ children }: { children: React.ReactNode }) {
  return <h2 className={styles.heading}>{children}</h2>
}

function Supporting({ children }: { children: React.ReactNode }) {
  return <span className={styles.supporting}>{children}</span>
}

export const Section = {
  Root,
  Heading,
  Supporting,
}
