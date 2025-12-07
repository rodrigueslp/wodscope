/**
 * YouTube Search Tool
 *
 * Busca vídeos no YouTube usando a YouTube Data API v3 oficial
 * Requer uma API key do Google Cloud Console
 */
export interface YouTubeVideo {
    id: string;
    title: string;
    channel: string;
    thumbnail: string;
    url: string;
    description: string;
    duration?: string;
    viewCount?: string;
    publishedAt?: string;
}
export interface SearchParams {
    query: string;
    maxResults?: number;
    language?: string;
}
/**
 * Busca vídeos no YouTube usando a API oficial v3
 */
export declare function searchYouTubeVideos(params: SearchParams): Promise<YouTubeVideo[]>;
/**
 * Gera queries de busca otimizadas para movimentos de CrossFit
 */
export declare function generateCrossFitQueries(movements: string[]): string[];
