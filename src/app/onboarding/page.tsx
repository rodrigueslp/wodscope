"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Dumbbell, AlertTriangle, ArrowRight, User, Ruler } from "lucide-react"
import { upsertProfile } from "@/actions/profile"
import { GENDER_LABELS, EXPERIENCE_LABELS, type Gender, type ExperienceLevel } from "@/lib/database.types"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "" as Gender | "",
    height: "",
    experience: "" as ExperienceLevel | "",
    squat: "",
    deadlift: "",
    snatch: "",
    clean: "",
    injuries: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  // Converte nível de experiência para anos aproximados
  const getExperienceYears = (level: ExperienceLevel | ""): number | undefined => {
    const mapping: Record<ExperienceLevel, number> = {
      beginner: 0.5,
      intermediate: 2,
      advanced: 4,
      elite: 7
    }
    return level ? mapping[level] : undefined
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await upsertProfile({
        full_name: formData.name,
        age: formData.age ? Number(formData.age) : undefined,
        gender: formData.gender || undefined,
        height: formData.height ? Number(formData.height) : undefined,
        experience_years: getExperienceYears(formData.experience),
        prs: {
          squat: formData.squat ? Number(formData.squat) : undefined,
          deadlift: formData.deadlift ? Number(formData.deadlift) : undefined,
          snatch: formData.snatch ? Number(formData.snatch) : undefined,
          clean: formData.clean ? Number(formData.clean) : undefined,
        },
        injuries: formData.injuries || undefined,
      })

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      router.push("/dashboard")
    } catch {
      setError("Erro ao salvar perfil. Tente novamente.")
      setIsLoading(false)
    }
  }

  const totalSteps = 4
  
  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1)
    else handleSubmit()
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <Target className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-xl font-bold mb-2">Configure seu Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Precisamos de algumas informações para personalizar sua experiência
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step 
                ? "w-8 bg-primary" 
                : i < step 
                  ? "w-8 bg-primary/50" 
                  : "w-2 bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center max-w-sm mx-auto">
          {error}
        </div>
      )}

      {/* Form Card */}
      <Card className="w-full max-w-sm mx-auto glass flex-1">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            {step === 1 && <User className="w-5 h-5 text-primary" />}
            {step === 2 && <Ruler className="w-5 h-5 text-primary" />}
            {step === 3 && <Dumbbell className="w-5 h-5 text-primary" />}
            {step === 4 && <AlertTriangle className="w-5 h-5 text-primary" />}
            <CardTitle className="text-lg">
              {step === 1 && "Informações Básicas"}
              {step === 2 && "Dados Físicos"}
              {step === 3 && "Seus PRs"}
              {step === 4 && "Lesões e Limitações"}
            </CardTitle>
          </div>
          <CardDescription>
            {step === 1 && "Vamos começar com o básico"}
            {step === 2 && "Isso ajuda a IA a personalizar as sugestões"}
            {step === 3 && "Informe seus Personal Records em kg"}
            {step === 4 && "Alguma lesão ou limitação que devemos considerar?"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Name & Gender */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Como podemos te chamar?"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label>Sexo</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(GENDER_LABELS) as [Gender, string][]).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, gender: value }))}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        formData.gender === value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          {/* Step 2: Age, Height, Experience */}
          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="age">Idade</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="Ex: 30"
                    value={formData.age}
                    onChange={handleChange}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input
                    id="height"
                    name="height"
                    type="number"
                    placeholder="Ex: 175"
                    value={formData.height}
                    onChange={handleChange}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tempo de Treino</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.entries(EXPERIENCE_LABELS) as [ExperienceLevel, string][]).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, experience: value }))}
                      className={`p-3 rounded-lg border text-xs font-medium transition-all ${
                        formData.experience === value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 3: PRs */}
          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="squat">Back Squat (kg)</Label>
                  <Input
                    id="squat"
                    name="squat"
                    type="number"
                    placeholder="Ex: 120"
                    value={formData.squat}
                    onChange={handleChange}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadlift">Deadlift (kg)</Label>
                  <Input
                    id="deadlift"
                    name="deadlift"
                    type="number"
                    placeholder="Ex: 150"
                    value={formData.deadlift}
                    onChange={handleChange}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="snatch">Snatch (kg)</Label>
                  <Input
                    id="snatch"
                    name="snatch"
                    type="number"
                    placeholder="Ex: 70"
                    value={formData.snatch}
                    onChange={handleChange}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clean">Clean & Jerk (kg)</Label>
                  <Input
                    id="clean"
                    name="clean"
                    type="number"
                    placeholder="Ex: 90"
                    value={formData.clean}
                    onChange={handleChange}
                    className="h-12"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 Deixe em branco se não souber. Você pode atualizar depois.
              </p>
            </>
          )}

          {/* Step 4: Injuries */}
          {step === 4 && (
            <div className="space-y-2">
              <Label htmlFor="injuries">Lesões ou Limitações</Label>
              <Textarea
                id="injuries"
                name="injuries"
                placeholder="Ex: Tendinite no ombro direito, dor lombar ao fazer deadlift pesado..."
                value={formData.injuries}
                onChange={handleChange}
                className="min-h-[150px]"
              />
              <p className="text-xs text-muted-foreground">
                💡 Essas informações ajudam a IA a sugerir adaptações seguras.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="w-full max-w-sm mx-auto mt-6 flex gap-3">
        {step > 1 && (
          <Button 
            variant="outline" 
            onClick={prevStep}
            className="flex-1 h-12"
            disabled={isLoading}
          >
            Voltar
          </Button>
        )}
        <Button 
          onClick={nextStep}
          disabled={isLoading}
          className={`h-12 ${step === 1 ? "w-full" : "flex-1"}`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : step === totalSteps ? (
            "Finalizar"
          ) : (
            <>
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>

      {/* Skip */}
      {step < totalSteps && (
        <button 
          onClick={() => router.push("/dashboard")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-4 mx-auto"
          disabled={isLoading}
        >
          Pular por agora
        </button>
      )}
    </div>
  )
}
