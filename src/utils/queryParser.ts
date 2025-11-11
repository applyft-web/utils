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

  const coupleStr = raw.split('&').map(item => item.split('='))

  return coupleStr.reduce((acc, [key, value]) => {
    return {
      ...acc,
      [safeDecode(key).replace(/[ +]/g, '_')]: safeDecode(value)
    }
  }, {})
}
