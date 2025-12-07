# YouTube MCP Server 🎥

Um servidor MCP (Model Context Protocol) para buscar vídeos no YouTube, especialmente otimizado para tutoriais de CrossFit.

## O que é MCP?

MCP (Model Context Protocol) é um protocolo aberto criado pela Anthropic que permite que LLMs (como Claude) se conectem a ferramentas e dados externos de forma padronizada.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Cliente   │────▶│  Servidor   │────▶│   YouTube   │
│  (Cursor,   │ MCP │    MCP      │     │    API      │
│   Claude)   │◀────│  (este!)    │◀────│             │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Ferramentas Disponíveis

### 1. `search_videos`
Busca vídeos no YouTube.

```json
{
  "query": "double under tutorial",
  "maxResults": 5,
  "language": "pt"
}
```

### 2. `get_crossfit_tutorial`
Busca tutoriais específicos para movimentos de CrossFit.

```json
{
  "movement": "muscle up",
  "level": "iniciante"  // iniciante | intermediario | avancado
}
```

### 3. `get_workout_videos`
Busca vídeos para múltiplos movimentos de um WOD.

```json
{
  "movements": ["clean", "box jump", "pull up"]
}
```

## Instalação

```bash
cd mcp/youtube-server
npm install
```

## Uso

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## Configuração no Cursor

Adicione ao seu `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "youtube": {
      "command": "node",
      "args": ["C:/workspace/wodscope/mcp/youtube-server/dist/index.js"]
    }
  }
}
```

Ou para desenvolvimento:

```json
{
  "mcpServers": {
    "youtube": {
      "command": "npx",
      "args": ["tsx", "C:/workspace/wodscope/mcp/youtube-server/src/index.ts"]
    }
  }
}
```

## Configuração no Claude Desktop

Adicione ao arquivo de configuração do Claude Desktop:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "youtube": {
      "command": "node",
      "args": ["/caminho/para/wodscope/mcp/youtube-server/dist/index.js"]
    }
  }
}
```

## Estrutura do Projeto

```
youtube-server/
├── package.json        # Dependências e scripts
├── tsconfig.json       # Configuração TypeScript
├── README.md           # Este arquivo
└── src/
    ├── index.ts        # Servidor MCP principal
    └── tools/
        └── search.ts   # Lógica de busca no YouTube
```

## Conceitos MCP Aprendidos

### 1. **Server**
O servidor MCP que expõe ferramentas e recursos.

### 2. **Tools**
Ações que o LLM pode executar (como funções).

### 3. **Transport**
Como cliente e servidor se comunicam (stdio, HTTP/SSE).

### 4. **Capabilities**
O que o servidor suporta (tools, resources, prompts).

## Próximos Passos

1. [ ] Adicionar YouTube Data API v3 para resultados melhores
2. [ ] Implementar cache de resultados
3. [ ] Adicionar mais filtros (duração, data)
4. [ ] Criar resources para vídeos favoritos

## Licença

MIT

