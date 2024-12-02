import { type MotionValue } from 'framer-motion'
import React from 'react'

export const tabValues = ['tab1', 'tab2', 'tab3', 'tab4'] as const
export type Tab = (typeof tabValues)[number]
export type Status = 'paused' | 'playing' | 'finished'

type TabsContextValue = {
  scrollContentRef: React.RefObject<HTMLDivElement>
  contentListRef: React.RefObject<HTMLDivElement>
  progress: MotionValue
  value: string
  status: Status
  visible: boolean
  item: (ref: React.RefObject<HTMLDivElement>) => () => void
  handlePlayPause: () => void
  setCanAutoPlay: React.Dispatch<React.SetStateAction<boolean>>
  pauseAutoPlay: () => void
  playAutoPlay: () => void
  onClose?: () => void
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

export const tabs: Record<
  Tab,
  {
    apiUrl: string
    citeUrl: string
    alt: string
    photographer: string
  }
> = {
  tab1: {
    citeUrl:
      'https://unsplash.com/photos/empty-pathway-in-between-stores-wfwUpfVqrKU',
    apiUrl:
      'https://images.unsplash.com/photo-1533050487297-09b450131914?q=80&auto=format&w=672',
    photographer: 'Alex Knight',
    alt: 'empty pathway in between stores',
  },
  tab2: {
    citeUrl: 'https://unsplash.com/photos/lighted-chinese-lantern-5-GNa303REg',
    apiUrl:
      'https://images.unsplash.com/photo-1534214526114-0ea4d47b04f2?q=80&auto=format&w=526',
    alt: 'lighted Chinese lantern',
    photographer: 'Alex Knight',
  },
  tab3: {
    citeUrl: 'https://unsplash.com/photos/group-of-people-standing-To5wAJDt1IM',
    apiUrl:
      'https://images.unsplash.com/photo-1542052125323-e69ad37a47c2?q=80&auto=format&w=526',
    alt: 'group of people standing',
    photographer: 'Jezael Melgoza',
  },
  tab4: {
    citeUrl:
      'https://unsplash.com/photos/japanese-lantern-over-city-bike-at-nighttime-oCZHIa1D4EU',
    apiUrl:
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&auto=format&w=526',
    alt: 'Japanese lantern over city bike at nighttime',
    photographer: 'Jase Bloor',
  },
}
