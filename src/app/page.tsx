import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Target, Zap, Shield } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Wod<span className="text-primary">Scope</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Análise Inteligente de WODs
          </p>
        </div>

        {/* Value Props */}
        <div className="space-y-4 mb-10 max-w-sm">
          <div className="flex items-center gap-3 text-left">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Estratégias Personalizadas</p>
              <p className="text-xs text-muted-foreground">Baseadas nos seus PRs e capacidades</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-left">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Cargas Sugeridas</p>
              <p className="text-xs text-muted-foreground">Calculadas com base no seu perfil</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-left">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Adaptações de Lesão</p>
              <p className="text-xs text-muted-foreground">Proteja seu corpo, maximize resultados</p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="w-full max-w-sm space-y-3">
          <Link href="/auth" className="block">
            <Button size="xl" className="w-full">
              Começar Agora
            </Button>
          </Link>
          <Link href="/auth?mode=login" className="block">
            <Button variant="ghost" size="lg" className="w-full">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        <p>© 2024 WodScope. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}

