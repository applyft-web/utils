import * as fs from 'fs'
import * as path from 'path'

export function generateScreens (configRelPath: string, outRelPath: string): void {
  const configPath = path.resolve(process.cwd(), configRelPath)
  const outPath = path.resolve(process.cwd(), outRelPath)

  const { pagesConfig } = require(configPath) as { pagesConfig: Record<string, Record<string, any>> }
  const { screens, excludedScreens } = Object
    .entries(pagesConfig.filter((k: string) => k !== '*'))
    .reduce(
      (acc, [key, conf]: [string, Record<string, any>]) => {
        if (!conf.excludeFromBuilder) {
          acc.screens.push(key)
        } else {
          acc.excludedScreens.push(key)
        }
        return acc
      },
      { screens: [], excludedScreens: [] }
    )

  try {
    fs.writeFileSync(outPath, JSON.stringify(screens, null, 2), 'utf-8')
    console.log(`✅ screens.json has been generated: ${screens.length} screen${screens.length > 1 ? 's' : ''}`)
    if (excludedScreens?.length > 0) {
      console.log(`🔒 Excluded screens (${excludedScreens.length}): ${excludedScreens.join(', ')}`)
    }
  } catch (err) {
    console.error('❌ Failed to generate screens.json:', err)
    process.exit(1)
  }
}
