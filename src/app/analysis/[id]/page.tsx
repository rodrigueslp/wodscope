"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Target, 
  Dumbbell, 
  Shield, 
  Share2,
  Bookmark,
  CheckCircle,
  Trash2
} from "lucide-react"
import {
  AnalysisSkeleton,
  BarbellWeights,
  InjuryAlert,
  InjuryBodyMap,
  StrategyCard,
  IntentCard,
  WorkoutSummaryCard,
  ScalingOptionCard
} from "@/components/analysis"
import { getWodById, deleteWod } from "@/actions/wods"
import { getProfile } from "@/actions/profile"
import type { WodAnalysis } from "@/lib/ai.types"

function extractWeight(text: string): number | null {
  const match = text.match(/(\d+)\s*kg/i)
  return match ? parseInt(match[1]) : null
}

export default function AnalysisPage() {
  const params = useParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("strategy")
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [analysis, setAnalysis] = useState<WodAnalysis | null>(null)
  const [userInjuries, setUserInjuries] = useState<string[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [wodResult, profileResult] = await Promise.all([
          getWodById(params.id as string),
          getProfile()
        ])

        if (wodResult.data?.ai_analysis) {
          setAnalysis(wodResult.data.ai_analysis as WodAnalysis)
        }
        
        if (profileResult.data?.injuries) {
          setUserInjuries([profileResult.data.injuries])
        }
      } catch (err) {
        console.error('Erro ao carregar análise:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [params.id])

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta análise?')) return
    
    setIsDeleting(true)
    try {
      await deleteWod(params.id as string)
      router.push('/dashboard')
    } catch (err) {
      console.error('Erro ao excluir:', err)
      setIsDeleting(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share && analysis) {
      try {
        await navigator.share({
          title: 'WodScope - Análise',
          text: analysis.workout_summary,
          url: window.location.href
        })
      } catch {
        // User cancelled or error
      }
    }
  }

  const suggestedWeight = analysis ? extractWeight(analysis.suggested_weights) : null

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col pb-6 px-6 pt-20">
        <AnalysisSkeleton />
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <Target className="w-16 h-16 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">Análise não encontrada</p>
        <p className="text-sm text-muted-foreground mb-6">Esta análise pode ter sido excluída</p>
        <Link href="/dashboard">
          <Button>Voltar ao Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col pb-6">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-lg">Análise</h1>
              <p className="text-xs text-muted-foreground">Resultado da IA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleShare}>
              <Share2 className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full"
              onClick={() => setIsSaved(!isSaved)}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? "fill-primary text-primary" : ""}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full text-muted-foreground hover:text-red-400"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* WOD Summary */}
      <div className="px-6 py-4">
        <WorkoutSummaryCard summary={analysis.workout_summary} />
      </div>

      {/* Intent Card */}
      <div className="px-6 pb-4">
        <IntentCard intent={analysis.intent} />
      </div>

      {/* Tabs */}
      <div className="px-6 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="strategy" className="gap-1.5">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Estratégia</span>
            </TabsTrigger>
            <TabsTrigger value="loads" className="gap-1.5">
              <Dumbbell className="w-4 h-4" />
              <span className="hidden sm:inline">Cargas</span>
            </TabsTrigger>
            <TabsTrigger value="adaptations" className="gap-1.5">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Adaptações</span>
            </TabsTrigger>
          </TabsList>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="space-y-4 mt-6">
            <StrategyCard strategy={analysis.strategy} />
            
            <Card className="glass border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Dicas Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-primary font-bold">•</span>
                    <span>Mantenha o ritmo respiratório constante</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-primary font-bold">•</span>
                    <span>Transições rápidas entre exercícios</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <span className="text-primary font-bold">•</span>
                    <span>Foco na técnica, especialmente quando cansado</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loads Tab */}
          <TabsContent value="loads" className="space-y-4 mt-6">
            {suggestedWeight && suggestedWeight >= 20 && (
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Montagem da Barra</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarbellWeights weightKg={suggestedWeight} />
                </CardContent>
              </Card>
            )}

            <Card className="glass border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  Sugestão de Carga
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {analysis.suggested_weights}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Adaptations Tab */}
          <TabsContent value="adaptations" className="space-y-4 mt-6">
            {userInjuries.length > 0 && userInjuries[0] && (
              <>
                <InjuryAlert 
                  injury={`Lesões cadastradas: ${userInjuries.join(", ")}`}
                  variant="danger"
                />
                <Card className="glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Áreas de Atenção</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <InjuryBodyMap injuries={userInjuries} />
                  </CardContent>
                </Card>
              </>
            )}

            {analysis.scaling_options && analysis.scaling_options.length > 0 ? (
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Adaptações Sugeridas
                </h3>
                {analysis.scaling_options.map((option, index) => (
                  <ScalingOptionCard
                    key={index}
                    exercise={option.exercise}
                    suggestion={option.suggestion}
                    reason={option.reason}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <Card className="glass">
                <CardContent className="p-6 text-center">
                  <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="font-medium">Nenhuma adaptação necessária</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Você pode executar o treino como prescrito! 💪
                  </p>
                </CardContent>
              </Card>
            )}

            <InjuryAlert 
              injury="Sempre faça um aquecimento adequado. Se sentir dor, pare imediatamente e consulte um profissional."
              variant="info"
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* CTA Button */}
      <div className="px-6 mt-6">
        <Link href="/dashboard">
          <Button size="lg" className="w-full glow-lime">
            <Target className="w-5 h-5 mr-2" />
            Pronto para o WOD!
          </Button>
        </Link>
      </div>
    </div>
  )
}
