"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  CheckCircle, 
  Clock, 
  Repeat, 
  Dumbbell, 
  Trophy,
  Loader2,
  MessageCircle,
  Sparkles
} from "lucide-react"
import { saveWodResult } from "@/actions/wods"
import { generatePostWodFeedback } from "@/actions/analyze"
import { 
  FEELING_EMOJIS, 
  FEELING_LABELS, 
  RESULT_TYPE_LABELS,
  type ResultType,
  type WodResult 
} from "@/lib/database.types"

interface ResultFormProps {
  wodId: string
  wodSummary?: string
  onSuccess?: () => void
  existingResult?: {
    result_type: ResultType | null
    result_value: string | null
    feeling: number | null
    athlete_notes: string | null
    post_wod_feedback?: string | null
  }
}

const RESULT_TYPE_ICONS: Record<ResultType, React.ReactNode> = {
  time: <Clock className="w-5 h-5" />,
  reps: <Repeat className="w-5 h-5" />,
  rounds_reps: <Trophy className="w-5 h-5" />,
  load: <Dumbbell className="w-5 h-5" />,
  completed: <CheckCircle className="w-5 h-5" />
}

const RESULT_TYPE_PLACEHOLDERS: Record<ResultType, string> = {
  time: "12:35",
  reps: "150",
  rounds_reps: "5+12",
  load: "95kg",
  completed: "Completado"
}

export function ResultForm({ wodId, wodSummary, onSuccess, existingResult }: ResultFormProps) {
  const [resultType, setResultType] = useState<ResultType | null>(existingResult?.result_type || null)
  const [resultValue, setResultValue] = useState(existingResult?.result_value || "")
  const [feeling, setFeeling] = useState<number | null>(existingResult?.feeling || null)
  const [notes, setNotes] = useState(existingResult?.athlete_notes || "")
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(!!existingResult?.result_type)
  const [aiFeedback, setAiFeedback] = useState<string | null>(existingResult?.post_wod_feedback || null)

  const handleSubmit = async () => {
    if (!resultType || !feeling) {
      setError("Selecione o tipo de resultado e como você se sentiu")
      return
    }

    if (resultType !== 'completed' && !resultValue.trim()) {
      setError("Preencha o resultado")
      return
    }

    setIsLoading(true)
    setError(null)

    const finalResultValue = resultType === 'completed' ? 'Completado' : resultValue

    const result: WodResult = {
      result_type: resultType,
      result_value: finalResultValue,
      feeling,
      athlete_notes: notes.trim() || undefined
    }

    const response = await saveWodResult(wodId, result)

    if (response.error) {
      setError(response.error)
      setIsLoading(false)
      return
    }

    setSaved(true)
    setIsLoading(false)

    // Gerar feedback da IA
    if (wodSummary) {
      setIsGeneratingFeedback(true)
      const feedbackResponse = await generatePostWodFeedback(
        wodId,
        wodSummary,
        resultType,
        finalResultValue,
        feeling,
        notes.trim() || undefined
      )
      
      if (feedbackResponse.success && feedbackResponse.feedback) {
        setAiFeedback(feedbackResponse.feedback)
      }
      setIsGeneratingFeedback(false)
    }

    onSuccess?.()
  }

  if (saved && !isLoading) {
    return (
      <div className="space-y-4">
        <Card className="glass border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-green-500">Resultado Registrado!</h3>
                <p className="text-sm text-muted-foreground">
                  {resultValue} • {FEELING_EMOJIS[(feeling || 1) - 1]} {FEELING_LABELS[(feeling || 1) - 1]}
                </p>
              </div>
            </div>
            {notes && (
              <p className="text-sm text-muted-foreground italic border-l-2 border-green-500/30 pl-3 mb-4">
                &ldquo;{notes}&rdquo;
              </p>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSaved(false)
                setAiFeedback(null)
              }}
            >
              Editar resultado
            </Button>
          </CardContent>
        </Card>

        {/* AI Feedback Card */}
        {isGeneratingFeedback && (
          <Card className="glass border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="font-medium">Gerando feedback...</p>
                  <p className="text-sm text-muted-foreground">Seu coach está analisando seu resultado</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {aiFeedback && !isGeneratingFeedback && (
          <Card className="glass border-primary/20 overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-3 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Feedback do Coach</span>
              </div>
            </div>
            <CardContent className="p-6">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {aiFeedback}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <Card className="glass border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Registrar Resultado
        </CardTitle>
        <CardDescription>
          Como foi seu desempenho? Seu coach vai te dar um feedback personalizado!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de Resultado */}
        <div className="space-y-3">
          <Label>Tipo de resultado</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(Object.keys(RESULT_TYPE_LABELS) as ResultType[]).map((type) => (
              <Button
                key={type}
                type="button"
                variant={resultType === type ? "default" : "outline"}
                className={`h-auto py-3 flex flex-col gap-1 ${resultType === type ? 'ring-2 ring-primary' : ''}`}
                onClick={() => {
                  setResultType(type)
                  if (type === 'completed') setResultValue('Completado')
                }}
              >
                {RESULT_TYPE_ICONS[type]}
                <span className="text-xs">{RESULT_TYPE_LABELS[type]}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Valor do Resultado */}
        {resultType && resultType !== 'completed' && (
          <div className="space-y-2">
            <Label htmlFor="result-value">Resultado</Label>
            <Input
              id="result-value"
              placeholder={RESULT_TYPE_PLACEHOLDERS[resultType]}
              value={resultValue}
              onChange={(e) => setResultValue(e.target.value)}
              className="text-lg font-mono"
            />
          </div>
        )}

        {/* Sensação */}
        <div className="space-y-3">
          <Label>Como você se sentiu?</Label>
          <div className="flex gap-2 justify-between">
            {FEELING_EMOJIS.map((emoji, index) => (
              <Button
                key={index}
                type="button"
                variant={feeling === index + 1 ? "default" : "outline"}
                className={`flex-1 h-auto py-3 flex flex-col gap-1 ${feeling === index + 1 ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setFeeling(index + 1)}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="text-[10px] leading-tight">{FEELING_LABELS[index]}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Comentário */}
        <div className="space-y-2">
          <Label htmlFor="notes">Comentário (opcional)</Label>
          <Textarea
            id="notes"
            placeholder="Como foi o treino? Algo que queira lembrar..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={280}
            rows={3}
          />
          <p className="text-xs text-muted-foreground text-right">
            {notes.length}/280
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {/* Submit */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleSubmit}
          disabled={isLoading || !resultType || !feeling}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Salvar e Receber Feedback
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
