import { NextResponse } from 'next/server'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          access: 'public',
          addRandomSuffix: true,
          allowedContentTypes: [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          ],
        }
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('[Blob] Upload concluído', blob.url)
      },
    })
    return NextResponse.json(jsonResponse)
  } catch (error) {
    const msg = (error as Error).message
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
