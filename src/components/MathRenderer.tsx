'use client'

import 'katex/dist/katex.min.css'
import katex from 'katex'

export function MathRenderer({ formula, display = false }: { formula: string; display?: boolean }) {
  let html = ''
  try {
    html = katex.renderToString(formula, { displayMode: display, throwOnError: false })
  } catch {
    html = formula
  }
  if (display) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}