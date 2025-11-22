import { NextRequest, NextResponse } from 'next/server'
import { generateExplanation } from '@/lib/aiService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const term = (body?.term || '').toString().trim()
    const provider = (body?.provider || null) as string | null
    const apiKey = (body?.apiKey || null) as string | null
    const model = (body?.model || null) as string | null
    if (!term) return NextResponse.json({ error: 'Termo vazio' }, { status: 400 })

    const data = await generateExplanation(term, { provider: provider || 'google', apiKey: apiKey || undefined, model: model || 'gemini-flash-latest' })
    return NextResponse.json(data)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao explicar termo'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}