import { resolve } from 'path'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const ts = require('typescript')

const getPagesFromSource = (sourceText: string): { screens: string[], excludedScreens: string[] } => {
  const sf = ts.createSourceFile(
    'pagesConfig.tsx',
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  )

  let objectLiteral = null

  for (const stmt of sf.statements) {
    if (!ts.isVariableStatement(stmt)) continue
    for (const decl of stmt.declarationList.declarations) {
      if (!decl.name || !ts.isIdentifier(decl.name)) continue
      if (decl.name.text !== 'pagesConfig') continue
      const init = decl.initializer
      if (init && ts.isObjectLiteralExpression(init)) {
        objectLiteral = init
        break
      }
    }
    if (objectLiteral) break
  }

  if (!objectLiteral) {
    throw new Error('Не удалось найти объект pagesConfig в pagesConfig.tsx')
  }

  const screens = []
  const excludedScreens = []

  for (const prop of objectLiteral.properties) {
    // Сохраняем порядок определения ключей
    if (!ts.isPropertyAssignment(prop)) continue

    const name = prop.name
    if (!(ts.isIdentifier(name) || ts.isStringLiteral(name))) continue

    const key = name.text
    if (key === '*') continue

    // Значение должно быть объектом конфигурации страницы
    const value = prop.initializer
    let isExcluded = false
    if (value && ts.isObjectLiteralExpression(value)) {
      for (const p of value.properties) {
        if (!ts.isPropertyAssignment(p)) continue
        const pn = p.name
        if (!(ts.isIdentifier(pn) || ts.isStringLiteral(pn))) continue
        if (pn.text !== 'excludeFromBuilder') continue

        const pv = p.initializer
        if (pv && pv.kind === ts.SyntaxKind.TrueKeyword) {
          isExcluded = true
          break
        }
      }
    }

    if (isExcluded) excludedScreens.push(key)
    else screens.push(key)
  }

  return { screens, excludedScreens }
}

export function generateScreens (configRelPath: string, outRelPath: string): void {
  try {
    const OUTPUT = resolve(outRelPath, 'screens.json')
    const src = readFileSync(configRelPath, 'utf8')
    const { screens, excludedScreens } = getPagesFromSource(src)
    mkdirSync(outRelPath, { recursive: true })
    const json = JSON.stringify(screens, null, 2) + '\n'
    writeFileSync(OUTPUT, json, 'utf8')
    // eslint-disable-next-line no-console
    console.log(`✅ screens.json успешно сгенерирован (${screens.length} экран${screens.length === 1 ? '' : 'ов'}) -> ${OUTPUT}`)
    if (excludedScreens.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`🔒 Исключены (${excludedScreens?.length}): ${excludedScreens.join(', ')}`)
    }
  } catch (err) {
    console.error(`❌ Failed to generate ${'file name'}: `, err)
    process.exit(1)
  }
}
