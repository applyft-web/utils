import { useState, useEffect } from 'react'

export type ConfProps<K> = Record<string, K>

interface Options {
  debug?: boolean
  skip?: boolean
}

export const useConf = <T = string[] | Record<string, number>>(name: string, options: Options = { debug: false }): {
  conf: ConfProps<T> | null | undefined
  geo: string | null
} => {
  const { debug, skip } = options
  const [conf, setConf] = useState<ConfProps<T> | null | undefined>()
  const [geo, setGeo] = useState<string | null>(null)

  useEffect(() => {
    if (skip) {
      setConf(null)
      return
    }

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
        const countryCode =
          response.headers.get('x-viewer-country') ||
          response.headers.get('X-Country-Code') ||
          null

        if (!contentType || !contentType.includes('application/json')) {
          handleError(new Error('not found'))
          return
        }

        if (countryCode) setGeo(countryCode.trim().toUpperCase())

        const data = (await response.json()) as ConfProps<T>

        if (debug) console.log(`${name}: `, data)
        setConf(data)
      } catch (error) {
        if (debug) console.warn(`Unable to load the «${name}» config file`, error)
        setConf(null)
      }
    }

    void loadConfig()
  }, [skip, name, debug])

  return { conf, geo }
}
