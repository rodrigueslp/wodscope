"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  Camera, 
  Target, 
  Clock, 
  ChevronRight, 
  Settings,
  Zap,
  TrendingUp,
  Type,
  Coins
} from "lucide-react"
import { AnalysisLoadingScreen } from "@/components/analysis"
import { PaywallModal, PaywallBanner, SubscriptionBadge } from "@/components/paywall"
import { analyzeWod, analyzeWodFromText } from "@/actions/analyze"
import { checkCredits, useCredit, type CreditStatus } from "@/actions/credits"
import { getProfile } from "@/actions/profile"
import { getWods } from "@/actions/wods"
import type { Profile, Wod } from "@/lib/database.types"
import type { WodAnalysis } from "@/lib/ai.types"

export default function DashboardPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showTextInput, setShowTextInput] = useState(false)
  const [wodText, setWodText] = useState("")
  const [error, setError] = useState<string | null>(null)
  
  // Data state
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentWods, setRecentWods] = useState<Wod[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  
  // Paywall state
  const [showPaywall, setShowPaywall] = useState(false)
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null)

  // Carrega dados ao montar
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileResult, wodsResult, creditsResult] = await Promise.all([
          getProfile(),
          getWods(5),
          checkCredits()
        ])

        if (profileResult.data) {
          setProfile(profileResult.data)
        }
        if (wodsResult.data) {
          setRecentWods(wodsResult.data)
        }
        setCreditStatus(creditsResult)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
      } finally {
        setIsLoadingData(false)
      }
    }
    loadData()
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Verifica créditos antes de analisar
    const status = await checkCredits()
    setCreditStatus(status)
    
    if (!status.canAnalyze) {
      setShowPaywall(true)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setIsAnalyzing(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const result = await analyzeWod(formData)
      
      if (result.success && result.data) {
        await useCredit()
        router.push(`/analysis/${result.data.wodId}`)
      } else {
        setError(result.error || 'Erro ao analisar imagem')
        setIsAnalyzing(false)
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setIsAnalyzing(false)
    }
  }

  const handleTextAnalysis = async () => {
    if (!wodText.trim()) return

    const status = await checkCredits()
    setCreditStatus(status)
    
    if (!status.canAnalyze) {
      setShowPaywall(true)
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await analyzeWodFromText(wodText)
      
      if (result.success && result.data) {
        await useCredit()
        router.push(`/analysis/${result.data.wodId}`)
      } else {
        setError(result.error || 'Erro ao analisar WOD')
        setIsAnalyzing(false)
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setIsAnalyzing(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return `Hoje, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    if (diffDays === 1) return `Ontem, ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  // Mostrar tela de loading durante análise
  if (isAnalyzing) {
    return <AnalysisLoadingScreen />
  }

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Paywall Modal */}
      <PaywallModal 
        isOpen={showPaywall} 
        onClose={() => setShowPaywall(false)}
        creditsUsed={1}
      />

      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-muted-foreground">Olá,</p>
                {creditStatus && <SubscriptionBadge isPro={creditStatus.isPro} />}
              </div>
              <p className="font-semibold">{profile?.full_name || 'Atleta'}</p>
            </div>
          </div>
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-6 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Credits Banner (only for free users) */}
        {creditStatus && !creditStatus.isPro && (
          <Card className="glass border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Créditos Disponíveis</p>
                    <p className="text-xs text-muted-foreground">
                      {creditStatus.credits > 0 
                        ? `${creditStatus.credits} análise${creditStatus.credits > 1 ? 's' : ''} grátis`
                        : 'Sem créditos'
                      }
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{creditStatus.credits}</p>
                </div>
              </div>
              
              {creditStatus.credits === 0 && (
                <Button 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => setShowPaywall(true)}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Obter mais créditos
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Análises</span>
              </div>
              <p className="text-2xl font-bold">{recentWods.length}</p>
              <p className="text-xs text-muted-foreground">total</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Status</span>
              </div>
              <p className="text-2xl font-bold">{creditStatus?.isPro ? '∞' : creditStatus?.credits || 0}</p>
              <p className="text-xs text-muted-foreground">{creditStatus?.isPro ? 'ilimitado' : 'créditos'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main CTA - Analyze Board */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {!showTextInput ? (
            <button
              onClick={triggerFileInput}
              className="w-full aspect-[4/3] rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-300 flex flex-col items-center justify-center gap-4 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-10 h-10 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg">Analisar Lousa</p>
                <p className="text-sm text-muted-foreground">
                  Tire uma foto do WOD de hoje
                </p>
              </div>
              
              {creditStatus && !creditStatus.isPro && creditStatus.credits > 0 && (
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                  {creditStatus.credits} crédito{creditStatus.credits > 1 ? 's' : ''}
                </div>
              )}
            </button>
          ) : (
            <Card className="glass">
              <CardContent className="p-4">
                <textarea
                  value={wodText}
                  onChange={(e) => setWodText(e.target.value)}
                  placeholder="Cole ou digite o WOD aqui...&#10;&#10;Ex:&#10;21-15-9&#10;Thrusters (43kg)&#10;Pull-ups"
                  className="w-full h-32 bg-transparent border-none resize-none focus:outline-none text-sm placeholder:text-muted-foreground font-mono"
                />
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowTextInput(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleTextAnalysis}
                    disabled={!wodText.trim()}
                    className="flex-1"
                  >
                    Analisar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!showTextInput && (
            <button
              onClick={() => setShowTextInput(true)}
              className="w-full mt-3 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
            >
              <Type className="w-4 h-4" />
              Ou digite o WOD manualmente
            </button>
          )}
        </div>

        {/* Upgrade Banner */}
        {creditStatus && !creditStatus.isPro && creditStatus.credits === 0 && (
          <PaywallBanner onUpgrade={() => setShowPaywall(true)} />
        )}

        {/* Recent Analyses */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Análises Recentes</h2>
            {recentWods.length > 0 && (
              <Link href="/history" className="text-sm text-primary hover:underline">
                Ver todas
              </Link>
            )}
          </div>

          {isLoadingData ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="glass animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-3 w-full bg-muted rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : recentWods.length === 0 ? (
            <Card className="glass">
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">Nenhuma análise ainda</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tire uma foto da lousa para começar!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentWods.map((wod) => {
                const analysis = wod.ai_analysis as WodAnalysis | null
                return (
                  <Link key={wod.id} href={`/analysis/${wod.id}`}>
                    <Card className="glass hover:bg-card/80 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Target className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium">
                                {analysis?.workout_summary?.split('\n')[0] || wod.original_text?.substring(0, 30) || 'WOD'}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {analysis?.intent?.substring(0, 50) || 'Análise disponível'}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(wod.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border px-6 py-3 safe-area-inset-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-primary">
            <Target className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/history" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Clock className="w-5 h-5" />
            <span className="text-xs">Histórico</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="w-5 h-5" />
            <span className="text-xs">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
