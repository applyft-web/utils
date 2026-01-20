import * as fs from 'fs'
import * as path from 'path'
import { createRequire } from 'module'
import { pathToFileURL } from 'url'

type PagesConfig = Record<string, { excludeFromBuilder?: boolean }>

const DEFAULT_RESULT_FILE = 'screens.json'

let pagesConfig: PagesConfig | undefined

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  Boolean(v) && typeof v === 'object' && !Array.isArray(v)

function tryRegisterTsconfigPaths (): void {
  try {
    const tsconfigPath = path.resolve(process.cwd(), 'tsconfig.json')
    if (!fs.existsSync(tsconfigPath)) return

    const raw = fs.readFileSync(tsconfigPath, 'utf-8')
    const cfg = JSON.parse(raw)
    const compilerOptions = cfg?.compilerOptions || {}
    const baseUrlRel: unknown = compilerOptions.baseUrl
    const paths: unknown = compilerOptions.paths

    if (typeof baseUrlRel === 'string' && paths && typeof paths === 'object') {
      // optional dependency — best-effort
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const tsconfigPaths = require('tsconfig-paths')
        const baseUrl = path.resolve(path.dirname(tsconfigPath), baseUrlRel)
        tsconfigPaths.register({ baseUrl, paths })
      } catch (_) {
        // ignore if not installed
      }
    }
  } catch (_) {
    // silent — best-effort only
  }
}

async function loadConfigModule (configPath: string): Promise<unknown> {
  const ext = path.extname(configPath).toLowerCase()

  if (ext === '.json') {
    try {
      const data = fs.readFileSync(configPath, 'utf-8')
      return JSON.parse(data)
    } catch (e) {
      throw new Error(`Failed to read JSON config: ${String(e)}`)
    }
  }

  // First, try CommonJS require (works with ts-node for TS files in CJS projects)
  try {
    const req = createRequire(process.cwd() + '/package.json')
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return req(configPath)
  } catch (e: any) {
    const msg = e?.message || ''
    const code = e?.code || ''
    const isEsm = code === 'ERR_REQUIRE_ESM' || /must use import/i.test(msg)
    if (!isEsm) {
      // not an ESM-specific error — rethrow
      throw e
    }
  }

  // Fallback: dynamic import for ESM modules
  try {
    const mod = await import(pathToFileURL(configPath).href)
    return mod
  } catch (e) {
    throw e
  }
}

export async function generateScreens (configRelPath: string, outRelPath: string): Promise<void> {
  const configPath = path.resolve(process.cwd(), configRelPath)
  const outPath = path.resolve(process.cwd(), outRelPath)

  try {
    // Best-effort support for TS path aliases before loading
    tryRegisterTsconfigPaths()

    const rawMod = await loadConfigModule(configPath)
    const candidates: unknown[] = [
      rawMod?.pagesConfig,
      rawMod?.default?.pagesConfig,
      rawMod?.default,
      rawMod
    ]

    for (const cand of candidates) {
      if (!isPlainObject(cand)) continue

      const entries = Object.entries(cand)
      if (entries.length === 0) continue

      const looksLikePagesConfig = entries.every(([k, v]) => {
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

    if (!conf || typeof conf !== 'object') continue

    if (conf.excludeFromBuilder) excludedScreens.push(key)
    else screens.push(key)
  }

  let outFile = outPath
  try {
    const hasExt = Boolean(path.extname(outRelPath))
    const ext = path.extname(outRelPath).toLowerCase()

    if (hasExt) {
      if (ext !== '.json') {
        console.error(
          `❌ Output file must have .json extension: "${outRelPath}"`
        )
        process.exit(1)
      }

      outFile = outPath
    } else {
      outFile = path.join(outPath, DEFAULT_RESULT_FILE)
    }
  } catch (_) {
    outFile = path.join(outPath, DEFAULT_RESULT_FILE)
  }

  try {
    fs.mkdirSync(path.dirname(outFile), { recursive: true })
    fs.writeFileSync(outFile, JSON.stringify(screens, null, 2), 'utf-8')

    const fileName = path.basename(outFile)
    console.log(`✅ ${fileName} has been generated: ${screens.length} screen${screens.length !== 1 ? 's' : ''}`)
    if (excludedScreens.length > 0) {
      console.log(`🔒 Excluded screens (${excludedScreens.length}): ${excludedScreens.join(', ')}`)
    }
  } catch (err) {
    console.error(`❌ Failed to generate ${path.basename(outFile)}: `, err)
    process.exit(1)
  }
}
