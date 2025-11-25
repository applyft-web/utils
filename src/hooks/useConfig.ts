import { useState, useEffect } from 'react'
import { printLogs } from 'utils'

export type ConfProps<T = any> = Record<string, T>

export const useConf = (name: string, debug: boolean = false) => {
  const [conf, setConf] = useState<ConfProps<Record<string, number> | string[]> | null>()

  useEffect(() => {
    fetch(`./${name}.json`)
      .then((response) => {
        console.log({ response })
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
        if (debug) printLogs(`${name}: `, data)
        setConf(data)
      })
      .catch((error) => {
        if (debug) printLogs(`Unable to load the «${name}» config file`, error)
        setConf(null)
      })
  }, [name])

  return conf
}
