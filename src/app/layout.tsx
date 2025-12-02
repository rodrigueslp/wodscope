import type { Metadata, Viewport } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import "./globals.css"
import { InstallPrompt } from "@/components/pwa"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
})

export const metadata: Metadata = {
  title: "WodScope - Coach de CrossFit IA",
  description: "Seu coach pessoal de CrossFit com Inteligência Artificial. Analise WODs, receba estratégias personalizadas e acompanhe seu progresso.",
  manifest: "/manifest.json",
  applicationName: "WodScope",
  keywords: ["crossfit", "wod", "treino", "fitness", "coach", "ia", "inteligência artificial"],
  authors: [{ name: "WodScope" }],
  creator: "WodScope",
  publisher: "WodScope",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "WodScope",
    startupImage: [
      {
        url: "/splash/splash-1170x2532.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "WodScope",
    title: "WodScope - Coach de CrossFit IA",
    description: "Analise sua lousa de CrossFit e receba estratégias personalizadas baseadas no seu perfil.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WodScope - Coach de CrossFit IA",
    description: "Analise sua lousa de CrossFit e receba estratégias personalizadas.",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
    { media: "(prefers-color-scheme: light)", color: "#84cc16" },
  ],
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="WodScope" />
        
        {/* Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-167.png" />
        
        {/* Splash Screens para iOS */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-1170x2532.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/splash-1125x2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased min-h-screen bg-background`}>
        <div className="relative min-h-screen">
          {/* Background gradient effect */}
          <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-background">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[100px]" />
          </div>
          <main className="relative z-10">
            {children}
          </main>
          
          {/* PWA Install Prompt */}
          <InstallPrompt />
        </div>
      </body>
    </html>
  )
}
