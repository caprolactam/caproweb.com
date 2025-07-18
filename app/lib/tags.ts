export function setSearchParamsString(
  searchParams: URLSearchParams,
  changes: Record<string, string | number | undefined>,
) {
  const newSearchParams = new URLSearchParams(searchParams)

  for (const [key, value] of Object.entries(changes)) {
    if (value === undefined) {
      newSearchParams.delete(key)
      continue
    }

    const matched = matchKeyValuePair(newSearchParams, { key, value })

    // 一致するkey-valueペアが存在する場合は削除
    // そうでない場合は追加
    if (matched) {
      newSearchParams.delete(key, String(value))
    } else {
      newSearchParams.append(key, String(value))
    }
  }

  // Print string manually to avoid over-encoding the URL
  // Browsers are ok with $ nowadays
  // optional: return newSearchParams.toString()
  return Array.from(newSearchParams.entries())
    .map(([key, value]) =>
      value ? `${key}=${encodeURIComponent(value)}` : key,
    )
    .join('&')
}

function matchKeyValuePair(
  searchParams: URLSearchParams,
  props: { key: string; value: string | number },
) {
  const { key, value } = props
  const existingValues = searchParams.getAll(key)

  if (existingValues.length === 0) return false

  return existingValues.includes(String(value))
}
