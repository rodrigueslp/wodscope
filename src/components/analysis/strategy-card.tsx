"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Flame, Lightbulb, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface StrategyCardProps {
  strategy: string
  className?: string
}

export function StrategyCard({ strategy, className }: StrategyCardProps) {
  // Detecta se tem passos numerados claros (1. 2. 3.) ou bullets (• -)
  const hasNumberedSteps = /^\s*\d+\.\s/.test(strategy) || /\n\s*\d+\.\s/.test(strategy)
  const hasBulletPoints = /^\s*[•\-]\s/.test(strategy) || /\n\s*[•\-]\s/.test(strategy)
  
  let steps: string[] = []
  
  if (hasNumberedSteps) {
    // Split por números seguidos de ponto (1. 2. 3.)
    steps = strategy
      .split(/\n?\s*\d+\.\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 10) // Ignora fragmentos muito curtos
  } else if (hasBulletPoints) {
    // Split por bullets
    steps = strategy
      .split(/\n?\s*[•\-]\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 10)
  }
  
  // Se não detectou passos válidos ou os passos são muito curtos, mostra como parágrafos
  const hasValidSteps = steps.length > 1
  
  // Se não tem passos, quebra por parágrafos (duas quebras de linha ou sentenças longas)
  const paragraphs = !hasValidSteps 
    ? strategy.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0)
    : []

  return (
    <Card className={cn("glass overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Target className="w-4 h-4 text-primary" />
          </div>
          Estratégia de Execução
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasValidSteps ? (
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {step}
                </p>
              </div>
            ))}
          </div>
        ) : paragraphs.length > 1 ? (
          <div className="space-y-4">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {strategy}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface IntentCardProps {
  intent: string
  className?: string
}

export function IntentCard({ intent, className }: IntentCardProps) {
  // Detecta palavras-chave para cor
  const intentLower = intent.toLowerCase()
  const isCardio = intentLower.includes("cardio") || intentLower.includes("metab") || intentLower.includes("resist")
  const isStrength = intentLower.includes("força") || intentLower.includes("potência") || intentLower.includes("strength")
  const isSkill = intentLower.includes("técnic") || intentLower.includes("skill") || intentLower.includes("habilidade")

  const bgColor = isCardio 
    ? "from-orange-500/20 to-red-500/20" 
    : isStrength 
      ? "from-blue-500/20 to-purple-500/20"
      : isSkill
        ? "from-green-500/20 to-teal-500/20"
        : "from-primary/20 to-primary/10"

  const iconColor = isCardio 
    ? "text-orange-400" 
    : isStrength 
      ? "text-blue-400"
      : isSkill
        ? "text-green-400"
        : "text-primary"

  return (
    <Card className={cn("glass overflow-hidden", className)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", bgColor)} />
      <CardContent className="relative p-5">
        <div className="flex items-start gap-3">
          <div className={cn("p-2 rounded-lg bg-background/50", iconColor)}>
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Estímulo do Treino</p>
            <p className="font-medium">{intent}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface WorkoutSummaryCardProps {
  summary: string
  className?: string
}

export function WorkoutSummaryCard({ summary, className }: WorkoutSummaryCardProps) {
  return (
    <Card className={cn("glass border-primary/20 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
      <CardContent className="relative p-5">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">WOD Identificado</span>
        </div>
        <pre className="font-mono text-lg font-bold whitespace-pre-wrap leading-relaxed">
          {summary}
        </pre>
      </CardContent>
    </Card>
  )
}

interface ScalingOptionCardProps {
  exercise: string
  suggestion: string
  reason: string
  index?: number
  className?: string
}

export function ScalingOptionCard({ exercise, suggestion, reason, index = 0, className }: ScalingOptionCardProps) {
  return (
    <Card 
      className={cn("glass overflow-hidden animate-in fade-in slide-in-from-bottom-2", className)}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground mb-1">Original</p>
            <p className="font-medium text-sm">{exercise}</p>
          </div>
          
          <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
          
          <div className="flex-1 p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Adaptar para</p>
            <p className="font-medium text-sm text-primary">{suggestion}</p>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">
          💡 {reason}
        </p>
      </CardContent>
    </Card>
  )
}

