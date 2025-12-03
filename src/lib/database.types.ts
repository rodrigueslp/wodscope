export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type PRs = {
  snatch?: number
  clean?: number
  deadlift?: number
  squat?: number
  [key: string]: number | undefined
}

// Tipos para dados do atleta
export type Gender = 'male' | 'female' | 'other'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          prs: PRs | null
          injuries: string | null
          subscription_status: 'free' | 'pro'
          credits: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          // Novos campos de perfil do atleta
          age: number | null
          gender: Gender | null
          height: number | null // em cm
          experience_years: number | null // tempo de treino em anos
        }
        Insert: {
          id: string
          full_name?: string | null
          prs?: PRs | null
          injuries?: string | null
          subscription_status?: 'free' | 'pro'
          credits?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          age?: number | null
          gender?: Gender | null
          height?: number | null
          experience_years?: number | null
        }
        Update: {
          id?: string
          full_name?: string | null
          prs?: PRs | null
          injuries?: string | null
          subscription_status?: 'free' | 'pro'
          credits?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          age?: number | null
          gender?: Gender | null
          height?: number | null
          experience_years?: number | null
        }
      }
      wods: {
        Row: {
          id: string
          user_id: string
          image_url: string | null
          original_text: string | null
          ai_analysis: Json | null
          created_at: string
          // Campos de resultado
          result_type: 'time' | 'reps' | 'rounds_reps' | 'load' | 'completed' | null
          result_value: string | null
          feeling: number | null // 1-4
          athlete_notes: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          image_url?: string | null
          original_text?: string | null
          ai_analysis?: Json | null
          created_at?: string
          result_type?: 'time' | 'reps' | 'rounds_reps' | 'load' | 'completed' | null
          result_value?: string | null
          feeling?: number | null
          athlete_notes?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string | null
          original_text?: string | null
          ai_analysis?: Json | null
          created_at?: string
          result_type?: 'time' | 'reps' | 'rounds_reps' | 'load' | 'completed' | null
          result_value?: string | null
          feeling?: number | null
          athlete_notes?: string | null
          completed_at?: string | null
        }
      }
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Wod = Database['public']['Tables']['wods']['Row']
export type WodInsert = Database['public']['Tables']['wods']['Insert']
export type WodUpdate = Database['public']['Tables']['wods']['Update']

// Tipos para resultado do WOD
export type ResultType = 'time' | 'reps' | 'rounds_reps' | 'load' | 'completed'

export interface WodResult {
  result_type: ResultType
  result_value: string
  feeling: number // 1-4
  athlete_notes?: string
}

export const FEELING_EMOJIS = ['😫', '😐', '😊', '🔥'] as const
export const FEELING_LABELS = ['Muito difícil', 'Normal', 'Bom', 'Excelente'] as const

export const RESULT_TYPE_LABELS: Record<ResultType, string> = {
  time: 'Tempo (For Time)',
  reps: 'Repetições (AMRAP)',
  rounds_reps: 'Rounds + Reps',
  load: 'Carga (1RM/Max)',
  completed: 'Completado'
}

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Masculino',
  female: 'Feminino',
  other: 'Outro'
}

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  beginner: 'Iniciante (< 1 ano)',
  intermediate: 'Intermediário (1-3 anos)',
  advanced: 'Avançado (3-5 anos)',
  elite: 'Elite (5+ anos)'
}

export const EXPERIENCE_YEARS: Record<ExperienceLevel, string> = {
  beginner: 'menos de 1 ano',
  intermediate: '1 a 3 anos',
  advanced: '3 a 5 anos',
  elite: 'mais de 5 anos'
}

export interface PostWodFeedback {
  performance_rating: 'excelente' | 'bom' | 'regular' | 'abaixo'
  feedback: string
  tips_for_next: string
  encouragement: string
}

