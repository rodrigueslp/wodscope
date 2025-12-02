"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, ArrowLeft, Mail, Lock, User, Eye, EyeOff } from "lucide-react"
import { signIn, signUp, signInWithGoogle } from "@/actions/auth"

function AuthForm() {
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "register")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    try {
      const result = isLogin 
        ? await signIn(formData)
        : await signUp(formData)

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }
      
      // Redirect no cliente após sucesso
      if (result?.success && result?.redirectTo) {
        window.location.href = result.redirectTo
      }
    } catch (err) {
      console.error('Erro no submit:', err)
      setError('Erro ao processar. Tente novamente.')
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithGoogle()
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }
      if (result?.url) {
        window.location.href = result.url
      }
    } catch {
      setError('Erro ao conectar com Google')
      setIsLoading(false)
    }
  }


  return (
    <Card className="w-full max-w-sm mx-auto glass">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl">
            {isLogin ? "Bem-vindo de volta" : "Criar conta"}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? "Entre com suas credenciais para continuar" 
              : "Preencha os dados para começar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="name"
                    name="name"
                    placeholder="Seu nome"
                    className="pl-10"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="email"
                  name="email"
                  type="email" 
                  placeholder="seu@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isLogin && (
              <button type="button" className="text-xs text-primary hover:underline">
                Esqueceu a senha?
              </button>
            )}

            <Button 
              type="submit" 
              size="lg" 
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                isLogin ? "Entrar" : "Criar conta"
              )}
            </Button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              {isLogin ? "Não tem conta? " : "Já tem conta? "}
            </span>
            <button 
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
              }}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? "Criar conta" : "Entrar"}
            </button>
          </div>

          {/* Social Login Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
            </div>
          </div>

          {/* Google Login Button */}
          <Button 
            variant="outline" 
            type="button" 
            className="w-full h-11"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </Button>
        </CardContent>
      </Card>
  )
}

function AuthLoading() {
  return (
    <Card className="w-full max-w-sm mx-auto glass">
      <CardContent className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </CardContent>
    </Card>
  )
}

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Voltar</span>
      </Link>

      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
          <Target className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">
          Wod<span className="text-primary">Scope</span>
        </h1>
      </div>

      {/* Auth Form with Suspense */}
      <Suspense fallback={<AuthLoading />}>
        <AuthForm />
      </Suspense>

      {/* Terms */}
      <p className="text-center text-xs text-muted-foreground mt-8 max-w-sm mx-auto">
        Ao continuar, você concorda com nossos{" "}
        <a href="#" className="text-primary hover:underline">Termos de Uso</a>
        {" "}e{" "}
        <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
      </p>
    </div>
  )
}
