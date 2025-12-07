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
