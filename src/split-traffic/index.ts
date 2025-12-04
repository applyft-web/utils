import { useState, useEffect } from 'react'
import { queryParser } from '../utils'
import { useConf } from '../hooks'

type Limits = Array<{ min: number, max: number }>
interface ReturnType {
  landingType: string
  flowType: string
}
interface Options {
  debug?: boolean
  customGeo?: string
}

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
const DEFAULT_NAME = 'default'
const defaultOptions = {
  debug: false,
  customGeo: 'US'
}

const useLandingType = (
  initValue: string = DEFAULT_NAME,
  options: Options = defaultOptions
): ReturnType => {
  const defaultValue = initValue.length > 0 ? initValue : DEFAULT_NAME
  const { debug, customGeo } = options
  const searchParams = queryParser(window.location.search)
  const [landingType, setLandingType] = useState<string>('')
  const [flowType, setFlowType] = useState<string>('')
  const { conf, geo } = useConf<Record<string, number>>('config', debug)
  const skip =
    !checkUTMs(searchParams) ||
    (geo && restrictGeos.includes(geo)) ||
    (customGeo && restrictGeos.includes(customGeo)) ||
    searchParams?.skip_split === 'true'

  const getLimits = (arr: number[]): Limits =>
    arr.reduce((acc: Limits, v: number) => {
      const prevMax = (acc[acc.length - 1] || { max: -1 }).max
      const min = prevMax + 1
      const max = prevMax + v
      return acc.concat([{ min, max }])
    }, [])

  useEffect(() => {
    if (skip || conf === undefined || Array.isArray(conf?.[defaultValue])) return
    if (conf?.[defaultValue]) {
      const randomVal = Math.floor(Math.random() * 100)
      const splittingLanding = conf[defaultValue]
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
        setLandingType(defaultValue)
        setFlowType(defaultValue)
      }
    } else {
      setLandingType(defaultValue)
      setFlowType(defaultValue)
    }
  }, [skip, defaultValue, conf, debug])

  if (skip) {
    return {
      landingType: defaultValue,
      flowType: defaultValue
    }
  }

  return { landingType, flowType }
}

/** @deprecated use useSplitFlow instead */
export const useLandingTypeV2 = (initValue: string, debug: boolean = false): ReturnType => {
  return useLandingType(initValue, { debug })
}

export const useSplitFlow = (initValue: string, options?: Options): ReturnType => {
  return useLandingType(initValue, options)
}
