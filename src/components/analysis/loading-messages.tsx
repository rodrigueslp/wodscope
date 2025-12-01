"use client"

import { useState, useEffect } from "react"
import { Dumbbell, Brain, Eye, Calculator, Sparkles } from "lucide-react"

const loadingMessages = [
  { text: "Aquecendo os ombros...", icon: Dumbbell },
  { text: "Calculando a quantidade de magnésio...", icon: Calculator },
  { text: "Julgando a caligrafia do coach...", icon: Eye },
  { text: "Consultando o livro sagrado do CrossFit...", icon: Brain },
  { text: "Analisando padrões de movimento...", icon: Sparkles },
  { text: "Preparando estratégia de conquista...", icon: Dumbbell },
  { text: "Contando quantos burpees você vai odiar...", icon: Calculator },
  { text: "Decodificando abreviações misteriosas...", icon: Eye },
  { text: "Calculando seu sofrimento ideal...", icon: Brain },
  { text: "Quase lá, só mais um snatch...", icon: Sparkles },
]

export function AnalysisLoadingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Rotaciona mensagens a cada 2 segundos
    const messageInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 2000)

    // Simula progresso
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev
        return prev + Math.random() * 10
      })
    }, 500)

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
    }
  }, [])

  const CurrentIcon = loadingMessages[currentIndex].icon

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6">
      {/* Animated Logo/Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <CurrentIcon className="w-12 h-12 text-primary animate-pulse" />
        </div>
        
        {/* Rotating ring */}
        <div className="absolute inset-0 rounded-3xl border-2 border-transparent border-t-primary animate-spin" style={{ animationDuration: '2s' }} />
      </div>

      {/* Message */}
      <div className="text-center mb-8 h-16 flex items-center">
        <p className="text-lg font-medium animate-fade-in" key={currentIndex}>
          {loadingMessages[currentIndex].text}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Analisando com IA...
        </p>
      </div>

      {/* Fun facts */}
      <p className="text-xs text-muted-foreground/60 mt-8 max-w-sm text-center">
        💡 Dica: A IA analisa o treino baseado nos seus PRs e lesões para dar sugestões personalizadas
      </p>
    </div>
  )
}

// Skeleton para cards de resultado
export function AnalysisSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-24 bg-muted rounded-2xl" />
      <div className="h-40 bg-muted rounded-2xl" />
      <div className="h-32 bg-muted rounded-2xl" />
    </div>
  )
}

