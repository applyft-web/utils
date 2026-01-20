import * as fs from 'fs'
import * as path from 'path'

interface PageConfig {
  excludeFromBuilder?: boolean
  [key: string]: boolean | string | number
}

type PagesConfig = Record<string, PageConfig>

let pagesConfig: PagesConfig | undefined

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  Boolean(v) && typeof v === 'object' && !Array.isArray(v)

export function generateScreens (configRelPath: string, outRelPath: string): void {
  const configPath = path.resolve(process.cwd(), configRelPath)
  const outPath = path.resolve(process.cwd(), outRelPath)

  try {
    const rawMod = require(configPath)
    const candidates: unknown[] = [
      rawMod?.pagesConfig,
      rawMod?.default?.pagesConfig,
      rawMod?.default,
      rawMod
    ]

    for (const cand of candidates) {
      if (!isPlainObject(cand)) continue

      // Basic shape validation: values should be objects (page configs)
      const entries = Object.entries(cand)
      if (entries.length === 0) continue

      const looksLikePagesConfig = entries.every(([k, v]) => {
        // allow '*' key as a wildcard/default entry
        if (typeof k !== 'string') return false
        return isPlainObject(v)
      })

      if (looksLikePagesConfig) {
        pagesConfig = cand as PagesConfig
        break
      }
    }
  } catch (e) {
    console.error('❌ Failed to load pages config module:', e)
    process.exit(1)
  }

  if (!pagesConfig) {
    console.error('❌ pagesConfig not found or has invalid type in provided config')
    process.exit(1)
  }

  const screens: string[] = []
  const excludedScreens: string[] = []

  for (const [key, conf] of Object.entries(pagesConfig)) {
    if (key === '*') continue

    // Defensive: ensure the entry is an object
    if (!conf || typeof conf !== 'object') continue

    if (conf.excludeFromBuilder) excludedScreens.push(key)
    else screens.push(key)
  }

  // Determine output file: directory -> screens.json; file -> use it; ensure .json
  let outFile = outPath
  try {
    const exists = fs.existsSync(outPath)
    const stat = exists ? fs.statSync(outPath) : null
    const endsWithSlash = /[\/]+$/.test(outRelPath)
    const hasExt = Boolean(path.extname(outPath))
    const isJsonExt = path.extname(outPath).toLowerCase() === '.json'

    if (stat?.isDirectory() || (!exists && (endsWithSlash || !hasExt))) {
      outFile = path.join(outPath, 'screens.json')
    } else {
      outFile = outPath
      if (!isJsonExt) outFile = `${outFile}.json`
    }
  } catch (_) {
    outFile = path.join(outPath, 'screens.json')
  }

  try {
    fs.mkdirSync(path.dirname(outFile), { recursive: true })
    fs.writeFileSync(outFile, JSON.stringify(screens, null, 2), 'utf-8')

    // Also write excluded screens next to the main output for tooling/inspection.
    // This keeps the primary output backward-compatible (array of screens).
    const excludedFile = outFile.replace(/\.json$/i, '.excluded.json')
    fs.writeFileSync(excludedFile, JSON.stringify(excludedScreens, null, 2), 'utf-8')

    const fileName = path.basename(outFile)
    console.log(`✅ ${fileName} has been generated: ${screens.length} screen${screens.length !== 1 ? 's' : ''}`)
    if (excludedScreens.length > 0) {
      const excludedFileName = path.basename(outFile).replace(/\.json$/i, '.excluded.json')
      console.log(`🔒 Excluded screens (${excludedScreens.length}): ${excludedScreens.join(', ')}`)
      console.log(`📝 Excluded list written to: ${excludedFileName}`)
    }
  } catch (err) {
    console.error('❌ Failed to generate screens.json:', err)
    process.exit(1)
  }
}
