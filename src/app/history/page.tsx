"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, 
  Target, 
  Clock, 
  ChevronRight, 
  Settings,
  Calendar,
  Search,
  Trash2
} from "lucide-react"
import { getWods, deleteWod } from "@/actions/wods"
import type { Wod } from "@/lib/database.types"
import type { WodAnalysis } from "@/lib/ai.types"

export default function HistoryPage() {
  const [wods, setWods] = useState<Wod[]>([])
  const [filteredWods, setFilteredWods] = useState<Wod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const loadWods = async () => {
      try {
        const result = await getWods()
        const wodsData = result.data as Wod[] | null
        if (wodsData) {
          setWods(wodsData)
          setFilteredWods(wodsData)
        }
      } catch (err) {
        console.error('Erro ao carregar histórico:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadWods()
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredWods(wods)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredWods(wods.filter(wod => {
        const analysis = wod.ai_analysis as WodAnalysis | null
        return (
          analysis?.workout_summary?.toLowerCase().includes(term) ||
          wod.original_text?.toLowerCase().includes(term) ||
          analysis?.intent?.toLowerCase().includes(term)
        )
      }))
    }
  }, [searchTerm, wods])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta análise?')) return
    
    setDeletingId(id)
    try {
      await deleteWod(id)
      setWods(prev => prev.filter(w => w.id !== id))
    } catch (err) {
      console.error('Erro ao excluir:', err)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const groupByMonth = (wods: Wod[]) => {
    const groups: { [key: string]: Wod[] } = {}
    
    wods.forEach(wod => {
      const date = new Date(wod.created_at)
      const key = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      if (!groups[key]) groups[key] = []
      groups[key].push(wod)
    })

    return Object.entries(groups)
  }

  const groupedWods = groupByMonth(filteredWods)

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="font-bold text-lg">Histórico</h1>
        </div>
      </header>

      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar análises..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* History List */}
      <main className="flex-1 px-6 space-y-6">
        {isLoading ? (
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
        ) : filteredWods.length === 0 ? (
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">
                {searchTerm ? 'Nenhuma análise encontrada' : 'Nenhuma análise ainda'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm 
                  ? 'Tente outro termo de busca'
                  : 'Tire uma foto da lousa para começar!'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          groupedWods.map(([month, monthWods]) => (
            <section key={month}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-sm font-medium text-muted-foreground capitalize">{month}</h2>
              </div>

              <div className="space-y-2">
                {monthWods.map((wod) => {
                  const analysis = wod.ai_analysis as WodAnalysis | null
                  return (
                    <Card key={wod.id} className="glass">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <Link href={`/analysis/${wod.id}`} className="flex items-center gap-3 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Target className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {analysis?.workout_summary?.split('\n')[0] || wod.original_text?.substring(0, 30) || 'WOD'}
                              </p>
                              <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {analysis?.intent?.substring(0, 50) || 'Análise disponível'}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {formatDate(wod.created_at)}
                              </p>
                            </div>
                          </Link>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-400"
                              onClick={() => handleDelete(wod.id)}
                              disabled={deletingId === wod.id}
                            >
                              {deletingId === wod.id ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                            <Link href={`/analysis/${wod.id}`}>
                              <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </section>
          ))
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border px-6 py-3 safe-area-inset-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Target className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/history" className="flex flex-col items-center gap-1 text-primary">
            <Clock className="w-5 h-5" />
            <span className="text-xs font-medium">Histórico</span>
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
