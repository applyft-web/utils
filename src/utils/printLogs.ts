export const printLogs = (...props: string[]): void => {
  if (window.sessionStorage.getItem('UTILS_DEBAG') === 'false') return
  console.log(...props)
}
