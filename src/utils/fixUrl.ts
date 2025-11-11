export function fixEncodedUrl (sendEvent?: (name: string, data: object) => void): void {
  try {
    const href = window.location.href
    const url = new URL(href)

    const path = url.pathname
    const i1 = path.indexOf('%3F')
    const i2 = path.indexOf('%253F')
    const idx = i1 !== -1 ? i1 : i2
    if (idx === -1) return

    const isDouble = idx === i2
    const seqLen = isDouble ? 5 : 3

    const before = path.slice(0, idx)
    const encodedTail = path.slice(idx + seqLen)
    const decodedTail = decodeURIComponent(encodedTail)

    let fixedSearch = decodedTail ? `?${decodedTail.replace(/^\?+/, '')}` : ''
    if (url.search && url.search.length > 1) {
      fixedSearch += (fixedSearch ? '&' : '?') + url.search.slice(1)
    }

    const newUrl = url.origin + before + fixedSearch + url.hash
    if (newUrl !== href) {
      window.history.replaceState(null, '', newUrl)
      sendEvent?.('invalid_url_fix', { url: href, fixedUrl: newUrl })
    }
  } catch (e) {
    console.warn('URL fix failed:', e)
  }
}
