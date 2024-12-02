import React from 'react'

export type TabsContextValue = {
  focusedTab: number
  tabsCount: number
  rootRef: React.RefObject<HTMLDivElement>
  listRef: React.RefObject<HTMLDivElement>
  hiddenListRef: React.RefObject<HTMLDivElement>
  item: (ref: React.RefObject<HTMLButtonElement>) => () => void
  updateFocusToNext: () => void
  updateFocusToPrevious: () => void
  onPress: (e: React.PointerEvent) => void
  onDrag: (e: React.PointerEvent) => void
  onRelease: (e: React.PointerEvent) => void
}

export const TabsContext = React.createContext<TabsContextValue | undefined>(
  undefined,
)

export const useTabsContext = () => {
  const context = React.useContext(TabsContext)
  if (!context) {
    throw new Error('useTabsContext must be used within a TabsProvider')
  }
  return context
}
