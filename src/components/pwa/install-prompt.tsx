"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, X, Share, Plus } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSPrompt, setShowIOSPrompt] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
      return
    }

    // Verificar se já foi dispensado recentemente
    const dismissed = localStorage.getItem("pwa-prompt-dismissed")
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) return // Não mostrar por 7 dias
    }

    // Detectar iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isInStandaloneMode = window.matchMedia("(display-mode: standalone)").matches

    if (isIOS && !isInStandaloneMode) {
      // Mostrar prompt customizado para iOS após 3 segundos
      setTimeout(() => setShowIOSPrompt(true), 3000)
    }

    // Listener para Android/Desktop
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    setShowIOSPrompt(false)
    localStorage.setItem("pwa-prompt-dismissed", new Date().toISOString())
  }

  if (isInstalled) return null

  // Prompt para Android/Desktop
  if (showPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
        <Card className="glass border-primary/30 shadow-lg shadow-primary/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm">Instalar WodScope</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Adicione à sua tela inicial para acesso rápido
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 -mt-1 -mr-1"
                onClick={handleDismiss}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleDismiss}
              >
                Agora não
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleInstall}
              >
                <Download className="w-4 h-4 mr-1" />
                Instalar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prompt customizado para iOS
  if (showIOSPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
        <Card className="glass border-primary/30 shadow-lg shadow-primary/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm">Instalar WodScope</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Adicione à sua tela inicial para acesso rápido
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 -mt-1 -mr-1"
                onClick={handleDismiss}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Instruções para iOS */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">1</div>
                <span className="text-muted-foreground">
                  Toque em <Share className="w-4 h-4 inline mx-1 text-primary" /> Compartilhar
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-muted-foreground">
                  Toque em <Plus className="w-4 h-4 inline mx-1 text-primary" /> Adicionar à Tela de Início
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={handleDismiss}
            >
              Entendi
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

