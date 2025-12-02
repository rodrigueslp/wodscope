"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  X, 
  Zap, 
  Check, 
  Crown,
  Infinity,
  Shield,
  Sparkles,
  CreditCard,
  Loader2
} from "lucide-react"

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  creditsUsed?: number
}

const features = [
  { icon: Infinity, text: "Análises ilimitadas de WODs" },
  { icon: Zap, text: "IA GPT-4 Vision de última geração" },
  { icon: Shield, text: "Adaptações personalizadas para lesões" },
  { icon: Sparkles, text: "Sugestões de carga baseadas nos seus PRs" },
]

export function PaywallModal({ isOpen, onClose, creditsUsed = 1 }: PaywallModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setIsLoading(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setError('Erro ao iniciar pagamento. Tente novamente.')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative z-10 w-full max-w-md glass border-primary/20 animate-in fade-in zoom-in-95 duration-300">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <CardHeader className="text-center pt-8 pb-4">
          {/* Crown icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/25">
            <Crown className="w-8 h-8 text-white" />
          </div>
          
          <CardTitle className="text-2xl">
            Você usou sua análise grátis! 🎉
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Desbloqueie o poder completo do WodScope
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Stats */}
          <div className="flex justify-center gap-6 py-4 border-y border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{creditsUsed}</p>
              <p className="text-xs text-muted-foreground">análise feita</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">restantes</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm">{feature.text}</span>
                <Check className="w-4 h-4 text-green-500 ml-auto" />
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="text-center py-4">
            <div className="inline-flex items-baseline gap-1">
              <span className="text-4xl font-bold">R$ 9,90</span>
              <span className="text-muted-foreground">/mês</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Cancele quando quiser
            </p>
          </div>

          {/* CTA Button */}
          <Button 
            size="lg" 
            className="w-full h-14 text-base glow-lime"
            onClick={handleCheckout}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Redirecionando...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Assinar Agora
              </>
            )}
          </Button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
            <span>🔒 Pagamento seguro via Stripe</span>
          </div>

          {/* Stripe badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Powered by</span>
            <svg className="h-5" viewBox="0 0 60 25" fill="currentColor">
              <path d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a10.6 10.6 0 01-4.56.95c-4.01 0-6.83-2.5-6.83-7.28 0-4.19 2.39-7.32 6.29-7.32 3.87 0 5.91 2.96 5.91 6.9 0 .55-.03 1.17-.06 1.83h-.01zm-5.85-5.61c-1.1 0-2.12.78-2.21 2.43h4.34c-.06-1.62-.95-2.43-2.13-2.43zM30.65 5.99l.11 1.72c1.06-1.3 2.5-2.01 4.17-2.01 3.23 0 5.19 2.47 5.19 6.28v8.7h-4.28V12.4c0-1.91-.78-2.87-2.27-2.87-1.16 0-2.02.59-2.64 1.78v9.37h-4.28V5.99h4zm-17.02 0v14.69h4.28V5.99h-4.28zm46.1 0l.1 1.72c1.07-1.3 2.51-2.01 4.18-2.01 3.22 0 5.18 2.47 5.18 6.28v8.7h-4.27V12.4c0-1.91-.78-2.87-2.27-2.87-1.17 0-2.03.59-2.64 1.78v9.37h-4.28V5.99h4zM11.46 5.99l.1 1.72c1.07-1.3 2.5-2.01 4.17-2.01 3.23 0 5.19 2.47 5.19 6.28v8.7h-4.28V12.4c0-1.91-.78-2.87-2.27-2.87-1.16 0-2.02.59-2.63 1.78v9.37H7.46V5.99h4zM4.69 3.17C4.69 1.85 5.73.88 7.1.88s2.43.97 2.43 2.29c0 1.36-1.07 2.29-2.43 2.29S4.69 4.53 4.69 3.17z"/>
            </svg>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Versão inline/banner para usar em outras páginas
export function PaywallBanner({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Crown className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium">Upgrade para Pro</p>
          <p className="text-sm text-muted-foreground">
            Análises ilimitadas por apenas R$ 9,90/mês
          </p>
        </div>
        <Button size="sm" onClick={onUpgrade}>
          <Zap className="w-4 h-4 mr-1" />
          Upgrade
        </Button>
      </div>
    </div>
  )
}

// Badge de status do usuário
export function SubscriptionBadge({ isPro }: { isPro: boolean }) {
  if (isPro) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-orange-400 border border-orange-500/20">
        <Crown className="w-3 h-3" />
        PRO
      </span>
    )
  }
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
      FREE
    </span>
  )
}
