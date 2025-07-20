import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * `Date`を`YYYY-MM-DD`形式の文字列に変換する(ISO 8601準拠)
 * https://ja.wikipedia.org/wiki/ISO_8601#%E5%B9%B4%E3%81%A8%E6%9C%88%E3%81%A8%E6%97%A5
 *
 * ```ts
 * const date = new Date()
 * const formattedDate = formatDate(date)
 *
 * expect(formattedDate).toBe('2023-01-01')
 * ```
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * `Object.entries()`を型安全に実行する
 * @source https://chaika.hatenablog.com/entry/2024/03/25/083000
 */
export function strictEntries<T extends Record<string, any>>(
  object: T,
): [keyof T, T[keyof T]][] {
  return Object.entries(object)
}

/**
 * `Object.keys()`を型安全に実行する
 * @source https://zenn.dev/ossamoon/articles/694a601ee62526
 */
export function strictKeys<T extends { [key: string]: unknown }>(
  obj: T,
): (keyof T)[] {
  return Object.keys(obj)
}
