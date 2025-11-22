import { NextRequest, NextResponse } from 'next/server'
import { normalizeConcept } from '@/lib/aiService'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const concept = body?.concept
    const provider = body?.provider as string | undefined
    const apiKey = body?.apiKey as string | undefined
    const model = body?.model as string | undefined
    if (!concept || !concept.concept) return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
    const normalized = await normalizeConcept(concept, { provider, apiKey, model })
    return NextResponse.json({ concept: normalized })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro ao normalizar conceito'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
