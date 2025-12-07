#!/usr/bin/env node
/**
 * YouTube MCP Server
 *
 * Um servidor MCP que fornece ferramentas para buscar vídeos no YouTube.
 * Útil para encontrar tutoriais de movimentos de CrossFit.
 *
 * Ferramentas disponíveis:
 * - search_videos: Busca vídeos no YouTube
 * - get_crossfit_tutorial: Busca tutorial específico para um movimento de CrossFit
 * - get_workout_videos: Busca vídeos para múltiplos movimentos de um WOD
 *
 * Configuração:
 * 1. Crie um arquivo .env com YOUTUBE_API_KEY
 * 2. npm install
 * 3. npm run build
 * 4. Configure no seu cliente MCP (Cursor, Claude Desktop, etc.)
 */
import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { searchYouTubeVideos, generateCrossFitQueries } from './tools/search.js';
// Definição das ferramentas disponíveis
const TOOLS = [
    {
        name: 'search_videos',
        description: 'Busca vídeos no YouTube. Útil para encontrar tutoriais, demonstrações e conteúdo educativo.',
        inputSchema: {
            type: 'object',
            properties: {
                query: {
                    type: 'string',
                    description: 'Termo de busca para encontrar vídeos'
                },
                maxResults: {
                    type: 'number',
                    description: 'Número máximo de resultados (padrão: 5)',
                    default: 5
                },
                language: {
                    type: 'string',
                    description: 'Código do idioma para resultados (padrão: pt)',
                    default: 'pt'
                }
            },
            required: ['query']
        }
    },
    {
        name: 'get_crossfit_tutorial',
        description: 'Busca tutoriais específicos para movimentos de CrossFit. Retorna vídeos com foco em técnica e execução correta.',
        inputSchema: {
            type: 'object',
            properties: {
                movement: {
                    type: 'string',
                    description: 'Nome do movimento de CrossFit (ex: muscle up, clean, snatch, double under)'
                },
                level: {
                    type: 'string',
                    enum: ['iniciante', 'intermediario', 'avancado'],
                    description: 'Nível de dificuldade do tutorial',
                    default: 'iniciante'
                }
            },
            required: ['movement']
        }
    },
    {
        name: 'get_workout_videos',
        description: 'Busca vídeos relacionados a múltiplos movimentos de um WOD. Ideal para preparação pré-treino.',
        inputSchema: {
            type: 'object',
            properties: {
                movements: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Lista de movimentos do WOD'
                }
            },
            required: ['movements']
        }
    }
];
// Formata resultados de vídeos para exibição
function formatVideoResults(videos) {
    if (videos.length === 0) {
        return 'Nenhum vídeo encontrado.';
    }
    return videos.map((video, index) => `${index + 1}. **${video.title}**
   Canal: ${video.channel}
   Link: ${video.url}
   ${video.description ? `Descrição: ${video.description.substring(0, 100)}...` : ''}`).join('\n\n');
}
// Cria e configura o servidor MCP
const server = new Server({
    name: 'youtube-mcp-server',
    version: '1.0.0',
}, {
    capabilities: {
        tools: {},
    },
});
// Handler para listar ferramentas disponíveis
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
});
// Handler para executar ferramentas
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case 'search_videos': {
                const { query, maxResults = 5, language = 'pt' } = args;
                const videos = await searchYouTubeVideos({ query, maxResults, language });
                return {
                    content: [
                        {
                            type: 'text',
                            text: `## Resultados para "${query}"\n\n${formatVideoResults(videos)}`
                        }
                    ]
                };
            }
            case 'get_crossfit_tutorial': {
                const { movement, level = 'iniciante' } = args;
                const levelQuery = {
                    'iniciante': 'beginner tutorial',
                    'intermediario': 'progression tips',
                    'avancado': 'advanced technique'
                }[level] || 'tutorial';
                const query = `${movement} ${levelQuery} crossfit`;
                const videos = await searchYouTubeVideos({ query, maxResults: 3 });
                return {
                    content: [
                        {
                            type: 'text',
                            text: `## Tutorial de ${movement} (${level})\n\n${formatVideoResults(videos)}`
                        }
                    ]
                };
            }
            case 'get_workout_videos': {
                const { movements } = args;
                const queries = generateCrossFitQueries(movements);
                const allVideos = [];
                for (const movement of movements.slice(0, 3)) {
                    const videos = await searchYouTubeVideos({
                        query: `${movement} tutorial crossfit`,
                        maxResults: 2
                    });
                    allVideos.push({ movement, videos });
                }
                const formatted = allVideos.map(({ movement, videos }) => `### ${movement}\n${formatVideoResults(videos)}`).join('\n\n---\n\n');
                return {
                    content: [
                        {
                            type: 'text',
                            text: `## Tutoriais para o WOD\n\n${formatted}`
                        }
                    ]
                };
            }
            default:
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Ferramenta desconhecida: ${name}`
                        }
                    ],
                    isError: true
                };
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: 'text',
                    text: `Erro ao executar ${name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
                }
            ],
            isError: true
        };
    }
});
// Inicia o servidor
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('YouTube MCP Server iniciado!');
}
main().catch((error) => {
    console.error('Erro fatal:', error);
    process.exit(1);
});
