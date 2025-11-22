'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Image as ImageIcon } from 'lucide-react'
import { RichText } from '@/components/RichText'

export function ExplainModal({ term, onClose }: { term: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ explanation: string; imageUrl?: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ term })
        })
        if (!res.ok) {
          const t = await res.text()
          throw new Error(t || 'Falha ao explicar termo')
        }
        const json = await res.json()
        setData(json)
      } catch (e: any) {
        setError(e.message || 'Erro ao explicar termo')
      } finally {
        setLoading(false)
      }
    })()
  }, [term])

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Explicação de "{term}"</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : (
          <div className="space-y-3">
            <RichText text={data?.explanation || ''} />
            {data?.imageUrl && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                <a href={data.imageUrl} target="_blank" rel="noreferrer" className="underline">Abrir imagem</a>
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}