import * as fs from 'fs';
import * as path from 'path';

export function generateScreens(configRelPath: string, outRelPath: string): void {
  const configPath = path.resolve(process.cwd(), configRelPath);
  const outPath    = path.resolve(process.cwd(), outRelPath);

  const { pagesConfig } = require(configPath) as { pagesConfig: Record<string, any> };
  const screens = Object.keys(pagesConfig).filter(key => key !== '*');

  try {
    fs.writeFileSync(outPath, JSON.stringify(screens, null, 2), 'utf-8');
    console.log(`✅ Сгенерировано ${screens.length} экранов: ${outPath}`);
  } catch (err) {
    console.error('❌ Ошибка записи screens.json:', err);
    process.exit(1);
  }
}
