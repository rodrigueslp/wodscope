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
        }
        Insert: {
          id?: string
          user_id: string
          image_url?: string | null
          original_text?: string | null
          ai_analysis?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string | null
          original_text?: string | null
          ai_analysis?: Json | null
          created_at?: string
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

