export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  type: 'multiple_choice' | 'true_false' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string | boolean;
  explanation?: string;
}

export interface StudySchedule {
  type: 'quick' | 'standard' | 'deep';
  duration: string;
  description: string;
  activities: string[];
}

export interface AnalysisResult {
  id: string;
  filename: string;
  uploadDate: string;
  summary: string;
  references?: Array<{ title: string; url: string; source?: string }>;
  conceptMap: string;
  keyConcepts: Array<{
    concept: string;
    explanation: string;
    details?: string;
    example?: string;
    imageUrl?: string | string[];
    values?: Array<{ label: string; value?: string; valueNumber?: number; unitPrefix?: string; unitSymbol?: string; formatted?: string }>;
    formula?: string;
  }>;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  studySchedules: StudySchedule[];
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}