"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  Target, 
  Clock, 
  Settings,
  Dumbbell,
  AlertTriangle,
  Save,
  LogOut,
  Crown
} from "lucide-react"
import { getProfile, upsertProfile } from "@/actions/profile"
import { signOut } from "@/actions/auth"
import { checkCredits, type CreditStatus } from "@/actions/credits"
import { SubscriptionBadge } from "@/components/paywall"
import type { Profile } from "@/lib/database.types"

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    squat: "",
    deadlift: "",
    snatch: "",
    clean: "",
    injuries: ""
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileResult, creditsResult] = await Promise.all([
          getProfile(),
          checkCredits()
        ])

        const profileData = profileResult.data as Profile | null
        if (profileData) {
          setProfile(profileData)
          setFormData({
            name: profileData.full_name || "",
            squat: profileData.prs?.squat?.toString() || "",
            deadlift: profileData.prs?.deadlift?.toString() || "",
            snatch: profileData.prs?.snatch?.toString() || "",
            clean: profileData.prs?.clean?.toString() || "",
            injuries: profileData.injuries || ""
          })
        }
        setCreditStatus(creditsResult)
      } catch (err) {
        console.error('Erro ao carregar perfil:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const result = await upsertProfile({
        full_name: formData.name,
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
      } else {
        setIsEditing(false)
        // Recarregar perfil
        const updated = await getProfile()
        const updatedData = updated.data as Profile | null
        if (updatedData) setProfile(updatedData)
      }
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      window.location.href = '/auth'
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="font-bold text-lg">Perfil</h1>
          </div>
          {!isEditing ? (
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
              Editar
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Salvar
                </>
              )}
            </Button>
          )}
        </div>
      </header>

      {/* Profile Content */}
      <main className="flex-1 px-6 py-6 space-y-6">
        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 border-4 border-primary/20 mb-4">
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
              {getInitials(profile?.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{profile?.full_name || 'Atleta'}</h2>
            {creditStatus && <SubscriptionBadge isPro={creditStatus.isPro} />}
          </div>
        </div>

        {/* Subscription Status */}
        <Card className="glass border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1">
                {creditStatus?.isPro ? (
                  <>
                    <p className="font-medium text-sm text-orange-400">Plano PRO</p>
                    <p className="text-xs text-muted-foreground">Análises ilimitadas</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-sm">Plano Gratuito</p>
                    <p className="text-xs text-muted-foreground">
                      {creditStatus?.credits || 0} crédito{(creditStatus?.credits || 0) !== 1 ? 's' : ''} disponível{(creditStatus?.credits || 0) !== 1 ? 'is' : ''}
                    </p>
                  </>
                )}
              </div>
              {creditStatus?.isPro ? (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={async () => {
                    const res = await fetch('/api/stripe/portal', { method: 'POST' })
                    const data = await res.json()
                    if (data.url) window.location.href = data.url
                  }}
                >
                  Gerenciar
                </Button>
              ) : (
                <Button 
                  size="sm"
                  onClick={async () => {
                    const res = await fetch('/api/stripe/create-checkout', { method: 'POST' })
                    const data = await res.json()
                    if (data.url) window.location.href = data.url
                  }}
                >
                  Upgrade
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
            </div>
          </CardContent>
        </Card>

        {/* PRs */}
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-primary" />
              Seus PRs (kg)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="squat" className="text-xs">Back Squat</Label>
                <Input
                  id="squat"
                  name="squat"
                  type="number"
                  value={formData.squat}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`text-center ${!isEditing ? "bg-muted" : ""}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadlift" className="text-xs">Deadlift</Label>
                <Input
                  id="deadlift"
                  name="deadlift"
                  type="number"
                  value={formData.deadlift}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`text-center ${!isEditing ? "bg-muted" : ""}`}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="snatch" className="text-xs">Snatch</Label>
                <Input
                  id="snatch"
                  name="snatch"
                  type="number"
                  value={formData.snatch}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`text-center ${!isEditing ? "bg-muted" : ""}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clean" className="text-xs">Clean & Jerk</Label>
                <Input
                  id="clean"
                  name="clean"
                  type="number"
                  value={formData.clean}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`text-center ${!isEditing ? "bg-muted" : ""}`}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Injuries */}
        <Card className="glass">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Lesões e Limitações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="injuries"
              name="injuries"
              value={formData.injuries}
              onChange={handleChange}
              disabled={!isEditing}
              className={`min-h-[100px] ${!isEditing ? "bg-muted" : ""}`}
              placeholder="Descreva suas lesões ou limitações..."
            />
          </CardContent>
        </Card>

        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full text-red-400 border-red-400/20 hover:bg-red-400/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair da conta
        </Button>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border px-6 py-3 safe-area-inset-bottom">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Target className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/history" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Clock className="w-5 h-5" />
            <span className="text-xs">Histórico</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-primary">
            <Settings className="w-5 h-5" />
            <span className="text-xs font-medium">Perfil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}
