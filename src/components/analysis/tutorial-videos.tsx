"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, ExternalLink, Youtube, Loader2 } from "lucide-react"
import type { MovementTutorials, TutorialVideo } from "@/app/api/youtube/tutorials/route"

interface TutorialVideosProps {
  movements: string[]
}

// Mapeamento de movimentos para nomes em português
const MOVEMENT_NAMES: Record<string, string> = {
  'snatch': 'Snatch',
  'clean': 'Clean',
  'clean and jerk': 'Clean & Jerk',
  'jerk': 'Jerk',
  'deadlift': 'Deadlift',
  'squat': 'Squat',
  'back squat': 'Back Squat',
  'front squat': 'Front Squat',
  'overhead squat': 'Overhead Squat',
  'thruster': 'Thruster',
  'wall ball': 'Wall Ball',
  'box jump': 'Box Jump',
  'burpee': 'Burpee',
  'pull up': 'Pull-up',
  'pullup': 'Pull-up',
  'muscle up': 'Muscle-up',
  'ring muscle up': 'Ring Muscle-up',
  'bar muscle up': 'Bar Muscle-up',
  'handstand push up': 'HSPU',
  'handstand walk': 'Handstand Walk',
  'double under': 'Double Under',
  'toes to bar': 'Toes to Bar',
  'kettlebell swing': 'KB Swing',
  'kb swing': 'KB Swing',
  'rowing': 'Remo',
  'row': 'Remo',
  'run': 'Corrida',
  'running': 'Corrida',
  'rope climb': 'Rope Climb',
  'pistol': 'Pistol Squat',
  'push up': 'Push-up',
  'pushup': 'Push-up',
  'dumbbell': 'DB',
  'power clean': 'Power Clean',
  'power snatch': 'Power Snatch',
  'hang clean': 'Hang Clean',
  'hang snatch': 'Hang Snatch',
}

function getMovementDisplayName(movement: string): string {
  const lower = movement.toLowerCase()
  return MOVEMENT_NAMES[lower] || movement.charAt(0).toUpperCase() + movement.slice(1)
}

function VideoCard({ video }: { video: TutorialVideo }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
        {/* Thumbnail */}
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* YouTube badge */}
        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
          <Youtube className="w-3 h-3" />
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 space-y-0.5">
        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h4>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          {video.channel}
          <ExternalLink className="w-3 h-3" />
        </p>
      </div>
    </a>
  )
}

function MovementSection({ data }: { data: MovementTutorials }) {
  if (data.videos.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        {getMovementDisplayName(data.movement)}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {data.videos.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  )
}

export function TutorialVideos({ movements }: TutorialVideosProps) {
  const [tutorials, setTutorials] = useState<MovementTutorials[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTutorials = async () => {
      if (!movements || movements.length === 0) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch('/api/youtube/tutorials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movements })
        })

        if (!response.ok) {
          throw new Error('Erro ao buscar tutoriais')
        }

        const data = await response.json()
        setTutorials(data.tutorials || [])
      } catch (err) {
        console.error('Erro ao buscar tutoriais:', err)
        setError('Não foi possível carregar os tutoriais')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTutorials()
  }, [movements])

  // Não mostra nada se não houver movimentos
  if (!movements || movements.length === 0) {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className="glass border-red-500/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-500" />
            Tutoriais Recomendados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Buscando tutoriais...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return null // Silenciosamente não mostra se houver erro
  }

  // Filtra movimentos sem vídeos
  const tutorialsWithVideos = tutorials.filter(t => t.videos.length > 0)

  // Não mostra nada se não encontrou vídeos
  if (tutorialsWithVideos.length === 0) {
    return null
  }

  return (
    <Card className="glass border-red-500/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Youtube className="w-4 h-4 text-red-500" />
          Prepare-se para o WOD
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Revise a técnica antes de treinar
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {tutorialsWithVideos.map((tutorial) => (
          <MovementSection key={tutorial.movement} data={tutorial} />
        ))}
      </CardContent>
    </Card>
  )
}

