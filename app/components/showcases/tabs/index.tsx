import React from 'react'
import { Card } from '#app/components/parts/card.tsx'
import { IconButton } from '#app/components/parts/icon-button.tsx'
import { Icon } from '#app/components/parts/icon.tsx'
import {
  RadioGroup,
  RadioGroupItem,
} from '#app/components/parts/radio-group.tsx'
import { cn, strictEntries } from '../utils/misc.ts'
import * as Tabs from './tabs.tsx'

const items = [
  'Chrome',
  'Firefox',
  'Opera',
  'Edge',
  'Safari',
  'Chromium',
  'Waterfox',
  'Brave',
  'Tor',
  'Puffin',
  'FreeNet',
  'Vivaldi',
  'Epic',
] as const
type Item = (typeof items)[number]

type IndicatorSize = NonNullable<Tabs.TabsProps['indicatorSize']>

const indicatorSizes = {
  tab: 'タブ',
  text: 'テキスト',
} satisfies Record<IndicatorSize, string>

export function TabsDemo() {
  const [selected, setSelected] = React.useState<Item>(items[0])
  const [lists, setLists] = React.useState<Array<Item>>(() => items.slice(0, 5))
  const [indicatorSize, setIndicatorSize] =
    React.useState<IndicatorSize>('text')
  const candidates = items.filter((item) => !lists.includes(item))

  return (
    <Card className='not-prose rounded-md bg-brand-2'>
      <Tabs.Root
        className='relative'
        value={selected}
        onValueChange={(v) => {
          if (items.includes(v)) {
            setSelected(v as Item)
          }
        }}
        indicatorSize={indicatorSize}
      >
        <Tabs.List
          className='flex min-w-full flex-nowrap'
          aria-label='ブラウザの詳細'
        >
          {lists.map((item) => (
            <Tabs.Trigger
              key={item}
              className={cn(
                'relative inline-flex grow select-none items-center justify-center whitespace-nowrap px-2 text-sm font-medium text-brand-12 md:px-4',
                // animations
                'transition-colors duration-150 ease-ease hover:bg-brand-4 focus-visible:bg-brand-5 active:bg-brand-5 data-[state=active]:text-brand-add-text',
              )}
              value={item}
            >
              {item}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content
          value={selected}
          asChild
        >
          <Card className='grid grid-cols-2 gap-4 text-base'>
            <div className='col-span-full grid grid-cols-subgrid gap-2'>
              <p>タブの数</p>
              <div className='flex select-none items-center gap-1 justify-self-end text-sm'>
                <IconButton
                  label='タブを追加'
                  variant='ghost'
                  type='button'
                  size='sm'
                  onClick={() => {
                    const length = candidates.length
                    if (length === 0) return
                    const nextIndex = Math.floor(Math.random() * length)
                    const addingItem = candidates[nextIndex]
                    if (addingItem == null) return
                    setLists((prev) => [...prev, addingItem])
                  }}
                  disabled={candidates.length === 0}
                >
                  <Icon
                    name='add'
                    size={24}
                  />
                </IconButton>
                {lists.length}
                <IconButton
                  label='タブを減らす'
                  variant='ghost'
                  size='sm'
                  type='button'
                  onClick={() => {
                    if (lists.length === 1) return
                    // if the selected tab is removed, select the last tab
                    const selectedTabPosition = lists.indexOf(selected)
                    if (selectedTabPosition === -1) return
                    const isLastPosition =
                      selectedTabPosition === lists.length - 1
                    if (isLastPosition) {
                      setSelected(lists[lists.length - 2]!)
                    }
                    setLists(() => lists.slice(0, -1))
                  }}
                  disabled={lists.length === 1}
                >
                  <Icon
                    name='remove'
                    size={24}
                  />
                </IconButton>
              </div>
            </div>
            <div className='col-span-full grid grid-cols-subgrid gap-2'>
              <p>インジケーターのサイズ</p>
              <RadioGroup
                value={indicatorSize}
                onValueChange={(v) => {
                  if (Object.keys(indicatorSizes).includes(v)) {
                    setIndicatorSize(v as IndicatorSize)
                  }
                }}
                className='grid gap-2 justify-self-end'
              >
                {strictEntries(indicatorSizes).map(([option, label]) => (
                  <label
                    key={option}
                    className='flex h-10 cursor-pointer select-none items-center gap-2 text-sm'
                    htmlFor={option}
                  >
                    <RadioGroupItem
                      value={option}
                      id={option}
                    />
                    {label}
                  </label>
                ))}
              </RadioGroup>
            </div>
          </Card>
        </Tabs.Content>
      </Tabs.Root>
    </Card>
  )
}
