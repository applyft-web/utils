import { useState, useEffect } from 'react'
import { useConf } from '../hooks'

export const useFlow = (
  flowType: string,
  flowsList: Record<string, string[]>,
  debug = false
): string[] | null | undefined => {
  const [flow, setFlow] = useState<string[] | null | undefined>()
  const { conf } = useConf<string[]>('flows', debug)

  useEffect(() => {
    if (!flowType || conf === undefined) return
    const localFlow = flowsList[flowType]
    const customFlow =
      conf && Array.isArray(conf[flowType]) ? conf[flowType] : undefined

    setFlow(customFlow ?? localFlow ?? null)

    if (!customFlow && !localFlow) {
      if (debug) {
        console.log(`result flow «${flowType}» does not exist. set default default flow`)
      }
    }
  }, [conf, flowType, flowsList, debug])

  return flow
}
