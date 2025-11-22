export interface QuizSession {
  id: string
  filename: string
  date: string
  mode: 'practice' | 'exam'
  total: number
  correct: number
  durationSec: number
  streakMax: number
  score: number
}

const KEY = 'estudaia_quiz_history'

export function saveSession(session: QuizSession) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(KEY)
    const arr: QuizSession[] = raw ? JSON.parse(raw) : []
    arr.unshift(session)
    localStorage.setItem(KEY, JSON.stringify(arr.slice(0, 20)))
  } catch {}
}

export function getSessions(): QuizSession[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function clearSessions() {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(KEY) } catch {}
}