/**
 * Estrutura da resposta da IA para análise de WOD
 */
export interface WodAnalysis {
  /** Resumo breve do treino identificado */
  workout_summary: string
  
  /** Qual o estímulo esperado do treino */
  intent: string
  
  /** Dica tática passo a passo */
  strategy: string
  
  /** Opções de scaling para exercícios */
  scaling_options: ScalingOption[]
  
  /** Sugestões de carga baseadas nos PRs */
  suggested_weights: string
}

export interface ScalingOption {
  /** Nome do exercício original */
  exercise: string
  
  /** Sugestão de substituição/scaling */
  suggestion: string
  
  /** Motivo da adaptação */
  reason: string
}

/**
 * Payload para criação de WOD com análise
 */
export interface CreateWodPayload {
  imageBase64?: string
  imageUrl?: string
  originalText?: string
}

/**
 * Resultado da análise completa
 */
export interface AnalysisResult {
  success: boolean
  error?: string
  data?: {
    wodId: string
    analysis: WodAnalysis
  }
}

