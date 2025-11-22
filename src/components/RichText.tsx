'use client'

import { MathRenderer } from '@/components/MathRenderer'
import React from 'react'

function linkify(text: string): (string | React.ReactNode)[] {
  const parts: (string | React.ReactNode)[] = []
  const urlRegex = /(https?:\/\/[^\s)]+)/g
  let lastIndex = 0
  for (const match of text.matchAll(urlRegex)) {
    const start = match.index ?? 0
    if (start > lastIndex) parts.push(text.slice(lastIndex, start))
    const url = match[0]
    parts.push(
      <a key={start} href={url} target="_blank" rel="noreferrer" className="underline text-blue-600">
        {url}
      </a>
    )
    lastIndex = start + url.length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

export function RichText({ text, normalize = 'auto' }: { text: string; normalize?: 'auto' | 'force' | 'none' }) {
  if (!text) return null

  const blocks: (React.ReactNode | string)[] = []

  const autoMath = (t: string) => {
    // If content already contains LaTeX markers, trust IA and skip auto conversion
    if (t.includes('$')) return t
    let s = t
    // Explicit voltage subscripts only (avoid aggressive Vi/Vo conversions)
    s = s.replace(/\bV_([A-Za-z0-9]+)\b/g, (_, g1) => `$V_{${g1}}$`)
    s = s.replace(/\bV_(GS|DS|T|th)\b/g, (_, g1) => `$V_{${g1}}$`)
    s = s.replace(/([+\-]?\d+(?:\.\d+)?)\s*V\b/g, (_, num) => `$${num}\\,V$`)
    s = s.replace(/\bI_([A-Za-z0-9]+)\b/g, (_, g1) => `$I_{${g1}}$`)
    s = s.replace(/\bR_([A-Za-z0-9]+)\b/g, (_, g1) => `$R_{${g1}}$`)
    s = s.replace(/\bC_([A-Za-z0-9]+)\b/g, (_, g1) => `$C_{${g1}}$`)
    s = s.replace(/\bL_([A-Za-z0-9]+)\b/g, (_, g1) => `$L_{${g1}}$`)
    s = s.replace(/\bZ_([A-Za-z0-9]+)\b/g, (_, g1) => `$Z_{${g1}}$`)
    s = s.replace(/([+\-]?\d+(?:\.\d+)?)\s*A\b/g, (_, num) => `$${num}\\,A$`)
    s = s.replace(/([+\-]?\d+(?:\.\d+)?)\s*Ω\b/g, (_, num) => `$${num}\\,\\Omega$`)
    s = s.replace(/([+\-]?\d+(?:\.\d+)?)\s*F\b/g, (_, num) => `$${num}\\,F$`)
    s = s.replace(/([+\-]?\d+(?:\.\d+)?)\s*H\b/g, (_, num) => `$${num}\\,H$`)
    s = s.replace(/([+\-]?\d+(?:\.\d+)?)\s*W\b/g, (_, num) => `$${num}\\,W$`)
    s = s.replace(/([+\-]?\d+(?:\.\d+)?)\s*s\b/g, (_, num) => `$${num}\\,s$`)
    return s
  }

  const source = normalize === 'none' ? text : (normalize === 'force' ? autoMath(text.replace(/\$/g, '')) : autoMath(text))

  const processInline = (t: string) => {
    const result: (React.ReactNode | string)[] = []
    const inlineRegex = /\$(.+?)\$/g
    let lastIndex = 0
    for (const m of t.matchAll(inlineRegex)) {
      const start = m.index ?? 0
      if (start > lastIndex) result.push(...linkify(t.slice(lastIndex, start)))
      result.push(<MathRenderer key={start} formula={m[1]} />)
      lastIndex = start + m[0].length
    }
    if (lastIndex < t.length) result.push(...linkify(t.slice(lastIndex)))
    return result
  }

  const renderSegment = (segment: string, keyPrefix: string) => {
    const displayRegex = /\$\$([\s\S]+?)\$\$/g
    let last = 0
    for (const m of segment.matchAll(displayRegex)) {
      const start = m.index ?? 0
      if (start > last) {
        const prev = segment.slice(last, start)
        const sentences = splitIntoSentences(prev)
        sentences.forEach((sent, i) => {
          const k = `${keyPrefix}-sent-${last}-${i}`
          if (sent.trim().length === 0) return
          blocks.push(<span key={k}>{processInline(sent)}</span>)
          // break line after sentences that ended with period
          if (sent.trim().endsWith('.')) blocks.push(<br key={`${k}-br`} />)
        })
      }
      blocks.push(<div key={`${keyPrefix}-dm-${start}`} className="my-2"><MathRenderer formula={m[1]} display /></div>)
      last = start + m[0].length
    }
    if (last < segment.length) {
      const tail = segment.slice(last)
      const sentences = splitIntoSentences(tail)
      sentences.forEach((sent, i) => {
        const k = `${keyPrefix}-tail-${last}-${i}`
        if (sent.trim().length === 0) return
        blocks.push(<span key={k}>{processInline(sent)}</span>)
        if (sent.trim().endsWith('.')) blocks.push(<br key={`${k}-br`} />)
      })
    }
  }

  const codeFenceRegex = /```([\s\S]+?)```/g
  let lastGlobal = 0
  for (const m of source.matchAll(codeFenceRegex)) {
    const start = m.index ?? 0
    if (start > lastGlobal) {
      renderSegment(source.slice(lastGlobal, start), `seg-${lastGlobal}`)
    }
    const code = m[1]
    blocks.push(
      <pre key={`code-${start}`} className="bg-muted/30 p-3 rounded overflow-x-auto text-sm">
        <code className="font-mono whitespace-pre-wrap">{code}</code>
      </pre>
    )
    lastGlobal = start + m[0].length
  }
  if (lastGlobal < source.length) {
    renderSegment(source.slice(lastGlobal), `seg-tail-${lastGlobal}`)
  }

  return <div className="max-w-none">{blocks}</div>
}

function splitIntoSentences(text: string): string[] {
  const parts: string[] = []
  const re = /(?<!\d)\.(\s+|$)/g
  let last = 0
  for (const m of text.matchAll(re)) {
    const end = (m.index ?? 0) + 1
    const sent = text.slice(last, end)
    parts.push(sent)
    last = end + ((m[1]?.length) || 0)
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}