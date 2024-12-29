import React from 'react'
import { Card } from '#app/components/parts/card.tsx'
import {
  RadioGroup,
  RadioGroupItem,
} from '#app/components/parts/radio-group.tsx'
import { Switch } from '#app/components/parts/switch.tsx'
import { cn, strictEntries, useHydrated } from '../utils/misc.ts'
import * as TabsByHiddenList from './animation-by-hidden-list.tsx'
import * as TabsByListIndicator from './animation-by-list-indicator.tsx'
import * as TabsByIndicator from './animation-by-trigger-indicator.tsx'
import {
  type Indicator,
  type ExtendedIndicator,
  triggerStyles,
  indicatorContainerStyles,
  indicatorStyles,
  triggerLabelStyles,
} from './base.tsx'

const items = ['Chrome', 'Edge', 'Firefox', 'Safari'] as const
const DEFAULT_ITEM = items[0] satisfies Item
type Item = (typeof items)[number]

const indicatorTypes = {
  underline: '下線',
  background: 'バックグラウンド',
} satisfies Record<Indicator, string>
const DEFAULT_INDICATOR = 'underline' satisfies Indicator
const extendedIndicatorTypes = {
  ...indicatorTypes,
  'inverse-background': 'テキスト反転',
} satisfies Record<ExtendedIndicator, string>

const easings = {
  linear: 'linear',
  ease: 'ease',
  'ease-in': `cubic-bezier(${[0.55, 0.055, 0.675, 0.19].join(',')})`,
  'ease-out': `cubic-bezier(${[0.25, 0.61, 0.355, 1].join(',')})`,
  'ease-in-out': `cubic-bezier(${[0.645, 0.045, 0.355, 1].join(',')})`,
} satisfies Record<string, string>
const DEFAULT_EASING = 'ease-out' satisfies Easing
type Easing = GetKeys<typeof easings>

const durations = {
  '100ms': 100,
  '150ms': 150,
  '200ms': 200,
  '250ms': 250,
  '300ms': 300,
  '350ms': 350,
  '2s': 2000,
} as const
const DEFAULT_DURATION = '200ms' satisfies Duration
type Duration = keyof typeof durations

type GetKeys<T extends { [key: string]: unknown }> = keyof T
// source: https://zenn.dev/ossamoon/articles/694a601ee62526
function getKeys<T extends { [key: string]: unknown }>(obj: T): (keyof T)[] {
  return Object.keys(obj)
}

export function TabsByListIndicatorDemo() {
  const [selected, setSelected] = React.useState<Item>(DEFAULT_ITEM)
  const [separated, setSeparated] = React.useState(false)
  const [indicator, setIndicator] = React.useState<Indicator>(DEFAULT_INDICATOR)
  const [duration, setDuration] = React.useState<Duration>(DEFAULT_DURATION)
  const [easing, setEasing] = React.useState<Easing>(DEFAULT_EASING)

  return (
    <TabsByListIndicator.Root
      value={selected}
      onValueChange={(v) => {
        if (items.includes(v)) {
          setSelected(v as Item)
        }
      }}
      indicator={indicator}
      duration={durations[duration]}
      easing={easings[easing]}
      _separated={separated}
    >
      <div className='overflow-x-auto overflow-y-hidden border-b border-brand-7'>
        <TabsByListIndicator.List
          className={cn(
            'isolate grid grid-cols-4',
            separated ? 'grid-rows-2' : '',
          )}
          aria-label='ブラウザの詳細'
        >
          {items.map((item) => (
            <div
              key={item}
              className='relative row-span-full grid grid-rows-subgrid'
            >
              <TabsByListIndicator.Trigger value={item}>
                {item}
              </TabsByListIndicator.Trigger>
            </div>
          ))}
        </TabsByListIndicator.List>
      </div>
      {items.map((item) => (
        <TabsByListIndicator.Content
          key={item}
          value={item}
        />
      ))}
      <Settings>
        <SeparateTabsSwitch
          separated={separated}
          handleSeparated={setSeparated}
        />
        <IndicatorRadioGroup
          indicator={indicator}
          handleIndicator={setIndicator}
          options={indicatorTypes}
        />
        <DurationRadioGroup
          duration={duration}
          handleDuration={setDuration}
          options={getKeys(durations)}
        />
        <EasingRadioGroup
          easing={easing}
          handleEasing={setEasing}
          options={getKeys(easings)}
        />
      </Settings>
    </TabsByListIndicator.Root>
  )
}

export function TabsByIndicatorDemo() {
  const [selected, setSelected] = React.useState<Item>(DEFAULT_ITEM)
  const [separated, setSeparated] = React.useState(false)
  const [indicator, setIndicator] = React.useState<Indicator>(DEFAULT_INDICATOR)
  const [duration, setDuration] = React.useState<Duration>(DEFAULT_DURATION)
  const [easing, setEasing] = React.useState<Easing>(DEFAULT_EASING)

  const id = React.useId()
  const getTabLabel = (item: string) => `tab-${item}-${id}`

  return (
    <TabsByIndicator.Root
      value={selected}
      onValueChange={(v) => {
        if (items.includes(v)) {
          setSelected(v as Item)
        }
      }}
      duration={durations[duration]}
      easing={easings[easing]}
    >
      <div className='overflow-x-auto overflow-y-hidden border-b border-brand-7'>
        <TabsByIndicator.List
          className={cn(
            'isolate grid grid-cols-4',
            separated ? 'grid-rows-4' : '',
          )}
          aria-label='ブラウザの詳細'
        >
          {items.map((item, index) => (
            <div
              key={item}
              className='relative row-span-full grid grid-rows-subgrid'
            >
              <TabsByIndicator.Trigger
                className={cn(triggerStyles, 'before:absolute before:inset-0')}
                value={item}
                aria-labelledby={getTabLabel(item)}
                style={{
                  gridRowStart: separated ? index + 1 : undefined,
                }}
              >
                <div className={cn(indicatorContainerStyles({ indicator }))}>
                  <TabsByIndicator.Indicator
                    className={cn(
                      indicatorStyles({
                        indicator,
                      }),
                      separated && 'bg-brand-6 opacity-100',
                    )}
                  />
                  <span
                    className={cn(triggerLabelStyles({ indicator }))}
                    id={getTabLabel(item)}
                  >
                    {item}
                  </span>
                </div>
              </TabsByIndicator.Trigger>
            </div>
          ))}
        </TabsByIndicator.List>
      </div>
      {items.map((item) => (
        <TabsByIndicator.Content
          key={item}
          value={item}
        />
      ))}
      <Settings>
        <SeparateTabsSwitch
          separated={separated}
          handleSeparated={setSeparated}
        />
        <IndicatorRadioGroup
          indicator={indicator}
          handleIndicator={setIndicator}
          options={indicatorTypes}
        />
        <DurationRadioGroup
          duration={duration}
          handleDuration={setDuration}
          options={getKeys(durations)}
        />
        <EasingRadioGroup
          easing={easing}
          handleEasing={setEasing}
          options={getKeys(easings)}
        />
      </Settings>
    </TabsByIndicator.Root>
  )
}

export function TabsByHiddenListDemo() {
  const [selected, setSelected] = React.useState<Item>(DEFAULT_ITEM)
  const [separated, setSeparated] = React.useState(false)
  const [indicator, setIndicator] =
    React.useState<ExtendedIndicator>(DEFAULT_INDICATOR)
  const [duration, setDuration] = React.useState<Duration>(DEFAULT_DURATION)
  const [easing, setEasing] = React.useState<Easing>(DEFAULT_EASING)
  const hydrated = useHydrated()

  const id = React.useId()

  const tabItems = React.useCallback(
    (list: 'list' | 'hidden-list') => {
      const getTabLabel = (item: string) => `tab-${item}-${id}`
      return items.map((item) => (
        <TabsByHiddenList.Trigger
          key={item}
          className={cn(triggerStyles)}
          value={item}
          aria-labelledby={getTabLabel(item)}
        >
          <div className={cn(indicatorContainerStyles({ indicator }))}>
            <TabsByHiddenList.Indicator
              className={cn(
                indicatorStyles({
                  indicator,
                }),
              )}
            />
            <span
              className={cn(
                triggerLabelStyles({ indicator }),
                list === 'list' &&
                  !hydrated &&
                  indicator === 'inverse-background' &&
                  'group-data-[state="active"]:text-green-1',
                list === 'hidden-list' &&
                  indicator === 'inverse-background' &&
                  'text-green-1',
              )}
              id={getTabLabel(item)}
            >
              {item}
            </span>
          </div>
        </TabsByHiddenList.Trigger>
      ))
    },
    [hydrated, indicator, id],
  )

  return (
    <TabsByHiddenList.Root
      key={indicator}
      value={selected}
      onValueChange={(v) => {
        if (items.includes(v)) {
          setSelected(v as Item)
        }
      }}
      duration={durations[duration]}
      easing={easings[easing]}
    >
      <div
        className={cn(
          'relative grid overflow-x-auto overflow-y-hidden border-b border-brand-7',
          separated ? 'grid-rows-2' : '',
        )}
      >
        <TabsByHiddenList.List
          className={cn('isolate grid grid-cols-4', separated && 'row-span-1')}
          aria-label='ブラウザの詳細'
        >
          {tabItems('list')}
        </TabsByHiddenList.List>
        <TabsByHiddenList.HiddenList
          className={cn(
            'isolate grid grid-cols-4',
            'pointer-events-none absolute inset-x-0 top-0',
            separated && 'translate-y-12',
            indicator === 'background' ? 'bg-green-6' : 'bg-green-9',
          )}
        >
          {tabItems('hidden-list')}
        </TabsByHiddenList.HiddenList>
      </div>
      {items.map((item) => (
        <TabsByHiddenList.Content
          key={item}
          value={item}
        />
      ))}
      <Settings>
        <SeparateTabsSwitch
          separated={separated}
          handleSeparated={setSeparated}
        />
        <IndicatorRadioGroup
          indicator={indicator}
          handleIndicator={setIndicator}
          options={extendedIndicatorTypes}
        />
        <DurationRadioGroup
          duration={duration}
          handleDuration={setDuration}
          options={getKeys(durations)}
        />
        <EasingRadioGroup
          easing={easing}
          handleEasing={setEasing}
          options={getKeys(easings)}
        />
      </Settings>
    </TabsByHiddenList.Root>
  )
}

function Settings({ children }: { children: React.ReactNode }) {
  return (
    <Card className='group relative grid grid-cols-[minmax(0,_1fr),_auto] gap-4 overflow-hidden text-base'>
      {children}
    </Card>
  )
}
function SettingsItem({ children }: { children: React.ReactNode }) {
  return (
    <div className='col-span-full grid grid-cols-subgrid gap-2'>{children}</div>
  )
}

function SeparateTabsSwitch({
  separated,
  handleSeparated,
}: {
  separated: boolean
  handleSeparated: (v: boolean) => void
}) {
  const id = React.useId()
  const separatedSwitchId = `switch-separated-${id}`
  return (
    <SettingsItem>
      <p id={separatedSwitchId}>インジケーターの分解</p>
      <Switch
        aria-labelledby={separatedSwitchId}
        checked={separated}
        onCheckedChange={handleSeparated}
        className='-translate-x-0.5'
      />
    </SettingsItem>
  )
}

function IndicatorRadioGroup<
  T extends Record<string, string>,
  U extends keyof T,
>({
  indicator,
  handleIndicator,
  options,
}: {
  indicator: U
  handleIndicator: (v: U) => void
  options: T
}) {
  const id = React.useId()
  const indicatorRadioGroupId = `radio-group-indicator-${id}`
  const getIndicatorRadioId = (item: string) => `radio-indicator-${item}-${id}`

  return (
    <SettingsItem>
      <p id={indicatorRadioGroupId}>インジケーターのタイプ</p>
      <RadioGroup
        value={String(indicator)}
        onValueChange={(v) => {
          if (Object.keys(options).includes(v)) {
            handleIndicator(v as U)
          }
        }}
        className='grid gap-2'
        aria-labelledby={indicatorRadioGroupId}
      >
        {strictEntries(options).map(([option, label]) => {
          option = String(option)
          return (
            <label
              key={option}
              className='flex h-10 cursor-pointer select-none items-center gap-2 text-sm'
              htmlFor={getIndicatorRadioId(option)}
            >
              <RadioGroupItem
                value={option}
                id={getIndicatorRadioId(option)}
              />
              {label}
            </label>
          )
        })}
      </RadioGroup>
    </SettingsItem>
  )
}

function DurationRadioGroup<T extends Readonly<Array<string>>>({
  duration,
  handleDuration,
  options,
}: {
  duration: T[number]
  handleDuration: (v: T[number]) => void
  options: T
}) {
  const id = React.useId()
  const labelId = `label-duration-${id}`
  return (
    <SettingsItem>
      <p id={labelId}>再生時間</p>
      <select
        aria-labelledby={labelId}
        className='relative flex items-center rounded-sm border border-brand-6 bg-brand-2 px-2 py-1 text-sm text-brand-12'
        value={duration}
        onChange={(e) => {
          const { value } = e.target
          if (options.includes(value)) {
            handleDuration(value)
          }
        }}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </SettingsItem>
  )
}

function EasingRadioGroup<T extends Readonly<Array<string>>>({
  easing,
  handleEasing,
  options,
}: {
  easing: T[number]
  handleEasing: (v: T[number]) => void
  options: T
}) {
  const id = React.useId()
  const labelId = `label-easing-${id}`
  return (
    <SettingsItem>
      <p id={labelId}>イージング関数</p>
      <select
        aria-labelledby={labelId}
        className='relative flex items-center rounded-sm border border-brand-6 bg-brand-2 px-2 py-1 text-sm text-brand-12'
        value={easing}
        onChange={(e) => {
          const { value } = e.target
          if (options.includes(value)) {
            handleEasing(value)
          }
        }}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </SettingsItem>
  )
}
