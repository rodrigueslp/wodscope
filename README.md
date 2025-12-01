# WodScope 🎯

Micro-SaaS para análise inteligente de WODs de CrossFit. Tire uma foto da lousa e receba estratégias personalizadas, cargas sugeridas e adaptações baseadas no seu perfil de atleta.

## Features

- 📸 **Análise de Lousa** - Capture a foto do WOD e receba análise instantânea
- 🎯 **Estratégias Personalizadas** - Dicas de pacing e quebra de séries
- 💪 **Cargas Sugeridas** - Baseadas nos seus PRs e capacidade
- 🛡️ **Adaptações de Lesão** - Proteja seu corpo com movimentos alternativos

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI + Radix UI
- **Icons**: Lucide React

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
src/
├── app/
│   ├── auth/           # Login/Register page
│   ├── onboarding/     # Profile setup wizard
│   ├── dashboard/      # Main dashboard
│   ├── analysis/[id]/  # WOD analysis view
│   ├── history/        # Analysis history
│   ├── profile/        # User profile & settings
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing page
├── components/
│   └── ui/             # Shadcn/UI components
└── lib/
    └── utils.ts        # Utility functions
```

## Design

- **Mobile-first** com PWA feel
- **Dark mode** por padrão (estética de academia/crossfit)
- **Cor primária**: Lime neon (#c8ff00)
- **Glass morphism** para cards

## License

MIT

