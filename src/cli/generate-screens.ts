import * as fs from 'fs'
import * as path from 'path'
import { pathToFileURL } from 'url'

export async function generateScreens (configRelPath: string, outRelPath: string): void {
  const configPath = path.resolve(process.cwd(), configRelPath)
  const outPath = path.resolve(process.cwd(), outRelPath)

  const configModule = await import(pathToFileURL(configPath).href)
  const pagesConfig = (configModule.pagesConfig ?? configModule.default?.pagesConfig) as Record<string,any>
  // const { pagesConfig } = require(configPath) as { pagesConfig: Record<string, any> }
  const screens = Object.keys(pagesConfig).filter(key => key !== '*')

  try {
    fs.writeFileSync(outPath, JSON.stringify(screens, null, 2), 'utf-8')
    console.log(`✅ screens.json was generated (${screens.length} screen${screens.length > 1 ? 's' : ''}): ${outPath}`)
  } catch (err) {
    console.error('❌ Failed to generate screens.json:', err)
    process.exit(1)
  }
}
