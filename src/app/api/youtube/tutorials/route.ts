import { NextRequest, NextResponse } from 'next/server'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

interface YouTubeSearchResult {
  items?: {
    id: { videoId: string }
    snippet: {
      title: string
      channelTitle: string
      thumbnails: {
        medium: { url: string; width: number; height: number }
        high: { url: string; width: number; height: number }
      }
    }
  }[]
}

export interface TutorialVideo {
  id: string
  title: string
  channel: string
  thumbnail: string
  url: string
}

export interface MovementTutorials {
  movement: string
  videos: TutorialVideo[]
}

/**
 * Busca tutoriais no YouTube para movimentos de CrossFit
 * POST /api/youtube/tutorials
 * Body: { movements: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const { movements } = await request.json() as { movements: string[] }

    if (!movements || !Array.isArray(movements) || movements.length === 0) {
      return NextResponse.json(
        { error: 'Lista de movimentos é obrigatória' },
        { status: 400 }
      )
    }

    if (!YOUTUBE_API_KEY) {
      console.error('YOUTUBE_API_KEY não configurada')
      return NextResponse.json(
        { error: 'API do YouTube não configurada' },
        { status: 500 }
      )
    }

    // Limitar a 5 movimentos para não sobrecarregar
    const limitedMovements = movements.slice(0, 5)
    
    const results: MovementTutorials[] = await Promise.all(
      limitedMovements.map(async (movement) => {
        const videos = await searchYouTubeTutorial(movement)
        return {
          movement,
          videos
        }
      })
    )

    return NextResponse.json({ tutorials: results })

  } catch (error) {
    console.error('Erro ao buscar tutoriais:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar tutoriais' },
      { status: 500 }
    )
  }
}

/**
 * Busca vídeos de tutorial para um movimento específico
 */
async function searchYouTubeTutorial(movement: string): Promise<TutorialVideo[]> {
  try {
    // Query otimizada para CrossFit
    const query = `${movement} crossfit tutorial technique`
    
    const url = new URL('https://www.googleapis.com/youtube/v3/search')
    url.searchParams.set('part', 'snippet')
    url.searchParams.set('q', query)
    url.searchParams.set('type', 'video')
    url.searchParams.set('maxResults', '2')
    url.searchParams.set('relevanceLanguage', 'pt')
    url.searchParams.set('key', YOUTUBE_API_KEY!)

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      console.error(`YouTube API error: ${response.status}`)
      return []
    }

    const data: YouTubeSearchResult = await response.json()
    
    if (!data.items || data.items.length === 0) {
      return []
    }

    return data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }))

  } catch (error) {
    console.error(`Erro ao buscar tutorial para ${movement}:`, error)
    return []
  }
}

