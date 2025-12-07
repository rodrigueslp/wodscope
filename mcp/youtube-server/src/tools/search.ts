/**
 * YouTube Search Tool
 * 
 * Busca vídeos no YouTube usando a YouTube Data API v3 oficial
 * Requer uma API key do Google Cloud Console
 */

export interface YouTubeVideo {
  id: string
  title: string
  channel: string
  thumbnail: string
  url: string
  description: string
  duration?: string
  viewCount?: string
  publishedAt?: string
}

export interface SearchParams {
  query: string
  maxResults?: number
  language?: string
}

// Pega a API key do ambiente
function getApiKey(): string | null {
  return process.env.YOUTUBE_API_KEY || null
}

/**
 * Busca vídeos no YouTube usando a API oficial v3
 */
export async function searchYouTubeVideos(params: SearchParams): Promise<YouTubeVideo[]> {
  const { query, maxResults = 5, language = 'pt' } = params
  const apiKey = getApiKey()
  
  // Se não tiver API key, usa fallback
  if (!apiKey) {
    console.error('YOUTUBE_API_KEY não configurada. Usando fallback.')
    return getFallbackResults(query)
  }
  
  try {
    // Busca vídeos na API oficial do YouTube
    const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
    searchUrl.searchParams.set('part', 'snippet')
    searchUrl.searchParams.set('q', query)
    searchUrl.searchParams.set('type', 'video')
    searchUrl.searchParams.set('maxResults', String(maxResults))
    searchUrl.searchParams.set('relevanceLanguage', language)
    searchUrl.searchParams.set('order', 'relevance')
    searchUrl.searchParams.set('safeSearch', 'moderate')
    searchUrl.searchParams.set('key', apiKey)
    
    const response = await fetch(searchUrl.toString(), {
      signal: AbortSignal.timeout(10000),
      headers: { 'Accept': 'application/json' }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Erro na API do YouTube:', response.status, errorData)
      return getFallbackResults(query)
    }
    
    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      return getFallbackResults(query)
    }
    
    const videos: YouTubeVideo[] = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.high?.url || 
                 item.snippet.thumbnails?.medium?.url || 
                 item.snippet.thumbnails?.default?.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      description: item.snippet.description || '',
      publishedAt: item.snippet.publishedAt
    }))
    
    return videos
    
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error)
    return getFallbackResults(query)
  }
}

/**
 * Retorna resultados de fallback quando a API não está disponível
 */
function getFallbackResults(query: string): YouTubeVideo[] {
  const searchQuery = encodeURIComponent(`${query} tutorial crossfit`)
  return [{
    id: 'search',
    title: `🔍 Buscar "${query}" no YouTube`,
    channel: 'YouTube',
    thumbnail: '',
    url: `https://www.youtube.com/results?search_query=${searchQuery}`,
    description: 'Clique para buscar diretamente no YouTube'
  }]
}

/**
 * Gera queries de busca otimizadas para movimentos de CrossFit
 */
export function generateCrossFitQueries(movements: string[]): string[] {
  const queries: string[] = []
  
  const queryTemplates = [
    (m: string) => `${m} tutorial técnica`,
    (m: string) => `${m} como fazer crossfit`,
    (m: string) => `${m} dicas iniciantes`,
    (m: string) => `${m} erros comuns evitar`
  ]
  
  for (const movement of movements.slice(0, 3)) { // Limita a 3 movimentos
    queries.push(queryTemplates[0](movement))
  }
  
  return queries
}

