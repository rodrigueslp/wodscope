"use client"

import { AlertTriangle, ShieldAlert, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface InjuryAlertProps {
  injury: string
  className?: string
  variant?: "warning" | "danger" | "info"
}

export function InjuryAlert({ injury, className, variant = "warning" }: InjuryAlertProps) {
  const variants = {
    warning: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      icon: "text-yellow-500",
      text: "text-yellow-200"
    },
    danger: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      icon: "text-red-500",
      text: "text-red-200"
    },
    info: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      icon: "text-blue-500",
      text: "text-blue-200"
    }
  }

  const style = variants[variant]
  const Icon = variant === "danger" ? ShieldAlert : variant === "info" ? Info : AlertTriangle

  return (
    <div className={cn(
      "rounded-xl border p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300",
      style.bg,
      style.border,
      className
    )}>
      <div className={cn("p-2 rounded-lg", style.bg)}>
        <Icon className={cn("w-5 h-5", style.icon)} />
      </div>
      <div className="flex-1">
        <p className={cn("font-semibold text-sm", style.icon)}>
          {variant === "danger" ? "⚠️ Atenção!" : variant === "info" ? "💡 Dica" : "🛡️ Cuidado"}
        </p>
        <p className={cn("text-sm mt-1", style.text)}>
          {injury}
        </p>
      </div>
    </div>
  )
}

// Card de lesão específico para o perfil
interface InjuryBadgeProps {
  bodyPart: string
  className?: string
}

export function InjuryBadge({ bodyPart, className }: InjuryBadgeProps) {
  // Mapeia partes do corpo para emojis
  const bodyPartEmojis: Record<string, string> = {
    ombro: "💪",
    joelho: "🦵",
    costas: "🔙",
    lombar: "🔙",
    punho: "✊",
    cotovelo: "💪",
    quadril: "🦴",
    tornozelo: "🦶",
    pescoço: "🧣",
  }

  const lowerPart = bodyPart.toLowerCase()
  const emoji = Object.entries(bodyPartEmojis).find(([key]) => lowerPart.includes(key))?.[1] || "⚠️"

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
      "bg-red-500/10 text-red-400 border border-red-500/20",
      className
    )}>
      <span>{emoji}</span>
      <span>{bodyPart}</span>
    </span>
  )
}

// Componente visual de corpo humano mostrando lesões (simplificado)
interface BodyMapProps {
  injuries: string[]
  className?: string
}

export function InjuryBodyMap({ injuries, className }: BodyMapProps) {
  const injuryString = injuries.join(" ").toLowerCase()
  
  const bodyParts = {
    head: injuryString.includes("cabeça") || injuryString.includes("pescoço"),
    shoulder: injuryString.includes("ombro"),
    arm: injuryString.includes("braço") || injuryString.includes("cotovelo") || injuryString.includes("punho"),
    chest: injuryString.includes("peito") || injuryString.includes("peitoral"),
    back: injuryString.includes("costas") || injuryString.includes("lombar"),
    core: injuryString.includes("abdom") || injuryString.includes("core"),
    hip: injuryString.includes("quadril"),
    leg: injuryString.includes("joelho") || injuryString.includes("coxa") || injuryString.includes("perna"),
    foot: injuryString.includes("tornozelo") || injuryString.includes("pé"),
  }

  return (
    <div className={cn("flex justify-center", className)}>
      <svg 
        viewBox="0 0 100 160" 
        className="w-24 h-40"
        fill="none"
      >
        {/* Cabeça */}
        <circle 
          cx="50" cy="15" r="12" 
          className={cn(
            "stroke-current transition-colors",
            bodyParts.head ? "fill-red-500/30 stroke-red-500" : "fill-muted/20 stroke-muted-foreground/30"
          )}
          strokeWidth="2"
        />
        
        {/* Corpo/Tronco */}
        <rect 
          x="35" y="30" width="30" height="45" rx="5"
          className={cn(
            "stroke-current transition-colors",
            (bodyParts.chest || bodyParts.back || bodyParts.core) 
              ? "fill-red-500/30 stroke-red-500" 
              : "fill-muted/20 stroke-muted-foreground/30"
          )}
          strokeWidth="2"
        />
        
        {/* Ombro esquerdo */}
        <circle 
          cx="30" cy="35" r="6"
          className={cn(
            "stroke-current transition-colors",
            bodyParts.shoulder ? "fill-red-500/30 stroke-red-500" : "fill-muted/20 stroke-muted-foreground/30"
          )}
          strokeWidth="2"
        />
        
        {/* Ombro direito */}
        <circle 
          cx="70" cy="35" r="6"
          className={cn(
            "stroke-current transition-colors",
            bodyParts.shoulder ? "fill-red-500/30 stroke-red-500" : "fill-muted/20 stroke-muted-foreground/30"
          )}
          strokeWidth="2"
        />
        
        {/* Braço esquerdo */}
        <rect 
          x="18" y="40" width="8" height="30" rx="4"
          className={cn(
            "stroke-current transition-colors",
            bodyParts.arm ? "fill-red-500/30 stroke-red-500" : "fill-muted/20 stroke-muted-foreground/30"
          )}
          strokeWidth="2"
        />
        
        {/* Braço direito */}
        <rect 
          x="74" y="40" width="8" height="30" rx="4"
          className={cn(
            "stroke-current transition-colors",
            bodyParts.arm ? "fill-red-500/30 stroke-red-500" : "fill-muted/20 stroke-muted-foreground/30"
          )}
          strokeWidth="2"
        />
        
        {/* Quadril */}
        <ellipse 
          cx="50" cy="82" rx="18" ry="8"
          className={cn(
            "stroke-current transition-colors",
            bodyParts.hip ? "fill-red-500/30 stroke-red-500" : "fill-muted/20 stroke-muted-foreground/30"
          )}
          strokeWidth="2"
        />
        
        {/* Perna esquerda */}
        <rect 
          x="35" y="90" width="10" height="45" rx="5"
          className={cn(
            "stroke-current transition-colors",
            bodyParts.leg ? "fill-red-500/30 stroke-red-500" : "fill-muted/20 stroke-muted-foreground/30"
          )}
          strokeWidth="2"
        />
        
        {/* Perna direita */}
        <rect 
          x="55" y="90" width="10" height="45" rx="5"
          className={cn(
            "stroke-current transition-colors",
            bodyParts.leg ? "fill-red-500/30 stroke-red-500" : "fill-muted/20 stroke-muted-foreground/30"
          )}
          strokeWidth="2"
        />
        
        {/* Pé esquerdo */}
        <ellipse 
          cx="40" cy="142" rx="8" ry="5"
          className={cn(
            "stroke-current transition-colors",
            bodyParts.foot ? "fill-red-500/30 stroke-red-500" : "fill-muted/20 stroke-muted-foreground/30"
          )}
          strokeWidth="2"
        />
        
        {/* Pé direito */}
        <ellipse 
          cx="60" cy="142" rx="8" ry="5"
          className={cn(
            "stroke-current transition-colors",
            bodyParts.foot ? "fill-red-500/30 stroke-red-500" : "fill-muted/20 stroke-muted-foreground/30"
          )}
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}

