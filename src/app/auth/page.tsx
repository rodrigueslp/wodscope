"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, ArrowLeft, Mail, Lock, User, Eye, EyeOff, CheckCircle, MailCheck } from "lucide-react"
import { signIn, signUp, signInWithGoogle, signInWithGitHub } from "@/actions/auth"

export default function AuthPage() {
  const searchParams = useSearchParams()
  const [isLogin, setIsLogin] = useState(searchParams.get("mode") !== "register")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

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

      // Se precisa confirmar email
      if ('needsEmailConfirmation' in result && result.needsEmailConfirmation) {
        setError(null)
        setRegisteredEmail(formData.get('email') as string)
        setEmailSent(true)
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

  const handleGitHubLogin = async () => {
    setIsLoading(true)
    try {
      const result = await signInWithGitHub()
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }
      if (result?.url) {
        window.location.href = result.url
      }
    } catch {
      setError('Erro ao conectar com GitHub')
      setIsLoading(false)
    }
  }

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

      {/* Email Confirmation Success */}
      {emailSent && (
        <Card className="w-full max-w-sm mx-auto glass border-green-500/20 mb-6">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <MailCheck className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-lg font-bold mb-2">Verifique seu email!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enviamos um link de confirmação para:
            </p>
            <p className="font-medium text-primary mb-4 break-all">
              {registeredEmail}
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Clique no link do email
              </p>
              <p className="flex items-center gap-2 justify-center">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Volte aqui e faça login
              </p>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-6"
              onClick={() => {
                setEmailSent(false)
                setIsLogin(true)
              }}
            >
              <Mail className="w-4 h-4 mr-2" />
              Ir para Login
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Não recebeu? Verifique a pasta de spam.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Auth Card */}
      {!emailSent && (
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

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              type="button" 
              className="h-11"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </Button>
            <Button 
              variant="outline" 
              type="button" 
              className="h-11"
              onClick={handleGitHubLogin}
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              GitHub
            </Button>
          </div>
        </CardContent>
      </Card>
      )}

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
