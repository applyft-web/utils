import { useState, useEffect } from 'react'
import { useConf } from '../hooks'
import { checkUTMs, queryParser } from '../utils'

// TODO:
// type ReturnType = string[] | null | undefined
type ReturnType = any

interface Options {
  debug?: boolean
}

const defaultOptions = {
  debug: false
}

export const useFlow = (
  flowType: string,
  flowsList: Record<string, string[]>,
  options: Options = defaultOptions
): ReturnType => {
  const debug = options?.debug ?? false
  const [flow, setFlow] = useState<ReturnType>()
  const searchParams = queryParser(window.location.search)
  const noUtms = !checkUTMs(searchParams)
  const { conf } = useConf<string[]>('flows', { debug, skip: noUtms })

  useEffect(() => {
    if (!flowType || conf === undefined) return
    const localFlow = flowsList[flowType]
    const localDefFlow = flowsList.default
    const customFlow =
      conf && Array.isArray(conf[flowType]) ? conf[flowType] : undefined
    const defaultFlow =
      conf && Array.isArray(conf.default) ? conf.default : localDefFlow

    setFlow(customFlow ?? localFlow ?? defaultFlow ?? null)

    if (!customFlow && !localFlow) {
      if (debug) {
        console.log(`result flow «${flowType}» does not exist. set default flow`)
      }
    }
  }, [conf, flowType, flowsList, debug])

  return flow
}
