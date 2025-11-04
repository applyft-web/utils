import { useState, useEffect } from 'react'

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

export type ConfProps<T = any> = Record<string, T>

export const printLogs = (...args: any[]) => {
  if (window.sessionStorage.getItem('UTILS_DEBAG') === 'false') return
  console.log(...args)
}

export const useConf = (name: string) => {
  const [conf, setConf] = useState<ConfProps<Record<string, number> | string[]> | null>();

  useEffect(() => {
    fetch(`./${name}.json`)
      .then((response) => {
        if (!response.ok) throw new Error('failed to load')
        const contentType = response.headers.get('content-type')
        if (
          !contentType ||
          !contentType.includes('application/json')
        ) {
          throw new Error('not found')
        }
        return response.json()
      })
      .then((data) => {
        printLogs(`${name}: `, data)
        setConf(data)
      })
      .catch((error) => {
        printLogs(`Unable to load the «${name}» config file`, error)
        setConf(null)
      })
  }, [name])

  return conf
}
