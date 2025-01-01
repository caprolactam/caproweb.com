import { Command } from 'cmdk'
import React from 'react'
import { flushSync } from 'react-dom'
import { IconButton } from '#app/components/parts/icon-button.tsx'
import { Icon } from '#app/components/parts/icon.tsx'
import { cn } from '#app/utils/misc.ts'
import {
  Root,
  Portal,
  Overlay,
  Content,
  Title,
  Description,
  Bar,
  Trigger,
  Close,
} from './search.tsx'

const list = [
  'John',
  'Jane',
  'Alice',
  'Bob',
  'Charlie',
  'Dave',
  'Eve',
  'Frank',
  'Grace',
  'Hank',
  'Ivy',
  'Jack',
  'Kate',
  'Liam',
  'Mia',
  'Noah',
  'Olivia',
  'Paul',
  'Quinn',
  'Riley',
  'Sally',
  'Tom',
  'Ulysses',
  'Violet',
  'Walter',
  'Xander',
  'Yvette',
  'Zachary',
]

export function SearchDemo() {
  const [inputValue, setInputValue] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const gotInput = !!inputValue.length

  return (
    <Root
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <Bar className='relative isolate flex h-14 items-center gap-4 overflow-hidden rounded-full bg-brand-3 px-2 text-base text-brand-12'>
        <IconButton
          type='button'
          variant='ghost'
          size='lg'
          label='メニュー'
          className='shrink-0'
        >
          <MenuIcon />
        </IconButton>
        <Trigger
          type='button'
          className={cn(
            inputValue.length ? 'text-brand-12' : 'text-brand-11',
            'grow text-left outline-none ring-0 ring-transparent before:absolute before:inset-0 before:z-[-1] before:transition-colors before:duration-150 before:ease-linear before:hover:bg-brand-4 before:focus-visible:bg-brand-5 before:active:bg-brand-5',
          )}
        >
          {inputValue.length ? inputValue : 'ユーザーを検索'}
        </Trigger>
        <IconButton
          type='button'
          variant='ghost'
          size='lg'
          label='アカウント'
          className='shrink-0'
        >
          <img
            src='/no-u-turn_transparent.png'
            alt='アカウントのアバター'
            loading='lazy'
            className='size-full rounded-full bg-white text-xs'
          />
        </IconButton>
      </Bar>
      <Portal>
        <Overlay className='fixed inset-0 z-40 bg-black/70' />
        <Content
          className='group fixed inset-0 z-40 bg-brand-3'
          onOpenAutoFocus={(e) => {
            if (inputRef.current) {
              e.preventDefault()
              inputRef.current?.focus()
            }
          }}
        >
          <Command className='flex size-full flex-col'>
            <Title className='sr-only'>ユーザーを検索</Title>
            <Description className='sr-only'>
              ユーザーを選択して関連するメールを表示します。
            </Description>
            <div
              data-search-animated-bar=''
              className='flex h-14 w-full shrink-0 items-center gap-4 px-2'
            >
              <IconButton
                label='閉じる'
                size='lg'
                variant='ghost'
                type='button'
                className='shrink-0'
                asChild
              >
                <Close>
                  <MenuIcon />
                </Close>
              </IconButton>
              <Command.Input
                autoComplete='off'
                ref={inputRef}
                value={inputValue}
                onValueChange={setInputValue}
                placeholder='ユーザーを検索'
                className='min-w-0 flex-1 appearance-none border-none bg-transparent text-base text-brand-12 caret-brand-12 outline-none ring-transparent placeholder:text-brand-11'
              />
              <IconButton
                data-search-trailing-icon=''
                label={gotInput ? 'クリア' : '音声検索を開始'}
                size='lg'
                variant='ghost'
                type='button'
                onClick={() => {
                  if (gotInput) {
                    flushSync(() => {
                      setInputValue('')
                    })
                    inputRef.current?.focus()
                  }
                }}
                className='shrink-0'
              >
                <Icon
                  name={gotInput ? 'close' : 'mic-fill'}
                  size={24}
                />
              </IconButton>
            </div>
            <Command.List className='flex-1 overflow-y-auto border-t border-brand-6 duration-100 ease-linear group-data-[state="closed"]:overflow-hidden group-data-[state="closed"]:opacity-0'>
              {list.map((item) => (
                <Command.Item
                  key={item}
                  className='flex h-14 w-full cursor-default items-center px-4 text-base text-brand-12 transition-colors duration-150 ease-linear data-[selected=true]:bg-brand-4'
                  onSelect={(value) => {
                    setInputValue(value)
                    setIsOpen(false)
                  }}
                >
                  {item}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Content>
      </Portal>
    </Root>
  )
}

function MenuIcon() {
  return (
    <svg
      viewBox='0 0 240 240'
      width={24}
      height={24}
      data-search-menu-icon=''
    >
      <g
        stroke='currentColor'
        strokeWidth={20}
      >
        <line
          x1={30}
          y1={80}
          x2={210}
          y2={80}
        />
        <line
          x1={30}
          y1={120}
          x2={210}
          y2={120}
        />
        <line
          x1={30}
          y1={160}
          x2={210}
          y2={160}
        />
      </g>
    </svg>
  )
}
