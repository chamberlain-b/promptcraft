# Prompt-Craft Project Instructions

## Project Overview
Prompt-Craft is a React-based application for crafting and managing AI prompts with enhancement capabilities.

## Tech Stack
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons

## Key Project Files
- [src/App.tsx](src/App.tsx) - Main application component (TypeScript)
- [src/components/](src/components/) - React components (all .tsx)
- [src/services/](src/services/) - Service layer (all .ts)
- [src/context/](src/context/) - Context providers (all .tsx)
- [.env.example](.env.example) - Environment variables template

## Architecture
```
src/
├── components/     # React components (TypeScript)
├── services/       # Business logic services (TypeScript)
├── context/        # React Context providers (TypeScript)
├── data/           # Constants and static data (TypeScript)
└── App.tsx         # Application entry point
```

## Development Guidelines

### Code Style
- **TypeScript Only**: All source files are now TypeScript (.ts/.tsx)
- Follow existing component structure and patterns
- Use Tailwind CSS classes for styling
- Maintain responsive design principles
- Define proper interfaces for all props and state
- Use type inference where appropriate, explicit types where necessary

### Environment Variables
- Never commit actual API keys to the repository
- Always use `.env.example` as a template for required variables
- Update `.env.example` when adding new environment variables

### Git Workflow
- Current branch: master
- Ensure code builds successfully before committing
- Write clear, concise commit messages

## Commands
- Development: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`

## Special Considerations
- This is a premium workflow application with AI enhancement features
- AI enhancement mode is production-ready
- Focus on user experience and intuitive interfaces
- **TypeScript Migration**: Completed October 12, 2025 - all source code now fully typed
- Premium features have been removed - see [PREMIUM_REMOVAL.md](PREMIUM_REMOVAL.md)

## Recent Updates
- ✅ **TypeScript Migration Complete** (Oct 12, 2025)
  - All .js/.jsx files converted to .ts/.tsx
  - Full type safety across services, components, and context
  - Zero build errors or warnings
  - See [TYPESCRIPT_MIGRATION.md](TYPESCRIPT_MIGRATION.md) for details
