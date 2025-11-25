import { useState, useEffect } from 'react'
import { queryParser, printLogs } from '../utils'
import { useConf } from '../hooks'

type Limits = Array<{ min: number, max: number }>

const PLACEHOLDER_RE = /\{\{[^}]*\}\}/

const checkUTMs = (params: Record<string, string> | null | undefined): boolean => {
  if (!params || typeof params !== 'object' || Object.keys(params).length === 0) {
    return false
  }

  const utmEntries = Object.entries(params).filter(([key]) =>
    key.toLowerCase().includes('utm')
  )

  if (utmEntries.length === 0) return false

  return utmEntries.every(([, value]) =>
    typeof value === 'string' &&
    value.trim().length > 0 &&
    !PLACEHOLDER_RE.test(value)
  )
}

/** @deprecated use useSplitFlow instead */
export const useLandingType = (landingParam: string, landingTypesList?: string[], defaultFlowName = 'fullPrice', debug = false): Record<string, string> => {
  const defaultValue = landingParam.length > 0 ? landingParam : defaultFlowName
  const searchParams = queryParser(window.location.search)
  const [landingType, setLandingType] = useState<string>('')
  const [paywallType, setPaywallType] = useState<string>('')
  const [flowType, setFlowType] = useState<string>('')
  const conf = useConf('config', debug)

  const getLimits = (arr: number[]): Limits =>
    arr.reduce((acc: Limits, v: number) => {
      const prevMax = (acc[acc.length - 1] || { max: null }).max
      const min = (prevMax || -1) + 1
      const max = +v + (prevMax || 0)
      return acc.concat([{ min, max }])
    }, [])

  useEffect(() => {
    if (conf === undefined || Array.isArray(conf?.[defaultValue])) return
    if (conf?.[defaultValue]) {
      const randomVal = Math.floor(Math.random() * 100)
      const splittingLanding = conf[defaultValue]
      const limits = getLimits(Object.values(splittingLanding))
      const lt = Object.keys(splittingLanding).find((k, i) => {
        const { min, max } = limits[i]
        return (randomVal >= min && randomVal <= max)
      })
      const ltExist = !!lt && landingTypesList?.includes(`/${lt.split('/')[0]}`)

      if (debug) printLogs('random value :', randomVal.toString())

      if (lt) {
        const [ft, postfix] = lt.split('/')
        const ltRes = `split_${ft}${postfix ? `_${postfix}` : ''}`
        const ptRes = landingTypesList && !ltExist ? defaultValue : ft

        if (debug) {
          if (landingTypesList && !ltExist) printLogs(`result type: landing type «${ft}» does not exist. but will be used as custom type`)
          printLogs('landing type: ', ltRes)
          printLogs('paywall type: ', ptRes)
          printLogs('flow type: ', ft)
        }

        setLandingType(ltRes)
        setPaywallType(ptRes)
        setFlowType(ft)
      } else {
        if (debug) printLogs('Oops... Something went wrong. Please check the config file.')
        setLandingType(defaultValue)
        setPaywallType(defaultValue)
        setFlowType(defaultValue)
      }
    } else {
      setLandingType(defaultValue)
      setPaywallType(defaultValue)
      setFlowType(defaultValue)
    }
  }, [defaultValue, conf, landingTypesList])

  if (checkUTMs(searchParams) || searchParams?.skip_split === 'true') {
    console.log('set to default: ', { searchParams })
    return {
      landingType: defaultValue,
      paywallType: defaultValue,
      flowType: defaultValue
    }
  }

  return { landingType, paywallType, flowType }
}

/** @deprecated use useSplitFlow instead */
export const useLandingTypeV2 = (landingParam: string, debug?: boolean): Record<string, string> => {
  return useLandingType(landingParam, undefined, 'default', debug)
}

export const useSplitFlow = (landingParam: string, debug?: boolean): Record<string, string> => {
  const { landingType, flowType } = useLandingType(landingParam, undefined, 'default', debug)
  return { landingType, flowType }
}
