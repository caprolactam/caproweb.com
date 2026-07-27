import type React from 'react'
import styles from './sidebar-layout.module.css'

function Container({
  children,
  gap = '8px',
  minContentWidth = '50%',
  baseSidebarWidth = '320px',
}: {
  children: React.ReactNode
  gap?: string
  minContentWidth?: string
  baseSidebarWidth?: string
}) {
  return (
    <div
      className={styles.container}
      style={
        {
          '--gap': gap,
          '--min-content-width': minContentWidth,
          '--base-sidebar-width': baseSidebarWidth,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}

function Content({ children }: { children: React.ReactNode }) {
  return <div className={styles.content}>{children}</div>
}

function Sidebar({ children }: { children: React.ReactNode }) {
  return <div className={styles.sidebar}>{children}</div>
}

export const SidebarLayout = {
  Container,
  Content,
  Sidebar,
}
