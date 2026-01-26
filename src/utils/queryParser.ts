const safeDecode = (val: string): string => {
  try {
    return decodeURIComponent(val)
  } catch (e) {
    console.error('decodeURIComponent error: ', e)
    console.warn('Failed to decodeURIComponent. This string isn\'t valid: ', val)
    return val
  }
}

export const queryParser = (str: string): Record<string, string> => {
  const raw = str.startsWith('?') ? str.slice(1) : str
  if (!raw) return {}

  return raw.split('&').reduce((acc, pair) => {
    if (!pair) return acc

    const eqIndex = pair.indexOf('=')
    if (eqIndex === -1) return acc

    const keyRaw = pair.slice(0, eqIndex)
    const valueRaw = pair.slice(eqIndex + 1)

    if (valueRaw === '') return acc

    const key = safeDecode(keyRaw).replace(/[ +]/g, '_')
    const value = safeDecode(valueRaw)

    return { ...acc, [key]: value }
  }, {})
}
