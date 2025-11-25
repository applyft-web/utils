import { useState, useEffect } from 'react'
import { queryParser } from '../utils'
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

// Ukraine, Belarus, Cyprus, Poland
const restrictGeos = ['UA', 'BY', 'CY', 'PL']

const useLandingType = (initValue: string = 'default', debug: boolean = false): Record<string, string> => {
  const searchParams = queryParser(window.location.search)
  const [landingType, setLandingType] = useState<string>(initValue)
  const [flowType, setFlowType] = useState<string>(initValue)
  const { conf, geo } = useConf<Record<string, number>>('config', debug)

  const getLimits = (arr: number[]): Limits =>
    arr.reduce((acc: Limits, v: number) => {
      const prevMax = (acc[acc.length - 1] || { max: -1 }).max
      const min = prevMax + 1
      const max = prevMax + v
      return acc.concat([{ min, max }])
    }, [])

  useEffect(() => {
    if (conf === undefined || Array.isArray(conf?.[initValue])) return
    if (conf?.[initValue]) {
      const randomVal = Math.floor(Math.random() * 100)
      const splittingLanding = conf[initValue]
      const limits = getLimits(Object.values(splittingLanding))
      const lt = Object.keys(splittingLanding).find((k, i) => {
        const { min, max } = limits[i]
        return (randomVal >= min && randomVal <= max)
      })

      if (debug) console.log('random value :', randomVal.toString())

      if (lt) {
        const [ft, postfix] = lt.split('/')
        const ltRes = `split_${ft}${postfix ? `_${postfix}` : ''}`

        if (debug) {
          console.log('landing type: ', ltRes)
          console.log('flow type: ', ft)
        }

        setLandingType(ltRes)
        setFlowType(ft)
      } else {
        if (debug) console.warn('Oops... Something went wrong. Please check the config file.')
        setLandingType(initValue)
        setFlowType(initValue)
      }
    } else {
      setLandingType(initValue)
      setFlowType(initValue)
    }
  }, [initValue, conf, debug])

  if (!checkUTMs(searchParams) || (geo && restrictGeos.includes(geo)) || searchParams?.skip_split === 'true') {
    return {
      landingType: initValue,
      flowType: initValue
    }
  }

  return { landingType, flowType }
}

/** @deprecated use useSplitFlow instead */
export const useLandingTypeV2 = (initValue: string, debug?: boolean): Record<string, string> => {
  return useLandingType(initValue, debug)
}

export const useSplitFlow = (initValue: string, debug?: boolean): Record<string, string> => {
  return useLandingType(initValue, debug)
}
