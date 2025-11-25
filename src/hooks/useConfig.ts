import { useState, useEffect } from 'react'

export type ConfProps<K> = Record<string, K>

export const useConf = <T = string[] | Record<string, number>>(name: string, debug: boolean = false): {
  conf: ConfProps<T> | null | undefined
  geo: string | null
} => {
  const [conf, setConf] = useState<ConfProps<T> | null | undefined>()
  const [geo, setGeo] = useState<string | null>(null)

  useEffect(() => {
    const handleError = (error: unknown): void => {
      if (debug) console.warn(`Unable to load the «${name}» config file`, error)
      setConf(null)
    }

    const loadConfig = async (): Promise<void> => {
      try {
        const response = await fetch(`./${name}.json`)

        if (!response.ok) {
          handleError(new Error('failed to load'))
          return
        }

        const contentType = response.headers.get('content-type')
        const countryCode = response.headers.get('X-Country-Code')

        if (!contentType || !contentType.includes('application/json')) {
          handleError(new Error('not found'))
          return
        }

        if (countryCode) setGeo(countryCode)

        const data = (await response.json()) as ConfProps<T>

        if (debug) console.log(`${name}: `, data)
        setConf(data)
      } catch (error) {
        if (debug) console.warn(`Unable to load the «${name}» config file`, error)
        setConf(null)
      }
    }

    void loadConfig()
  }, [name, debug])

  return { conf, geo }
}
