// e.g.: utm_campaign={{campaign}}
const PLACEHOLDER_RE = /\{\{[^}]*\}\}/

export const checkUTMs = (params: Record<string, string> | null | undefined): boolean => {
  if (!params || typeof params !== 'object' || Object.keys(params).length === 0) {
    return false
  }

  const isValid = (value: unknown): boolean => (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    !PLACEHOLDER_RE.test(value)
  )

  const normalizedEntries = Object.entries(params).map(([key, value]) => [key.toLowerCase(), value] as const)

  const utmEntries = normalizedEntries.filter(([key]) => key.startsWith('utm'))
  if (utmEntries.length === 0) return false

  // const required = ['utm_source', 'utm_medium', 'utm_campaign']
  const required = ['utm_source']
  const dict = Object.fromEntries(normalizedEntries)

  const requiredPresent = required.every((k) => isValid(dict[k]))
  if (!requiredPresent) return false

  return utmEntries.every(([, value]) => isValid(value))
}
