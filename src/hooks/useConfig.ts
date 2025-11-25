import { useState, useEffect } from 'react'
import { printLogs } from 'utils'

export type ConfProps<T = any> = Record<string, T>

export const useConf = (name: string, debug: boolean = false) => {
  const [conf, setConf] = useState<ConfProps<Record<string, number> | string[]> | null>()
  const [geo, setGeo] = useState<string | null>(null)

  useEffect(() => {
    fetch(`./${name}.json`)
      .then((response) => {
        if (!response.ok) throw new Error('failed to load')

        const contentType = response.headers.get('content-type')
        const countryCode = response.headers.get('X-Country-Code')

        if (
          !contentType ||
          !contentType.includes('application/json')
        ) {
          throw new Error('not found')
        }

        if (countryCode) setGeo(countryCode)

        return response.json()
      })
      .then((data) => {
        if (debug) printLogs(`${name}: `, data)
        setConf(data)
      })
      .catch((error) => {
        if (debug) printLogs(`Unable to load the «${name}» config file`, error)
        setConf(null)
      })
  }, [name])

  return { conf, geo }
}
