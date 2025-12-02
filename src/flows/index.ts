import { useState, useEffect } from 'react'
import { printLogs } from '../utils'
import { useConf } from '../hooks'

export const useFlow = (flowType: string, flowsList: Record<string, string[]>) => {
  const [flow, setFlow] = useState<any>()
  const conf = useConf('flows')

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
      printLogs(`result flow «${flowType}» does not exist. set default default flow`)
    }
  }, [conf, flowType, flowsList])

  return flow
}
